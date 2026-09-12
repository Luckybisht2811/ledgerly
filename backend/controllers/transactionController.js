import Transaction from "../models/Transaction.js";
import CategoryRule from "../models/CategoryRule.js";

// POST /api/transactions
// Body: { merchant, amount, category, type, date }
// For the "Manual" tab — user types details directly instead of pasting SMS/email.
async function createTransaction(req, res) {
  try {
    const { merchant, amount, category, type, date } = req.body;
    if (!merchant || amount === undefined || !category || !date) {
      return res.status(400).json({ message: "merchant, amount, category aur date sab zaroori hain" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "amount 0 se zyada hona chahiye" });
    }

    const tx = await Transaction.create({
      user: req.user._id,
      amount: Number(amount),
      merchant,
      category,
      type: type === "credit" ? "credit" : "debit",
      date: new Date(date),
      rawSms: `MANUAL:${merchant}:${amount}:${date}:${Date.now()}`,
      source: "manual",
      confident: true,
    });

    await CategoryRule.findOneAndUpdate(
      { user: req.user._id, merchant: merchant.toUpperCase() },
      { category },
      { upsert: true }
    );

    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ message: "Transaction add nahi hui", error: err.message });
  }
}

// GET /api/transactions?month=2026-09&type=debit
async function getTransactions(req, res) {
  try {
    const { month, type } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      query.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Transactions fetch nahi ho paye", error: err.message });
  }
}

// PATCH /api/transactions/:id
async function updateTransactionCategory(req, res) {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ message: "Category zaroori hai" });

    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction nahi mili" });

    tx.category = category;
    tx.confident = true;
    await tx.save();

    await CategoryRule.findOneAndUpdate(
      { user: req.user._id, merchant: tx.merchant.toUpperCase() },
      { category },
      { upsert: true, new: true }
    );

    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: "Update fail hua", error: err.message });
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(req, res) {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction nahi mili" });
    res.json({ message: "Transaction delete ho gayi" });
  } catch (err) {
    res.status(500).json({ message: "Delete fail hua", error: err.message });
  }
}

export { createTransaction, getTransactions, updateTransactionCategory, deleteTransaction };