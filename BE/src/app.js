import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";
import customerRoutes from "./routes/customer.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import pointsRoutes from "./routes/points.routes.js";

dotenv.config();
await connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/api/redis-status", async (req, res) => {
  try {
    const pong = await redisClient.ping();
    res.json({ redis: "connected", response: pong });
  } catch (err) {
    res.status(500).json({ redis: "disconnected", error: err.message });
  }
});
app.use("/api/customers", customerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/points", pointsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Loyalty app running on port ${PORT}`));
