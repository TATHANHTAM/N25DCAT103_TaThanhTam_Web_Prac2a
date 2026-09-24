const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((item) => item.trim()).filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));
app.use(express.json({ limit: "256kb" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorization: true } }));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
app.get("/health", (req, res) => res.json({ status: "ok", service: process.env.SERVICE_NAME || "auth-service" }));
app.use("/api/auth", authRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint không tồn tại" }));
app.use(errorHandler);

module.exports = app;

