import mongoose from "mongoose";
import PointsHistory from "./pointsHistory.model.js";

const customerSchema = new mongoose.Schema(
  {
    _id: String,
    fullName: String,
    phone: String,
    email: String,
    dob: String, // Ngày sinh
    gender: String, // Giới tính
    address: {
      city: String,
      country: String,
    },
    membership: {
      tier: { type: String, default: "SILVER" },
      availablePoints: { type: Number, default: 0 },
      lifetimeEarned: { type: Number, default: 0 },
      tierSince: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// --- LOGIC TẬP TRUNG: CỘNG TRỪ ĐIỂM & UPDATE TIER ---
customerSchema.statics.adjustPoints = async function (
  customerId,
  points,
  type,
  historyData
) {
  const Customer = this;

  if (points < 0) throw new Error("Points must be positive");

  const currentCustomer = await Customer.findById(customerId);
  if (!currentCustomer) throw new Error("Customer not found");

  if (
    (type === "BURN" || type === "EXPIRE") &&
    currentCustomer.membership.availablePoints < points
  ) {
    throw new Error("Not enough points");
  }

  let pointDelta = type === "EARN" ? points : -points;
  let lifetimeDelta = type === "EARN" ? points : 0;

  // Update Atomic bằng $inc
  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: customerId },
    {
      $inc: {
        "membership.availablePoints": pointDelta,
        "membership.lifetimeEarned": lifetimeDelta,
      },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  );

  // Tính hạng
  const total = updatedCustomer.membership.lifetimeEarned;
  let newTier = "SILVER";
  if (total >= 5000) newTier = "PLATINUM";
  else if (total >= 2000) newTier = "GOLD";

  if (newTier !== updatedCustomer.membership.tier) {
    updatedCustomer.membership.tier = newTier;
    updatedCustomer.membership.tierSince = new Date();
    await updatedCustomer.save();
  }

  // Ghi lịch sử
  await PointsHistory.create({
    _id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customer: {
      id: updatedCustomer._id,
      name: updatedCustomer.fullName,
      tier: updatedCustomer.membership.tier,
    },
    type: type,
    points: points,
    title: historyData.title || `${type} Points`,
    transaction: historyData.transaction || {},
    occurredAt: new Date(),
  });

  return updatedCustomer;
};

export default mongoose.model("Customer", customerSchema);
