import mongoose from "mongoose";
import { CATEGORY_VALUES } from "./Transaction.js";

// A user sets one monthly limit per category (e.g. Food: ₹5000/month).
// Current-month spend is computed live in the controller by aggregating
// Transaction documents — we don't store the spend total here, only the limit.
const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: CATEGORY_VALUES, required: true },
    monthlyLimit: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// One budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
