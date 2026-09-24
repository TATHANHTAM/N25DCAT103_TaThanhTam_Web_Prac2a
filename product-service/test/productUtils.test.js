const test = require("node:test");
const assert = require("node:assert/strict");
const { slugify, parsePositiveInt, normalizeSort } = require("../src/utils/productUtils");

test("slugify xử lý tiếng Việt và khoảng trắng", () => {
  assert.equal(slugify("Điện thoại Cao Cấp"), "dien-thoai-cao-cap");
});

test("parsePositiveInt áp dụng mặc định và giới hạn", () => {
  assert.equal(parsePositiveInt("0", 1), 1);
  assert.equal(parsePositiveInt("200", 10, 100), 100);
  assert.equal(parsePositiveInt("5", 1), 5);
});

test("normalizeSort chỉ chấp nhận field và order hợp lệ", () => {
  assert.deepEqual(normalizeSort("price", "asc"), { sortBy: "price", order: "asc" });
  assert.deepEqual(normalizeSort("dropTable", "invalid"), { sortBy: "createdAt", order: "desc" });
});
