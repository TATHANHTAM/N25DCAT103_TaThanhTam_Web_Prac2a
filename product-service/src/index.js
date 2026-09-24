require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");
const { getRedisClient } = require("./config/redis");

const PORT = Number(process.env.PORT) || 3001;
const server = app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal}: đang dừng Product Service`);
  server.close(async () => {
    await prisma.$disconnect();
    const redis = getRedisClient();
    if (redis) redis.disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

