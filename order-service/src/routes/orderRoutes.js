const router = require("express").Router();
const {
  createOrder,
  getOrdersByCustomer,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  createOrderValidation,
  customerOrdersValidation,
  updateStatusValidation,
} = require("../middleware/validate");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderInput' }
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *       422:
 *         description: Dữ liệu không hợp lệ
 *       503:
 *         description: Product Service không khả dụng
 */
router.post("/", createOrderValidation, createOrder);

/**
 * @swagger
 * /api/orders/customer/{customerId}:
 *   get:
 *     summary: Lấy đơn hàng của khách hàng
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: integer }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: status, schema: { type: string, enum: [pending, confirmed, shipping, delivered, cancelled] } }
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *       403:
 *         description: Không có quyền
 */
router.get("/customer/:customerId", customerOrdersValidation, getOrdersByCustomer);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, shipping, delivered, cancelled] }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.patch("/:id/status", updateStatusValidation, updateOrderStatus);

module.exports = router;

