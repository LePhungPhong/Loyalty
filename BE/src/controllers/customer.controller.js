import Customer from "../models/customer.model.js";
import redisClient from "../config/redis.js";

// --- HELPER: Redis An Toàn (Circuit Breaker) ---
// Nếu Redis chết, hàm này trả về null ngay lập tức, không gây lỗi
const safeGetCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    return await redisClient.get(key);
  } catch (e) {
    return null; // Fallback
  }
};

const safeSetCache = (key, data) => {
  try {
    if (redisClient.isOpen) {
      // Set cache và tự động hết hạn sau 10 phút (600s)
      redisClient.setEx(key, 600, JSON.stringify(data)).catch(() => {});
    }
  } catch (e) {}
};

const safeClearCache = async (pattern) => {
  try {
    if (redisClient.isOpen) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) await redisClient.del(keys);
    }
  } catch (e) {}
};

// =============================
// API HANDLERS
// =============================

export const generateCustomerId = async () => {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `CUS-${Date.now().toString().slice(-6)}${randomPart}`;
};

export const listCustomers = async (req, res) => {
  try {
    const { search = "", sortBy = "createdAt", order = "desc" } = req.query;
    const cacheKey = `customers:list:${search}:${sortBy}:${order}`;

    // 1. Thử lấy từ Cache
    const cached = await safeGetCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 2. Nếu không có Cache (hoặc Redis chết) -> Query MongoDB
    // console.log("🐢 Hit Database"); // Debug
    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const sortObj = { [sortBy]: order === "asc" ? 1 : -1 };
    const customers = await Customer.find(query).sort(sortObj).lean();

    // 3. Lưu lại vào Cache (nếu Redis sống)
    safeSetCache(cacheKey, customers);

    res.json(customers);
  } catch (err) {
    console.error("List Customer Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    if (!req.body._id) req.body._id = await generateCustomerId();
    const customer = await Customer.create(req.body);

    // Xóa cache cũ để dữ liệu mới hiển thị ngay
    await safeClearCache("customers:list*");

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });

    await safeClearCache("customers:list*");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findOneAndDelete({ _id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Not found" });

    await safeClearCache("customers:list*");

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });
    if (!customer) return res.status(404).json({ message: "Not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
