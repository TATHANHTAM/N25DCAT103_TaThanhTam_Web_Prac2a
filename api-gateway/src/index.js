require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authenticate = require("./middleware/authenticate");

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((item) => item.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/health", (req, res) => res.json({ status: "ok", gateway: true, uptime: process.uptime() }));

function proxy(pathFilter, target, name, { forwardUser = false } = {}) {
  return createProxyMiddleware({
    pathFilter,
    target,
    changeOrigin: true,
    xfwd: true,
    on: {
      proxyReq(proxyReq, req) {
        if (forwardUser && req.user) {
          proxyReq.setHeader("x-user-id", String(req.user.sub));
          proxyReq.setHeader("x-user-role", req.user.role || "user");
        }
      },
      error(error, req, res) {
        if (!res.headersSent) {
          res.writeHead(503, { "Content-Type": "application/json" });
        }
        res.end(JSON.stringify({ success: false, message: `${name} không khả dụng` }));
      },
    },
  });
}

app.use(proxy("/api/auth", process.env.AUTH_SERVICE_URL || "http://localhost:3003", "Auth Service"));
app.use(proxy("/api/products", process.env.PRODUCT_SERVICE_URL || "http://localhost:3001", "Product Service"));

app.use("/api/orders", authenticate);
app.use(
  proxy(
    "/api/orders",
    process.env.ORDER_SERVICE_URL || "http://localhost:3002",
    "Order Service",
    { forwardUser: true },
  ),
);

app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint không tồn tại" }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
