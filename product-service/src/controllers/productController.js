const { Readable } = require("stream");
const prisma = require("../config/prisma");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const { clearProductCache } = require("../config/redis");
const { slugify, parsePositiveInt, normalizeSort } = require("../utils/productUtils");

function toProductData(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.name !== undefined) data.name = body.name?.trim();
  if (!partial || body.price !== undefined) data.price = Number(body.price);
  if (body.description !== undefined) data.description = body.description || null;
  if (body.stock !== undefined) data.stock = Number.parseInt(body.stock, 10);
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId === null ? null : Number.parseInt(body.categoryId, 10);
  }
  if (body.name !== undefined) data.slug = slugify(body.name);

  return data;
}

async function getProducts(req, res, next) {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10, 100);
    const { sortBy, order } = normalizeSort(req.query.sortBy, req.query.order);
    const { search = "", category, minPrice, maxPrice, inStock } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(category && { category: { slug: category } }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: Number(minPrice) }),
              ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
            },
          }
        : {}),
      ...(inStock === "true" && { stock: { gt: 0 } }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await prisma.product.findFirst({
      where: { id: Number(req.params.id), isActive: true },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    return res.json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const data = toProductData(req.body);
    if (!data.slug) {
      return res.status(422).json({ success: false, message: "Không thể tạo slug từ tên sản phẩm" });
    }

    const product = await prisma.product.create({
      data,
      include: { category: true },
    });

    await clearProductCache();
    return res.status(201).json({
      success: true,
      data: product,
      message: "Tạo sản phẩm thành công",
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const data = toProductData(req.body, { partial: true });
    if (data.slug === "") {
      return res.status(422).json({ success: false, message: "Không thể tạo slug từ tên sản phẩm" });
    }

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data,
      include: { category: true },
    });

    await clearProductCache();
    return res.json({ success: true, data: product, message: "Cập nhật thành công" });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    await clearProductCache();
    return res.json({ success: true, message: "Đã ẩn sản phẩm thành công" });
  } catch (error) {
    return next(error);
  }
}

function uploadBuffer(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "lab2a-products", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

async function uploadProductImage(req, res, next) {
  try {
    if (!isCloudinaryConfigured) {
      return res.status(503).json({
        success: false,
        message: "Chưa cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET",
      });
    }

    if (!req.file) {
      return res.status(422).json({ success: false, message: "Vui lòng chọn file ảnh" });
    }

    const result = await uploadBuffer(req.file);
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { imageUrl: result.secure_url },
      include: { category: true },
    });

    await clearProductCache();
    return res.json({ success: true, data: product, message: "Upload ảnh thành công" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};

