const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "access-secret-for-tests-at-least-32-characters";
process.env.JWT_REFRESH_SECRET = "refresh-secret-for-tests-at-least-32-characters";

const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../src/services/tokenService");

const user = { id: 1, email: "student@example.com", role: "user" };

test("tạo và xác thực refresh token", () => {
  const token = createRefreshToken(user);
  const payload = verifyRefreshToken(token);
  assert.equal(Number(payload.sub), 1);
  assert.equal(payload.type, "refresh");
});

test("access token và refresh token khác nhau", () => {
  assert.notEqual(createAccessToken(user), createRefreshToken(user));
});

test("hashToken ổn định và không giữ token gốc", () => {
  assert.equal(hashToken("abc"), hashToken("abc"));
  assert.notEqual(hashToken("abc"), "abc");
});

