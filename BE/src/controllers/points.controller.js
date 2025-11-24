import PointsHistory from "../models/pointsHistory.model.js";
import Customer from "../models/customer.model.js";
import redisClient from "../config/redis.js";

const safeClearCache = async (pattern) => {
  try {
    if (redisClient.isOpen) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) await redisClient.del(keys);
    }
  } catch (e) {}
};

export const burnPoints = async (req, res) => {
  try {
    const { customerId, points, title } = req.body;

    if (!customerId || !points)
      return res.status(400).json({ message: "Missing required fields" });

    // Logic chính nằm trong Model (MongoDB), không phụ thuộc Redis
    const updatedCustomer = await Customer.adjustPoints(
      customerId,
      Number(points),
      "BURN",
      { title: title || "Redeemed Points" }
    );

    // Xóa cache (Optional)
    await safeClearCache("customers:list*");

    res.json({
      message: "Points burned successfully",
      newTier: updatedCustomer.membership.tier,
      newBalance: updatedCustomer.membership.availablePoints,
    });
  } catch (err) {
    const status = err.message === "Not enough points" ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
};

export const expirePoints = async (req, res) => {
  try {
    const { customerId, points } = req.body;
    if (!customerId || !points)
      return res.status(400).json({ message: "Missing data" });

    const updatedCustomer = await Customer.adjustPoints(
      customerId,
      Number(points),
      "EXPIRE",
      { title: "Points Expired" }
    );

    await safeClearCache("customers:list*");

    res.json({
      message: "Points expired successfully",
      newBalance: updatedCustomer.membership.availablePoints,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listPoints = async (req, res) => {
  try {
    const { customerId } = req.query;
    const filter = customerId ? { "customer.id": customerId } : {};

    // Query trực tiếp DB
    const pointsHistory = await PointsHistory.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(pointsHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
