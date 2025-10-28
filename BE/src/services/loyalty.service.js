import Customer from "../models/customer.model.js";
import Transaction from "../models/transaction.model.js";
import PointsHistory from "../models/pointsHistory.model.js";

export const addTransaction = async (data) => {
  // create transaction
  const tx = await Transaction.create(data);

  // find customer
  const customer = await Customer.findById(tx.customer.id);
  if (!customer) throw new Error("Customer not found");

  const earned = tx.pointsEarned || 0;
  customer.membership.availablePoints = (customer.membership.availablePoints || 0) + earned;
  customer.membership.lifetimeEarned = (customer.membership.lifetimeEarned || 0) + earned;
  customer.updatedAt = new Date();
  await customer.save();

  // create points history
  await PointsHistory.create({
    _id: `LOG-${tx._id}-EARN`,
    customer: tx.customer,
    type: "EARN",
    points: earned,
    title: `Earn from transaction ${tx._id}`,
    transaction: {
      code: tx._id,
      total: tx.subtotal,
      store: tx.store?.code,
      channel: tx.channel,
    },
    campaign: tx.campaign,
    occurredAt: tx.paidAt,
    createdAt: new Date(),
  });

  return tx;
};
