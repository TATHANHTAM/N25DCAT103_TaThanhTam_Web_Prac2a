const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const productRoutes = require("./routes/productRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((item) => item.trim()).filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "Product Service API Docs",
  }),
);
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME || "product-service",
    uptime: process.uptime(),
  });
});

app.use("/api/products", productRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint không tồn tại" });
});

app.use(errorHandler);

module.exports = app;

