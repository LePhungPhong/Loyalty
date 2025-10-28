import express from "express";
import { listPoints } from "../controllers/points.controller.js";
import { burnPoints, expirePoints } from "../controllers/points.controller.js";

const router = express.Router();

router.get("/", listPoints);
router.post("/burn", burnPoints);
router.post("/expire", expirePoints);

export default router;
