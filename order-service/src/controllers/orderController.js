const Order = require("../models/Order");
const { calculateOrder } = require("../utils/orderUtils");
const { hydrateOrderItems } = require("../services/productService");

async function createOrder(req, res, next) {
  try {
    const customerId = Number(req.headers["x-user-id"] || req.body.customerId);
    if (!customerId) {
      return res.status(422).json({ success: false, message: "Thiếu customerId" });
    }

    const hydratedItems = await hydrateOrderItems(req.body.items);
    const { processedItems, totalAmount } = calculateOrder(hydratedItems);

    const order = await Order.create({
      customerId,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      items: processedItems,
      totalAmount,
      shippingAddress: req.body.shippingAddress,
      note: req.body.note,
    });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
}

async function getOrdersByCustomer(req, res, next) {
  try {
    const customerId = Number(req.params.customerId);
    const requesterId = Number(req.headers["x-user-id"] || 0);
    const requesterRole = req.headers["x-user-role"];

    if (requesterId && requesterId !== customerId && requesterRole !== "admin") {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem đơn hàng này" });
    }

    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || "10", 10), 1), 100);
    const filter = { customerId };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createOrder, getOrdersByCustomer, updateOrderStatus };

