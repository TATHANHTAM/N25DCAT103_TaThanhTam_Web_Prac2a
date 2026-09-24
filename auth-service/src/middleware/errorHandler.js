function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(`[${new Date().toISOString()}]`, error);

  if (error.code === "P2002") {
    return res.status(409).json({ success: false, message: "Email đã được sử dụng" });
  }

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Lỗi hệ thống",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

module.exports = errorHandler;

