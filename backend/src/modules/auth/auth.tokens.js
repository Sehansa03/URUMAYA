const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");

const REFRESH_TOKEN_DAYS = 7;
const REFRESH_COOKIE_NAME = "urumaya_refresh";

const createAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion ?? 0,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
      algorithm: "HS256",
    }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(48).toString("hex");
};

const hashRefreshToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const getRefreshExpiry = () => {
  return new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth",
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
};

module.exports = {
  REFRESH_COOKIE_NAME,
  createAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshExpiry,
  refreshCookieOptions,
};