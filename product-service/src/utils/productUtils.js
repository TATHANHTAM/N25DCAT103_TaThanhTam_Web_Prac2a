const SORT_FIELDS = new Set(["name", "price", "stock", "createdAt", "updatedAt"]);

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePositiveInt(value, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function normalizeSort(sortBy, order) {
  return {
    sortBy: SORT_FIELDS.has(sortBy) ? sortBy : "createdAt",
    order: order === "asc" ? "asc" : "desc",
  };
}

module.exports = { slugify, parsePositiveInt, normalizeSort };

