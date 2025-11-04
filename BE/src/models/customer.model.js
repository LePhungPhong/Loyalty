import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    _id: String,
    fullName: String,
    phone: String,
    email: String,
    dob: String,
    gender: String,
    address: {
      city: String,
      country: String,
    },
    membership: {
      tier: { type: String, default: "BRONZE" },
      availablePoints: { type: Number, default: 0 },
      pendingPoints: { type: Number, default: 0 },
      lifetimeEarned: { type: Number, default: 0 },
      tierSince: { type: Date, default: () => new Date() },
      tierExpireAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    },
    segments: [String],
    consents: {
      marketing: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
    },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

// =====================
// Static method: cộng/trừ điểm + ghi lịch sử
// =====================
customerSchema.statics.adjustPoints = async function (
  customerId,
  points,
  type,
  title = ""
) {
  const customer = await this.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  // Bảo đảm membership tồn tại
  if (!customer.membership) {
    customer.membership = {
      tier: "BRONZE",
      availablePoints: 0,
      lifetimeEarned: 0,
      tierSince: new Date(),
      tierExpireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  // --- Cộng / Trừ điểm ---
  if (type === "EARN") {
    customer.membership.availablePoints += points;
    customer.membership.lifetimeEarned += points;
  } else if (type === "BURN" || type === "EXPIRE") {
    customer.membership.availablePoints = Math.max(
      0,
      customer.membership.availablePoints - points
    );
  }

  // --- Cập nhật tier ---
  const total = customer.membership.lifetimeEarned;
  const oldTier = customer.membership.tier;
  let newTier = "BRONZE";

  if (total >= 5000) newTier = "PLATINUM";
  else if (total >= 2000) newTier = "GOLD";
  else if (total >= 1) newTier = "SILVER";

  if (newTier !== oldTier) {
    customer.membership.tier = newTier;
    customer.membership.tierSince = new Date();
  }

  await customer.save();

  // --- Ghi lịch sử ---
  const PointsHistory = mongoose.model("PointsHistory");
  await PointsHistory.create({
    _id: `LOG-${customerId}-${Date.now()}-${type}`,
    customer: {
      id: customer._id,
      name: customer.fullName,
      tier: customer.membership.tier,
    },
    type,
    points: type === "EARN" ? points : -points,
    title: title || (type === "EARN" ? "Earned points" : "Points updated"),
    occurredAt: new Date(),
    createdAt: new Date(),
  });

  return customer;
};

export default mongoose.model("Customer", customerSchema);
