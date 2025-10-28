import Transaction from "../models/transaction.model.js";
import Customer from "../models/customer.model.js";
import PointsHistory from "../models/pointsHistory.model.js";
import { validationResult } from "express-validator";

const generateTransactionId = async () => {
  const prefix =
    "TX-" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Transaction.countDocuments();
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

export const listTransactions = async (req, res) => {
  try {
    const { search, sortBy = "paidAt", order = "desc" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { _id: new RegExp(search, "i") },
        { "customer.name": new RegExp(search, "i") },
        { "customer.id": new RegExp(search, "i") },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const transactions = await Transaction.find(query).sort({
      [sortBy]: sortOrder,
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    const tx = await Transaction.create({
      _id: newId,
      customer: req.body.customer,
      store: req.body.store || { code: "ONLINE", name: "Online" },
      channel: req.body.channel || "WEB",
      items: req.body.items || [],
      subtotal,
      pointsEarned: points,
      paidAt: req.body.paidAt ? new Date(req.body.paidAt) : new Date(),
    });

    customer.membership.availablePoints += points;
    customer.membership.lifetimeEarned += points;
    await customer.save();

    await PointsHistory.create({
      _id: `LOG-${newId}-EARN`,
      customer: tx.customer,
      type: "EARN",
      points,
      title: `Earned from transaction ${newId}`,
      transaction: {
        code: newId,
        total: tx.subtotal,
        store: tx.store?.code,
        channel: tx.channel,
      },
      occurredAt: tx.paidAt,
      createdAt: new Date(),
    });

    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Not found" });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
