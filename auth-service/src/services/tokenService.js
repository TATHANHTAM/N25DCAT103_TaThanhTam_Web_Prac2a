const crypto = require("crypto");
const jwt = require("jsonwebtoken");

function requireSecret(name) {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} phải có ít nhất 32 ký tự`);
  }
  return value;
}

function createAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: "access" },
    requireSecret("JWT_SECRET"),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" },
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: "refresh", nonce: crypto.randomUUID() },
    requireSecret("JWT_REFRESH_SECRET"),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
  );
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, requireSecret("JWT_REFRESH_SECRET"));
  if (payload.type !== "refresh") throw new Error("Sai loại token");
  return payload;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getTokenExpiry(token) {
  const decoded = jwt.decode(token);
  return new Date(decoded.exp * 1000);
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashToken,
  getTokenExpiry,
};

