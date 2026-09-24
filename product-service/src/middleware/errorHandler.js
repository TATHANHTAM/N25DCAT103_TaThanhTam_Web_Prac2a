function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  console.error(`[${new Date().toISOString()}]`, error);

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `${error.meta?.target || "Dữ liệu"} đã tồn tại`,
    });
  }

  if (error.code === "P2003") {
    return res.status(422).json({ success: false, message: "Danh mục không tồn tại" });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi" });
  }

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Lỗi hệ thống",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

module.exports = errorHandler;
