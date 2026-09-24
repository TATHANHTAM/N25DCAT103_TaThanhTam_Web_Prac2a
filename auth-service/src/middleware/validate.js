const { body, validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
    });
  }
  return next();
}

const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Tên phải dài từ 2 đến 100 ký tự"),
  body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Mật khẩu phải dài từ 8 đến 72 ký tự")
    .matches(/[a-z]/)
    .withMessage("Mật khẩu cần ít nhất một chữ thường")
    .matches(/[A-Z]/)
    .withMessage("Mật khẩu cần ít nhất một chữ hoa")
    .matches(/[0-9]/)
    .withMessage("Mật khẩu cần ít nhất một chữ số"),
  handleValidation,
];

const loginValidation = [
  body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  body("password").notEmpty().withMessage("Thiếu mật khẩu"),
  handleValidation,
];

const refreshValidation = [
  body("refreshToken").notEmpty().withMessage("Thiếu refreshToken"),
  handleValidation,
];

module.exports = { registerValidation, loginValidation, refreshValidation };

