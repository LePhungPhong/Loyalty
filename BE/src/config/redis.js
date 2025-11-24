import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.warn("[Redis] Retries exhausted. Using MongoDB only.");
        return new Error("Redis connection failed");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (err) => {});

redisClient.on("connect", () => console.log("✅ Redis Connected"));
redisClient.on("ready", () => console.log("✅ Redis Ready to use"));
redisClient.on("end", () => console.log("⚠️ Redis Disconnected"));

// Kết nối Async không chặn luồng chính
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn(
      "⚠️ Cannot connect to Redis on startup. Server will run in MongoDB-only mode."
    );
  }
})();

export default redisClient;
