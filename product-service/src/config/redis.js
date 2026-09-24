const Redis = require("ioredis");

let client;

function getRedisClient() {
  if (!process.env.REDIS_URL) return null;

  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    client.on("error", (error) => {
      console.warn("Redis không khả dụng:", error.message);
    });
  }

  return client;
}

async function ensureConnected(redis) {
  if (redis.status === "wait") await redis.connect();
  return redis.status === "ready";
}

async function clearProductCache() {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    if (!(await ensureConnected(redis))) return;
    const keys = await redis.keys("products:*");
    if (keys.length) await redis.del(...keys);
  } catch (error) {
    console.warn("Không thể xóa cache sản phẩm:", error.message);
  }
}

module.exports = { getRedisClient, ensureConnected, clearProductCache };

