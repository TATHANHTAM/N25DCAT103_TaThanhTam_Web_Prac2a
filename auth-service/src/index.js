require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");

const PORT = Number(process.env.PORT) || 3003;
const server = app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

async function shutdown(signal) {
  console.log(`${signal}: đang dừng Auth Service`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

