const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashToken,
  getTokenExpiry,
} = require("../services/tokenService");

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function storeRefreshToken(user, refreshToken) {
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getTokenExpiry(refreshToken),
    },
  });
}

async function register(req, res, next) {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
      data: {
        name: req.body.name.trim(),
        email: req.body.email.toLowerCase(),
        passwordHash,
      },
    });

    return res.status(201).json({
      success: true,
      data: publicUser(user),
      message: "Đăng ký thành công",
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await storeRefreshToken(user, refreshToken);

    return res.json({
      success: true,
      data: { user: publicUser(user), accessToken, refreshToken },
    });
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const payload = verifyRefreshToken(req.body.refreshToken);
    const oldHash = hashToken(req.body.refreshToken);
    const savedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: oldHash },
      include: { user: true },
    });

    if (
      !savedToken ||
      savedToken.revokedAt ||
      savedToken.expiresAt <= new Date() ||
      savedToken.userId !== Number(payload.sub)
    ) {
      return res.status(401).json({ success: false, message: "Refresh token không hợp lệ" });
    }

    const accessToken = createAccessToken(savedToken.user);
    const refreshToken = createRefreshToken(savedToken.user);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: savedToken.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: savedToken.userId,
          tokenHash: hashToken(refreshToken),
          expiresAt: getTokenExpiry(refreshToken),
        },
      }),
    ]);

    return res.json({ success: true, data: { accessToken, refreshToken } });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.user.sub) } });
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    return res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, refresh, me };

