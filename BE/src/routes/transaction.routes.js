import express from "express";
import { body } from "express-validator";
import {
  listTransactions,
  createTransaction,
  getTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/", listTransactions);
router.get("/:id", getTransaction);
router.post(
  "/",
  [body("customer.id").notEmpty().withMessage("Customer ID is required")],
  createTransaction
);
router.delete("/:id", deleteTransaction);

export default router;
