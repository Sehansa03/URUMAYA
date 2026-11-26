const express = require("express");
const { rateLimit } = require("express-rate-limit");

const {
  verifyOrigin,
} = require("../../middleware/origin.middleware");

const {
  register,
  login,
  refresh,
  logout,
  demoLogin,
} = require("./auth.controller");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  isDemoAccount,
} = require("../../middleware/demo.middleware");

const router = express.Router();

// Limit repeated demo login requests
const demoLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many demo requests. Please try again later.",
  },
});

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Portfolio demo login
router.post(
  "/demo",
  verifyOrigin,
  demoLoginLimiter,
  demoLogin
);

// Refresh session and logout
router.post("/refresh", verifyOrigin, refresh);
router.post("/logout", verifyOrigin, logout);

// Protected user profile
router.get("/me", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        isDemo: isDemoAccount(req.user),
      },
    },
  });
});

module.exports = router;