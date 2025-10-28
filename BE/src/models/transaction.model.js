import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  sku: String,
  name: String,
  qty: Number,
  price: Number,
  category: String,
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customer: {
    id: String,
    name: String,
    tier: String,
  },
  store: {
    code: String,
    name: String,
  },
  channel: String,
  items: [itemSchema],
  subtotal: Number,
  pointsEarned: Number,
  campaign: {
    name: String,
    multiplier: Number,
  },
  paidAt: Date,
  createdAt: { type: Date, default: () => new Date() },
}, { _id: false });

export default mongoose.model("Transaction", transactionSchema);
