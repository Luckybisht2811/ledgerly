import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

// POST /api/budgets
// Body: { category: "Food", monthlyLimit: 5000 }
// Upserts — calling this again for the same category just updates the limit.
async function setBudget(req, res) {
  try {
    const { category, monthlyLimit } = req.body;
    if (!category || monthlyLimit === undefined) {
      return res.status(400).json({ message: "category aur monthlyLimit dono chahiye" });
    }
    if (monthlyLimit < 0) {
      return res.status(400).json({ message: "monthlyLimit negative nahi ho sakta" });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category },
      { monthlyLimit },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(budget);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Category valid nahi hai", error: err.message });
    }
    res.status(500).json({ message: "Budget set nahi hua", error: err.message });
  }
}

// GET /api/budgets
// Returns every budget the user has set, joined with this month's actual
// spend per category, so the frontend can render a progress bar directly.
async function getBudgets(req, res) {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const spend = await Transaction.aggregate([
      { $match: { user: req.user._id, type: "debit", date: { $gte: start, $lt: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);
    const spendMap = Object.fromEntries(spend.map((s) => [s._id, s.total]));

    const result = budgets.map((b) => {
      const spent = spendMap[b.category] || 0;
      const percentUsed = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      return {
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        spent,
        percentUsed,
        exceeded: spent > b.monthlyLimit,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Budgets fetch nahi hue", error: err.message });
  }
}

// DELETE /api/budgets/:category
async function deleteBudget(req, res) {
  try {
    const result = await Budget.findOneAndDelete({ user: req.user._id, category: req.params.category });
    if (!result) return res.status(404).json({ message: "Is category ka budget nahi mila" });
    res.json({ message: "Budget delete ho gaya" });
  } catch (err) {
    res.status(500).json({ message: "Delete fail hua", error: err.message });
  }
}

export { setBudget, getBudgets, deleteBudget };
