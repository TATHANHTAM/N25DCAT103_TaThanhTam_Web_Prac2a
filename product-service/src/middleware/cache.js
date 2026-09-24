const { getRedisClient, ensureConnected } = require("../config/redis");

function cacheResponse(ttlSeconds = 300) {
  return async (req, res, next) => {
    const redis = getRedisClient();
    if (!redis) return next();

    const key = `products:${req.originalUrl}`;

    try {
      if (!(await ensureConnected(redis))) return next();
      const cached = await redis.get(key);
      if (cached) {
        res.set("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(key, JSON.stringify(body), "EX", ttlSeconds).catch(() => {});
        }
        res.set("X-Cache", "MISS");
        return originalJson(body);
      };
    } catch (error) {
      console.warn("Bỏ qua cache:", error.message);
    }

    return next();
  };
}

module.exports = cacheResponse;

