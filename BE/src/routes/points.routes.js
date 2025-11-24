import express from "express";
import {
  listPoints,
  burnPoints,
  expirePoints,
} from "../controllers/points.controller.js";

const router = express.Router();

// GET /api/points (Lịch sử điểm)
router.get("/", listPoints);

// POST /api/points/burn (Đổi điểm)
router.post("/burn", burnPoints);

// POST /api/points/expire (Hết hạn điểm)
router.post("/expire", expirePoints);

export default router;
