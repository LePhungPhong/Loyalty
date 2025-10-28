import PointsHistory from "../models/pointsHistory.model.js";
import Customer from "../models/customer.model.js";

export const burnPoints = async (req, res) => {
  const { customerId, points, title } = req.body;
  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  if (customer.membership.availablePoints < points)
    return res.status(400).json({ message: "Not enough points" });

  customer.membership.availablePoints -= points;
  await customer.save();

  await PointsHistory.create({
    _id: `LOG-${customerId}-${Date.now()}-BURN`,
    customer: {
      id: customer._id,
      name: customer.fullName,
      tier: customer.membership.tier,
    },
    type: "BURN",
    points: -points,
    title: title || "Redeemed points",
    occurredAt: new Date(),
    createdAt: new Date(),
  });

  res.json({
    message: "Points burned",
    newBalance: customer.membership.availablePoints,
  });
};

export const expirePoints = async (req, res) => {
  const { customerId, points } = req.body;
  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  customer.membership.availablePoints -= points;
  if (customer.membership.availablePoints < 0)
    customer.membership.availablePoints = 0;
  await customer.save();

  await PointsHistory.create({
    _id: `LOG-${customerId}-${Date.now()}-EXPIRE`,
    customer: {
      id: customer._id,
      name: customer.fullName,
      tier: customer.membership.tier,
    },
    type: "EXPIRE",
    points: -points,
    title: "Points expired",
    occurredAt: new Date(),
    createdAt: new Date(),
  });

  res.json({
    message: "Points expired",
    newBalance: customer.membership.availablePoints,
  });
};
export const listPoints = async (req, res) => {
  try {
    const pointsHistory = await PointsHistory.find();
    res.json(pointsHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
