
const express = require("express");
const { verifyOrigin } = require("../../middleware/origin.middleware");

const {
  register,
  login,
  refresh,
  logout,
} = require("./auth.controller");

const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Refresh session and logout
router.post("/refresh", verifyOrigin, refresh);
router.post("/logout", verifyOrigin, logout);

// Protected customer profile
router.get("/me", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

module.exports = router;
