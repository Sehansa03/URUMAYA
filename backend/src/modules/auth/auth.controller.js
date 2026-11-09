
const User = require("./user.model");
const RefreshToken = require("./refreshToken.model");
const { registerSchema, loginSchema } = require("./auth.validation");

const {
  REFRESH_COOKIE_NAME,
  createAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshExpiry,
  refreshCookieOptions,
} = require("./auth.tokens");

// Register customer
const register = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details",
      });
    }

    const { fullName, email, password } = result.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// Login customer
const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login details",
      });
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: getRefreshExpiry(),
    });

    const accessToken = createAccessToken(user);

    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      refreshCookieOptions
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Refresh access token and rotate refresh token
const refresh = async (req, res) => {
  try {
    const oldToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!oldToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const now = new Date();
    const newToken = generateRefreshToken();

    // Atomically consume the old token to prevent simultaneous reuse
    const session = await RefreshToken.findOneAndUpdate(
      {
        tokenHash: hashRefreshToken(oldToken),
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      { $set: { revokedAt: now } },
      { returnDocument: "after" }
    );

    if (!session) {
      res.clearCookie(
        REFRESH_COOKIE_NAME,
        refreshCookieOptions
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh session",
      });
    }

    const user = await User.findById(session.user);

    if (!user || !user.isActive) {
      res.clearCookie(
        REFRESH_COOKIE_NAME,
        refreshCookieOptions
      );

      return res.status(401).json({
        success: false,
        message: "Account unavailable",
      });
    }

    // Preserve the original seven-day expiry
    await RefreshToken.create({
      user: user._id,
      tokenHash: hashRefreshToken(newToken),
      expiresAt: session.expiresAt,
    });

    const remainingMs = session.expiresAt.getTime() - Date.now();

    res.cookie(REFRESH_COOKIE_NAME, newToken, {
      ...refreshCookieOptions,
      maxAge: Math.max(0, remainingMs),
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: createAccessToken(user),
      },
    });
  } catch (error) {
    console.error("Refresh error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

// Logout current refresh session
const logout = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (token) {
      await RefreshToken.updateOne(
        { tokenHash: hashRefreshToken(token) },
        { $set: { revokedAt: new Date() } }
      );
    }

    res.clearCookie(
      REFRESH_COOKIE_NAME,
      refreshCookieOptions
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
