const { body, param, query, validationResult } = require("express-validator");

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

const createOrderValidation = [
  body("customerId").optional().isInt({ min: 1 }).withMessage("customerId không hợp lệ"),
  body("customerName").trim().notEmpty().withMessage("Tên khách hàng không được rỗng"),
  body("customerEmail").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  body("items").isArray({ min: 1 }).withMessage("Đơn hàng phải có ít nhất một sản phẩm"),
  body("items.*.productId").isInt({ min: 1 }).withMessage("productId không hợp lệ"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Số lượng phải là số nguyên dương"),
  body("items.*.productName").if(() => process.env.VALIDATE_PRODUCTS === "false").notEmpty().withMessage("Thiếu productName"),
  body("items.*.price").if(() => process.env.VALIDATE_PRODUCTS === "false").isFloat({ min: 0 }).withMessage("Giá không hợp lệ"),
  handleValidation,
];

const customerOrdersValidation = [
  param("customerId").isInt({ min: 1 }).withMessage("customerId không hợp lệ"),
  query("page").optional().isInt({ min: 1 }).withMessage("page không hợp lệ"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit phải từ 1 đến 100"),
  query("status")
    .optional()
    .isIn(["pending", "confirmed", "shipping", "delivered", "cancelled"])
    .withMessage("status không hợp lệ"),
  handleValidation,
];

const updateStatusValidation = [
  param("id").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
  body("status")
    .isIn(["pending", "confirmed", "shipping", "delivered", "cancelled"])
    .withMessage("status không hợp lệ"),
  handleValidation,
];

module.exports = { createOrderValidation, customerOrdersValidation, updateStatusValidation };

