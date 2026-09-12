import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransactionCategory,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getTransactions);
router.post("/", protect, createTransaction);
router.patch("/:id", protect, updateTransactionCategory);
router.delete("/:id", protect, deleteTransaction);

export default router;