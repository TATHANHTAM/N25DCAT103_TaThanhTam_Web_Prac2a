const router = require("express").Router();
const { register, login, refresh, me } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const { registerValidation, loginValidation, refreshValidation } = require("../middleware/validate");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201: { description: Đăng ký thành công }
 *       409: { description: Email đã tồn tại }
 *       422: { description: Dữ liệu không hợp lệ }
 */
router.post("/register", registerValidation, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200: { description: Đăng nhập thành công, trả về accessToken và refreshToken }
 *       401: { description: Sai thông tin đăng nhập }
 */
router.post("/login", loginValidation, login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Làm mới access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Cấp token mới thành công }
 *       401: { description: Refresh token không hợp lệ }
 */
router.post("/refresh", refreshValidation, refresh);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Thành công }
 *       401: { description: Chưa đăng nhập }
 */
router.get("/me", authenticate, me);

module.exports = router;

