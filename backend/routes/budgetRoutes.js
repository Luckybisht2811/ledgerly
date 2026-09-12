import express from "express";
import { setBudget, getBudgets, deleteBudget } from "../controllers/budgetController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getBudgets);
router.post("/", protect, setBudget);
router.delete("/:category", protect, deleteBudget);

export default router;
