require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = Number(process.env.PORT) || 3002;

async function start() {
  await connectDatabase();
  const server = app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
  });

  async function shutdown(signal) {
    console.log(`${signal}: đang dừng Order Service`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("Không thể khởi động Order Service:", error);
  process.exit(1);
});

