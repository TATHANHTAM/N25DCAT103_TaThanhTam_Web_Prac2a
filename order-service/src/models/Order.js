const mongoose = require("mongoose");
const { createOrderCode } = require("../utils/orderUtils");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    productName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true, index: true },
    customerId: { type: Number, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(items) => items.length > 0, "Đơn hàng phải có ít nhất một sản phẩm"],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    shippingAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true },
    },
    note: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.pre("validate", function setOrderCode(next) {
  if (!this.orderCode) this.orderCode = createOrderCode();
  next();
});

orderSchema.virtual("totalItems").get(function getTotalItems() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

