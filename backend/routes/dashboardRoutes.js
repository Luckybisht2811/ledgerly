import express from "express";
import { getSummary, getAvailableMonths, getMonthlyTrend, getSubscriptions } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/summary", protect, getSummary);
router.get("/months", protect, getAvailableMonths);
router.get("/trend", protect, getMonthlyTrend);
router.get("/subscriptions", protect, getSubscriptions);

export default router;
