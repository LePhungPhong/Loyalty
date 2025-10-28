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

router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post(
  "/",
  [
    body("_id")
      .optional()
      .isString()
      .withMessage("Customer ID must be a string if provided"),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email")
      .isEmail()
      .optional({ nullable: true })
      .withMessage("Invalid email"),
  ],
  createCustomer
);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
