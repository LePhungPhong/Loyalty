import Transaction from "../models/transaction.model.js";
import Customer from "../models/customer.model.js";
import PointsHistory from "../models/pointsHistory.model.js";
import { validationResult } from "express-validator";
import redisClient from "../config/redis.js";

// =============================
// Sinh mã giao dịch tự động
// =============================
const generateTransactionId = async () => {
  const prefix =
    "TX-" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Transaction.countDocuments();
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

// =============================
// Lấy danh sách giao dịch
// =============================
export const listTransactions = async (req, res) => {
  try {
    const { search = "", sortBy = "paidAt", order = "desc" } = req.query;
    const query = search
      ? {
          $or: [
            { _id: { $regex: search, $options: "i" } },
            { "customer.name": { $regex: search, $options: "i" } },
            { "customer.id": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const sortOrder = order === "asc" ? 1 : -1;
    const transactions = await Transaction.find(query).sort({
      [sortBy]: sortOrder,
    });

    return res.json(transactions);
  } catch (err) {
    console.error("listTransactions error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// =============================
// Hàm phụ: cập nhật hạng khách hàng
// =============================
const updateCustomerTier = (customer) => {
  const total = customer.membership.lifetimeEarned || 0;
  let newTier = "BRONZE";
  if (total >= 5000) newTier = "PLATINUM";
  else if (total >= 2000) newTier = "GOLD";
  else if (total >= 1) newTier = "SILVER";

  if (newTier !== customer.membership.tier) {
    customer.membership.tier = newTier;
    customer.membership.tierSince = new Date();
  }
};

// =============================
// Tạo mới giao dịch
// =============================
export const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const newId = await generateTransactionId();
    const customer = await Customer.findById(req.body.customer?.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const subtotal = req.body.subtotal || 0;
    const points = req.body.pointsEarned || Math.floor(subtotal / 1000);

    // --- Tạo giao dịch ---
    const tx = await Transaction.create({
      _id: newId,
      customer: {
        id: customer._id,
        name: customer.fullName,
        tier: customer.membership.tier,
      },
      store: req.body.store || { code: "ONLINE", name: "Online" },
      channel: req.body.channel || "WEB",
      items: req.body.items || [],
      subtotal,
      pointsEarned: points,
      paidAt: req.body.paidAt ? new Date(req.body.paidAt) : new Date(),
    });

    // --- Cộng điểm ---
    customer.membership.availablePoints += points;
    customer.membership.lifetimeEarned += points;

    // --- Cập nhật tier ---
    updateCustomerTier(customer);
    customer.updatedAt = new Date();
    await customer.save();

    // --- Ghi lịch sử tích điểm ---
    await PointsHistory.create({
      _id: `LOG-${newId}-EARN`,
      customer: {
        id: customer._id,
        name: customer.fullName,
        tier: customer.membership.tier,
      },
      type: "EARN",
      points,
      title: `Earned from transaction ${newId}`,
      transaction: {
        code: newId,
        total: subtotal,
        store: tx.store?.code,
        channel: tx.channel,
      },
      occurredAt: tx.paidAt,
      createdAt: new Date(),
    });

    // --- Xóa cache Redis ---
    await redisClient.delPattern("customers:list*");

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction: tx,
      newBalance: customer.membership.availablePoints,
      newTier: customer.membership.tier,
    });
  } catch (err) {
    console.error("createTransaction error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// =============================
// Lấy chi tiết giao dịch
// =============================
export const getTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    return res.json(tx);
  } catch (err) {
    console.error("getTransaction error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// =============================
// Xóa giao dịch
// =============================
export const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Transaction not found" });

    // --- Xóa lịch sử liên quan ---
    await PointsHistory.deleteMany({ "transaction.code": req.params.id });

    // --- Xóa cache Redis ---
    await redisClient.delPattern("customers:list*");

    return res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("deleteTransaction error:", err);
    return res.status(500).json({ message: err.message });
  }
};
