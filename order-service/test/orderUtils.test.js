const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateOrder, createOrderCode } = require("../src/utils/orderUtils");

test("calculateOrder tính subtotal và tổng tiền", () => {
  const result = calculateOrder([
    { productId: 1, productName: "A", price: 100, quantity: 2 },
    { productId: 2, productName: "B", price: 50, quantity: 3 },
  ]);

  assert.equal(result.processedItems[0].subtotal, 200);
  assert.equal(result.processedItems[1].subtotal, 150);
  assert.equal(result.totalAmount, 350);
});

test("createOrderCode tạo đúng định dạng", () => {
  const code = createOrderCode(new Date("2026-09-24T00:00:00.000Z"), 0.123456);
  assert.equal(code, "ORD-20260924-123456");
});
