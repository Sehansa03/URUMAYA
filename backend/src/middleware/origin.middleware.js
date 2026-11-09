
const verifyOrigin = (req, res, next) => {
  const origin = req.get("Origin");

  // Non-browser requests may omit Origin.
  if (!origin) return next();

  const allowedOrigin =
    process.env.CLIENT_URL || "http://localhost:5173";

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  next();
};

module.exports = { verifyOrigin };
