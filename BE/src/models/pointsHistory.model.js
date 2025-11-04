import mongoose from "mongoose";

const pointsHistorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customer: {
    id: String,
    name: String,
    tier: String,
  },
  type: String, // EARN, BURN, EXPIRE
  points: Number,
  title: String,
  transaction: {
    code: String,
    total: Number,
    store: String,
    channel: String,
  },
  reward: {
    name: String,
    voucherCode: String,
    expiresAt: String,
  },
  campaign: {
    name: String,
    multiplier: Number,
  },
  occurredAt: Date,
  createdAt: { type: Date, default: () => new Date() },
});

export default mongoose.model("PointsHistory", pointsHistorySchema);
