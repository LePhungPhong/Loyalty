import Customer from "../models/customer.model.js";
import redisClient from "../config/redis.js";

redisClient.delPattern = async (pattern) => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) await redisClient.del(keys);
};

// Generate customer ID
export const generateCustomerId = async () => {
  const prefix =
    "CUS-" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Customer.countDocuments();
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

// List customers
export const listCustomers = async (req, res) => {
  try {
    const { search = "", sortBy = "createdAt", order = "desc" } = req.query;

    const query = search
      ? {
          $or: [
            { _id: { $regex: search, $options: "i" } },
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const cacheKey = `customers:list:${search}:${sortBy}:${order}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const customers = await Customer.find(query).sort(sortObj).lean();
    await redisClient.setEx(cacheKey, 60, JSON.stringify(customers));

    res.json(customers);
  } catch (err) {
    console.error("Lỗi truy vấn khách hàng:", err);
    res.status(500).json({ error: "Không thể tải danh sách khách hàng" });
  }
};

// Create customer
export const createCustomer = async (req, res) => {
  try {
    if (!req.body._id) {
      req.body._id = await generateCustomerId();
    }
    const customer = await Customer.create(req.body);
    await redisClient.delPattern("customers:list*");
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể tạo khách hàng" });
  }
};

// Get customer
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Customer not found" });
    await redisClient.delPattern("customers:list*");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể cập nhật khách hàng" });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findOneAndDelete({ _id: req.params.id });
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    await redisClient.delPattern("customers:list*");
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể xóa khách hàng" });
  }
};
