import Transaction from "../models/Transaction.js";
import { detectSubscriptions } from "../services/subscriptionDetector.js";

// GET /api/dashboard/summary?month=2026-09
// Returns category-wise totals (for the pie chart) + overall total + review count
async function getSummary(req, res) {
  try {
    const { month } = req.query;
    const match = { user: req.user._id, type: "debit" };

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      match.date = { $gte: new Date(year, mon - 1, 1), $lt: new Date(year, mon, 1) };
    }

    const categoryTotals = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const overallTotal = categoryTotals.reduce((sum, c) => sum + c.total, 0);
    const needsReview = await Transaction.countDocuments({ ...match, confident: false });

    const incomeMatch = { ...match, type: "credit" };
    const incomeResult = await Transaction.aggregate([
      { $match: incomeMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalIncome = incomeResult[0]?.total || 0;

    res.json({
      total: overallTotal,
      income: totalIncome,
      needsReview,
      categories: categoryTotals.map((c) => ({ name: c._id, total: c.total, count: c.count })),
    });
  } catch (err) {
    res.status(500).json({ message: "Summary fetch nahi ho payi", error: err.message });
  }
}

// GET /api/dashboard/months
async function getAvailableMonths(req, res) {
  try {
    const months = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    const formatted = months.map((m) => `${m._id.year}-${String(m._id.month).padStart(2, "0")}`);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Months fetch nahi ho paye", error: err.message });
  }
}

// GET /api/dashboard/trend?months=6
async function getMonthlyTrend(req, res) {
  try {
    const months = Math.min(parseInt(req.query.months) || 6, 24);

    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    startDate.setMonth(startDate.getMonth() - (months - 1));

    const trend = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const result = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < months; i++) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;
      const debitEntry = trend.find((t) => t._id.year === year && t._id.month === month && t._id.type === "debit");
      const creditEntry = trend.find((t) => t._id.year === year && t._id.month === month && t._id.type === "credit");
      result.push({
        month: `${year}-${String(month).padStart(2, "0")}`,
        total: debitEntry ? debitEntry.total : 0,
        income: creditEntry ? creditEntry.total : 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Trend data fetch nahi hui", error: err.message });
  }
}

// GET /api/dashboard/subscriptions
async function getSubscriptions(req, res) {
  try {
    const transactions = await Transaction.find({ user: req.user._id, type: "debit" }).sort({ date: 1 });
    const subscriptions = detectSubscriptions(transactions);
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: "Subscriptions detect nahi hui", error: err.message });
  }
}

export { getSummary, getAvailableMonths, getMonthlyTrend, getSubscriptions };