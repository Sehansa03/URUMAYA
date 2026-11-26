const jwt = require("jsonwebtoken");
const User = require("../modules/auth/user.model");
const {
  restrictDemoAccess,
} = require("./demo.middleware");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET,
      { algorithms: ["HS256"] }
    );

    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive account",
      });
    }

    // Reject tokens from invalidated sessions
    if (
      (decoded.tokenVersion ?? 0) !==
      (user.tokenVersion ?? 0)
    ) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    req.user = user;
    return restrictDemoAccess(req, res, next);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { protect };