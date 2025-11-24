import express from "express";
import { body } from "express-validator";
import {
  listTransactions,
  createTransaction,
  getTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

const router = express.Router();

// GET /api/transactions
router.get("/", listTransactions);

// GET /api/transactions/:id
router.get("/:id", getTransaction);

// POST /api/transactions
router.post(
  "/",
  [
    body("customer.id").notEmpty().withMessage("Customer ID is required"),
    body("subtotal").isNumeric().withMessage("Subtotal must be a number"),
  ],
  createTransaction
);

// DELETE /api/transactions/:id
router.delete("/:id", deleteTransaction);

export default router;
