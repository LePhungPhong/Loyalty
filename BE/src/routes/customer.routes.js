import express from "express";
import { body } from "express-validator";
import {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomers,
} from "../controllers/customer.controller.js";

const router = express.Router();

// GET /api/customers
router.get("/", listCustomers);

// GET /api/customers/:id
router.get("/:id", getCustomer);

// POST /api/customers (Tạo mới)
router.post(
  "/",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Invalid email"),
    // Các trường khác là optional
  ],
  createCustomer
);

// PUT /api/customers/:id (Cập nhật)
router.put("/:id", updateCustomer);

// DELETE /api/customers/:id (Xóa)
router.delete("/:id", deleteCustomer);

export default router;
