import mongoose from "mongoose";

const CATEGORY_VALUES = [
  "Food",
  "Groceries",
  "Travel",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Other",
];

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    merchant: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORY_VALUES, default: "Other" },
    type: { type: String, enum: ["debit", "credit"], default: "debit" },
    date: { type: Date, required: true },
    account: { type: String, default: null }, // last 4 digits of account, if found
    rawSms: { type: String, required: true }, // original message text (SMS or email body), used for dedupe
    source: { type: String, enum: ["sms", "email", "manual"], default: "sms" },
    confident: { type: Boolean, default: false }, // did a rule confidently match, or fallback to "Other"
  },
  { timestamps: true }
);

// Prevent the same SMS being saved twice for the same user
transactionSchema.index({ user: 1, rawSms: 1 }, { unique: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
export { CATEGORY_VALUES };