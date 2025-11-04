import PointsHistory from "../models/pointsHistory.model.js";
import Customer from "../models/customer.model.js";
import redisClient from "../config/redis.js";

// =============================
// Earn points (cộng điểm khi mua hàng)
// =============================
export const earnPoints = async (req, res) => {
  try {
    const { customerId, subtotal } = req.body;

    if (!customerId || !subtotal)
      return res.status(400).json({ message: "Missing required fields" });

    // Tính điểm từ subtotal (1 điểm cho mỗi 1000đ)
    const points = Math.floor(subtotal / 1000);

    // Gọi hàm tự động xử lý cộng điểm + cập nhật hạng
    const customer = await Customer.adjustPoints(
      customerId,
      points,
      "EARN",
      `Earned from purchase (₫${subtotal.toLocaleString()})`
    );

    // Xóa cache Redis
    await redisClient.delPattern("customers:list*");

    res.json({
      message: "Points earned successfully",
      points,
      newTier: customer.membership.tier,
      newBalance: customer.membership.availablePoints,
    });
  } catch (err) {
    console.error("earnPoints error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// Burn points (khách hàng dùng điểm)
// =============================
export const burnPoints = async (req, res) => {
  try {
    const { customerId, points, title } = req.body;

    if (!customerId || !points)
      return res.status(400).json({ message: "Missing required fields" });

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    if (customer.membership.availablePoints < points)
      return res.status(400).json({ message: "Not enough points" });

    // Gọi hàm trừ điểm + cập nhật hạng
    const updatedCustomer = await Customer.adjustPoints(
      customerId,
      points,
      "BURN",
      title || "Redeemed points"
    );

    await redisClient.delPattern("customers:list*");

    res.json({
      message: "Points burned successfully",
      newTier: updatedCustomer.membership.tier,
      newBalance: updatedCustomer.membership.availablePoints,
    });
  } catch (err) {
    console.error("burnPoints error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// Expire points (điểm hết hạn)
// =============================
export const expirePoints = async (req, res) => {
  try {
    const { customerId, points } = req.body;

    if (!customerId || !points)
      return res.status(400).json({ message: "Missing required fields" });

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // Gọi hàm trừ điểm + ghi log + kiểm tra hạng
    const updatedCustomer = await Customer.adjustPoints(
      customerId,
      points,
      "EXPIRE",
      "Points expired"
    );

    await redisClient.delPattern("customers:list*");

    res.json({
      message: "Points expired successfully",
      newTier: updatedCustomer.membership.tier,
      newBalance: updatedCustomer.membership.availablePoints,
    });
  } catch (err) {
    console.error("expirePoints error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// Lấy danh sách lịch sử điểm
// =============================
export const listPoints = async (req, res) => {
  try {
    const { customerId } = req.query;
    const filter = customerId ? { "customer.id": customerId } : {};

    const pointsHistory = await PointsHistory.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(pointsHistory);
  } catch (err) {
    console.error("listPoints error:", err);
    res.status(500).json({ message: err.message });
  }
};
