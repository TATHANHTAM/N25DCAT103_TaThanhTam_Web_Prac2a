const router = require("express").Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/productController");
const {
  idValidation,
  productCreateValidation,
  productUpdateValidation,
  productListValidation,
} = require("../middleware/validate");
const cacheResponse = require("../middleware/cache");
const upload = require("../middleware/upload");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10, maximum: 100 } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *       - { in: query, name: inStock, schema: { type: boolean } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [name, price, stock, createdAt, updatedAt] } }
 *       - { in: query, name: order, schema: { type: string, enum: [asc, desc] } }
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedProducts' }
 *       422: { $ref: '#/components/responses/ValidationError' }
 *   post:
 *     summary: Tạo sản phẩm
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201: { description: Tạo thành công }
 *       409: { description: Slug đã tồn tại }
 *       422: { $ref: '#/components/responses/ValidationError' }
 */
router.get("/", productListValidation, cacheResponse(300), getProducts);
router.post("/", productCreateValidation, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       404: { description: Không tìm thấy sản phẩm }
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200: { description: Cập nhật thành công }
 *       404: { description: Không tìm thấy sản phẩm }
 *       422: { $ref: '#/components/responses/ValidationError' }
 *   delete:
 *     summary: Ẩn sản phẩm (soft delete)
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200: { description: Đã ẩn sản phẩm }
 *       404: { description: Không tìm thấy sản phẩm }
 */
router.get("/:id", idValidation, cacheResponse(300), getProductById);
router.put("/:id", productUpdateValidation, updateProduct);
router.delete("/:id", idValidation, deleteProduct);

/**
 * @swagger
 * /api/products/{id}/image:
 *   post:
 *     summary: Upload ảnh sản phẩm lên Cloudinary
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200: { description: Upload thành công }
 *       503: { description: Cloudinary chưa được cấu hình }
 */
router.post("/:id/image", idValidation, upload.single("image"), uploadProductImage);

module.exports = router;

