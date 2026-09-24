function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(`[${new Date().toISOString()}]`, error);

  if (error.name === "ValidationError") {
    return res.status(422).json({ success: false, message: error.message });
  }
  if (error.name === "CastError") {
    return res.status(422).json({ success: false, message: "ID không hợp lệ" });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: "Mã đơn hàng đã tồn tại, vui lòng thử lại" });
  }

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Lỗi hệ thống",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

module.exports = errorHandler;

