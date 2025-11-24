import mongoose from "mongoose";
import dotenv from "dotenv";
import { fakerVI as faker } from "@faker-js/faker";
import Customer from "./models/customer.model.js";
import Transaction from "./models/transaction.model.js";
import PointsHistory from "./models/pointsHistory.model.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/loyalty_db";

// Số lượng cần tạo
const NUM_CUSTOMERS = 100;
const NUM_TRANSACTIONS = 100;

// Hàm tính hạng dựa trên điểm tích lũy (Logic khớp với Model)
const calculateTier = (points) => {
  if (points >= 5000) return "PLATINUM";
  if (points >= 2000) return "GOLD";
  return "SILVER";
};

// Hàm sinh ID ngẫu nhiên
const randomId = (prefix) =>
  `${prefix}-${Date.now().toString().slice(-6)}${Math.floor(
    1000 + Math.random() * 9000
  )}`;

const seed = async () => {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    // 1. Xóa dữ liệu cũ (Optional - Cẩn thận khi dùng)
    console.log("🗑️  Cleaning old data...");
    await Customer.deleteMany({});
    await Transaction.deleteMany({});
    await PointsHistory.deleteMany({});

    // 2. Tạo KHÁCH HÀNG (Customers)
    console.log(`👤 Generating ${NUM_CUSTOMERS} customers...`);
    const customers = [];

    for (let i = 0; i < NUM_CUSTOMERS; i++) {
      const lifetimeEarned = faker.number.int({ min: 0, max: 10000 });
      // Điểm hiện có <= Tổng điểm tích lũy
      const availablePoints = faker.number.int({ min: 0, max: lifetimeEarned });
      const tier = calculateTier(lifetimeEarned);

      customers.push({
        _id: randomId("CUS"),
        fullName: faker.person.fullName(),
        phone: faker.phone.number("09########"),
        email: faker.internet.email().toLowerCase(),
        dob: faker.date
          .birthdate({ min: 18, max: 60, mode: "age" })
          .toISOString()
          .split("T")[0],
        gender: faker.person.sexType(), // Male/Female
        address: {
          city: faker.location.city(),
          country: "Vietnam",
        },
        membership: {
          tier: tier,
          availablePoints: availablePoints,
          lifetimeEarned: lifetimeEarned,
          tierSince: faker.date.past(),
        },
        status: "active",
        createdAt: faker.date.past(),
        updatedAt: new Date(),
      });
    }

    // Lưu khách hàng vào DB
    const savedCustomers = await Customer.insertMany(customers);
    console.log("✅ Customers seeded.");

    // 3. Tạo GIAO DỊCH (Transactions) & LỊCH SỬ (History)
    console.log(`💳 Generating ${NUM_TRANSACTIONS} transactions...`);
    const transactions = [];
    const histories = [];

    for (let i = 0; i < NUM_TRANSACTIONS; i++) {
      // Chọn ngẫu nhiên 1 khách hàng
      const randomCustomer =
        savedCustomers[Math.floor(Math.random() * savedCustomers.length)];

      const subtotal = faker.number.int({ min: 50000, max: 5000000 }); // 50k - 5tr
      const pointsEarned = Math.floor(subtotal / 1000); // 1k = 1 điểm
      const txDate = faker.date.recent({ days: 60 }); // Trong vòng 60 ngày gần đây
      const txId = randomId("TX");

      // Tạo Transaction
      transactions.push({
        _id: txId,
        customer: {
          id: randomCustomer._id,
          name: randomCustomer.fullName,
          tier: randomCustomer.membership.tier,
        },
        store: {
          code: faker.helpers.arrayElement(["STORE_HCM", "STORE_HN", "ONLINE"]),
          name: "Chi nhánh " + faker.location.city(),
        },
        channel: faker.helpers.arrayElement(["WEB", "APP", "POS"]),
        subtotal: subtotal,
        pointsEarned: pointsEarned,
        paidAt: txDate,
        createdAt: txDate,
      });

      // Tạo History tương ứng (EARN)
      histories.push({
        _id: `LOG-${txId}-EARN`,
        customer: {
          id: randomCustomer._id,
          name: randomCustomer.fullName,
          tier: randomCustomer.membership.tier,
        },
        type: "EARN",
        points: pointsEarned,
        title: `Tích điểm từ đơn hàng ${txId}`,
        transaction: {
          code: txId,
          total: subtotal,
        },
        occurredAt: txDate,
        createdAt: txDate,
      });
    }

    // Thêm vài record "BURN" (Đổi điểm) cho sinh động
    console.log("🔥 Generating burn history...");
    for (let i = 0; i < 20; i++) {
      const randomCustomer =
        savedCustomers[Math.floor(Math.random() * savedCustomers.length)];
      const pointsBurned = faker.number.int({ min: 10, max: 500 });

      histories.push({
        _id: randomId("LOG"),
        customer: {
          id: randomCustomer._id,
          name: randomCustomer.fullName,
          tier: randomCustomer.membership.tier,
        },
        type: "BURN",
        points: pointsBurned, // Lưu số dương
        title: "Đổi quà Voucher 50k",
        occurredAt: faker.date.recent({ days: 30 }),
      });
    }

    await Transaction.insertMany(transactions);
    await PointsHistory.insertMany(histories);

    console.log("✅ Transactions & History seeded.");
    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seed();
