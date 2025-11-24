import Transaction from "../models/transaction.model.js";
import Customer from "../models/customer.model.js";
import PointsHistory from "../models/pointsHistory.model.js";
import { validationResult } from "express-validator";
import redisClient from "../config/redis.js";

// Helper: Xóa cache an toàn
const safeClearCache = async (pattern) => {
  try {
    if (redisClient.isOpen) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) await redisClient.del(keys);
    }
  } catch (e) {
    // Redis lỗi thì bỏ qua, không làm fail giao dịch
    console.warn("⚠️ Redis clean failed, ignoring...");
  }
};

export const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { customer: custInfo, subtotal, paidAt } = req.body;
    const newTxId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Logic truy vấn DB (Vẫn chạy bình thường dù Redis chết)
    const customerDoc = await Customer.findById(custInfo.id);
    if (!customerDoc)
      return res.status(404).json({ message: "Customer not found" });

    const points = req.body.pointsEarned || Math.floor((subtotal || 0) / 1000);

    const tx = await Transaction.create({
      _id: newTxId,
      customer: {
        id: customerDoc._id,
        name: customerDoc.fullName,
        tier: customerDoc.membership.tier,
      },
      store: req.body.store || { code: "ONLINE", name: "Online" },
      channel: req.body.channel || "WEB",
      items: req.body.items || [],
      subtotal: subtotal || 0,
      pointsEarned: points,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    });

    const updatedCustomer = await Customer.adjustPoints(
      customerDoc._id,
      points,
      "EARN",
      {
        title: `Earned from transaction ${newTxId}`,
        transaction: { code: newTxId, total: subtotal },
      }
    );

    // Thử xóa cache, nếu lỗi thì thôi, vẫn trả về success cho client
    await safeClearCache("customers:list*");

    return res.status(201).json({
      message: "Transaction created",
      transaction: tx,
      newBalance: updatedCustomer.membership.availablePoints,
      newTier: updatedCustomer.membership.tier,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const listTransactions = async (req, res) => {
  try {
    const { search = "", sortBy = "paidAt", order = "desc" } = req.query;
    const query = search
      ? {
          $or: [
            { _id: { $regex: search, $options: "i" } },
            { "customer.name": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Trực tiếp query DB cho Transaction (thường ít cache hơn Customer)
    const transactions = await Transaction.find(query).sort({
      [sortBy]: order === "asc" ? 1 : -1,
    });
    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getTransaction = async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ message: "Not found" });
  res.json(tx);
};

export const deleteTransaction = async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  await PointsHistory.deleteMany({ "transaction.code": req.params.id });
  await safeClearCache("customers:list*");
  res.json({ message: "Deleted" });
};
