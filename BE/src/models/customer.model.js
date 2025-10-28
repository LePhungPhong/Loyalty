import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  _id: { type: String, required: true },
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
    tier: { type: String, default: "SILVER" },
    availablePoints: { type: Number, default: 0 },
    pendingPoints: { type: Number, default: 0 },
    lifetimeEarned: { type: Number, default: 0 },
    tierSince: String,
    tierExpireAt: String,
  },
  segments: [String],
  consents: {
    marketing: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
  status: { type: String, default: "active" },
}, { _id: false });

export default mongoose.model("Customer", customerSchema);
