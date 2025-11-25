import Transaction from "../models/transaction.model.js";
import Customer from "../models/customer.model.js";
import PointsHistory from "../models/pointsHistory.model.js";
import { validationResult } from "express-validator";
import redisClient from "../config/redis.js";

const safeClearCache = async (pattern) => {
  try {
    if (redisClient.isOpen) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) await redisClient.del(keys);
    }
  } catch (e) {
    console.warn("Redis clean failed, ignoring...");
  }
};

// =============================
// LIST TRANSACTIONS
// =============================
export const listTransactions = async (req, res) => {
  try {
    const {
      search = "",
      startDate,
      endDate,
      minTotal,
      maxTotal,
      sortBy = "paidAt",
      order = "desc",
    } = req.query;

    // 1. Xây dựng Query cơ bản
    const query = {};

    // 2. Tìm kiếm theo từ khóa (Mã GD, Tên KH)
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
      ];
    }

    // 3. Lọc theo khoảng thời gian (paidAt)
    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) query.paidAt.$gte = new Date(startDate);
      if (endDate) {
        // Đặt endDate là cuối ngày đó (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paidAt.$lte = end;
      }
    }

    // 4. Lọc theo tổng tiền (subtotal)
    if (minTotal || maxTotal) {
      query.subtotal = {};
      if (minTotal) query.subtotal.$gte = Number(minTotal);
      if (maxTotal) query.subtotal.$lte = Number(maxTotal);
    }

    const sortOrder = order === "asc" ? 1 : -1;

    // Query Database
    const transactions = await Transaction.find(query).sort({
      [sortBy]: sortOrder,
    });

    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =============================
// CREATE TRANSACTION
// =============================
export const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { customer: custInfo, subtotal, paidAt } = req.body;
    const newTxId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

// =============================
// GET & DELETE
// =============================
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
