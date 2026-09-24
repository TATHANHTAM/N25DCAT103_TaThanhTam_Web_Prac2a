const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  if (req.method === "OPTIONS") return next();

  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== "access") throw new Error("Sai loại token");
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

module.exports = authenticate;

