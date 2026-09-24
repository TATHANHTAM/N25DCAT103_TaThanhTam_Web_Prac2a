const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(Object.assign(new Error("Chỉ chấp nhận file ảnh"), { status: 422 }));
    }
    return callback(null, true);
  },
});

module.exports = upload;

