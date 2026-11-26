const DEMO_ACCOUNTS = Object.freeze({
  "customer@urumaya.example": "customer",
  "demo.admin@urumaya.example": "admin",
  "demo.staff@urumaya.example": "staff",
});

const isDemoAccount = (user) => {
  if (!user) return false;

  return Object.hasOwn(DEMO_ACCOUNTS, user.email);
};

const restrictDemoAccess = (req, res, next) => {
  if (!isDemoAccount(req.user)) {
    return next();
  }

  req.isDemo = true;

  // Disable demo access when the feature is turned off
  if (process.env.ENABLE_DEMO_LOGIN !== "true") {
    return res.status(403).json({
      success: false,
      message: "Demo access is currently disabled.",
    });
  }

  // Prevent access to shared customer cart and orders
  const path = req.originalUrl.split("?")[0];

  if (
    req.user.role === "customer" &&
    /^\/api\/v1\/(cart|orders)(\/|$)/i.test(path)
  ) {
    return res.status(403).json({
      success: false,
      code: "DEMO_CUSTOMER_RESTRICTED",
      message:
        "Shopping and checkout are unavailable in demo mode.",
    });
  }

  // Allow read-only access
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    code: "DEMO_READ_ONLY",
    message:
      "This action is disabled in portfolio demo mode.",
  });
};

module.exports = {
  DEMO_ACCOUNTS,
  isDemoAccount,
  restrictDemoAccess,
};