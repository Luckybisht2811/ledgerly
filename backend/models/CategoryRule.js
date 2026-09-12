import mongoose from "mongoose";

// When a user manually corrects a transaction's category, we remember the
// merchant -> category mapping here so future SMS from the same merchant
// auto-categorize correctly. This is the "learning" part of the rule engine.
const categoryRuleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    merchant: { type: String, required: true, trim: true, uppercase: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

categoryRuleSchema.index({ user: 1, merchant: 1 }, { unique: true });

const CategoryRule = mongoose.model("CategoryRule", categoryRuleSchema);
export default CategoryRule;
