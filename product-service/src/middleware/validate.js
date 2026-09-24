const { body, param, query, validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  return next();
}

const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID phải là số nguyên dương"),
  handleValidation,
];

const productCreateValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên sản phẩm không được rỗng")
    .isLength({ min: 2, max: 200 })
    .withMessage("Tên phải dài từ 2 đến 200 ký tự"),
  body("price").isFloat({ min: 0 }).withMessage("Giá phải là số không âm"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Số lượng phải là số nguyên không âm"),
  body("categoryId").optional({ nullable: true }).isInt({ min: 1 }).withMessage("categoryId không hợp lệ"),
  body("imageUrl").optional({ nullable: true }).isURL().withMessage("imageUrl không hợp lệ"),
  handleValidation,
];

const productUpdateValidation = [
  ...idValidation.slice(0, -1),
  body("name").optional().trim().isLength({ min: 2, max: 200 }).withMessage("Tên phải dài từ 2 đến 200 ký tự"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Giá phải là số không âm"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Số lượng phải là số nguyên không âm"),
  body("categoryId").optional({ nullable: true }).isInt({ min: 1 }).withMessage("categoryId không hợp lệ"),
  body("imageUrl").optional({ nullable: true }).isURL().withMessage("imageUrl không hợp lệ"),
  handleValidation,
];

const productListValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page phải là số nguyên dương"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit phải từ 1 đến 100"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice không hợp lệ"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice không hợp lệ"),
  query("inStock").optional().isBoolean().withMessage("inStock phải là true hoặc false"),
  query("sortBy").optional().isIn(["name", "price", "stock", "createdAt", "updatedAt"]).withMessage("sortBy không hợp lệ"),
  query("order").optional().isIn(["asc", "desc"]).withMessage("order phải là asc hoặc desc"),
  handleValidation,
];

module.exports = {
  handleValidation,
  idValidation,
  productCreateValidation,
  productUpdateValidation,
  productListValidation,
};

