import { useState, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Utensils,
  Car,
  CreditCard,
  CalendarDays,
  ShoppingCart,
  Film,
  Receipt,
  HeartPulse,
  CircleDollarSign,
} from "lucide-react";

import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

const CATEGORY_ICON = {
  Food: Utensils,
  Groceries: ShoppingCart,
  Travel: Car,
  Shopping: ShoppingBag,
  "Bills & Utilities": Receipt,
  Entertainment: Film,
  Health: HeartPulse,
  Other: CircleDollarSign,
};

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function fmtINR(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function fmtDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function pctChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allTime, setAllTime] = useState({ total: 0, income: 0 });
  const [monthSummary, setMonthSummary] = useState({ total: 0, income: 0, categories: [] });
  const [trend, setTrend] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const currentMonth = monthKey();
      const [allTimeRes, monthRes, trendRes, budgetsRes, subsRes, txRes] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get(`/api/dashboard/summary?month=${currentMonth}`),
        api.get("/api/dashboard/trend?months=6"),
        api.get("/api/budgets"),
        api.get("/api/dashboard/subscriptions"),
        api.get("/api/transactions"),
      ]);
      setAllTime(allTimeRes.data);
      setMonthSummary(monthRes.data);
      setTrend(trendRes.data);
      setBudgets(budgetsRes.data);
      setSubscriptions(subsRes.data);
      setRecentTransactions(txRes.data.slice(0, 4));
    } catch (err) {
      setError("Dashboard data load nahi ho paya. Backend chal raha hai check karo.");
    } finally {
      setLoading(false);
    }
  }

  const balance = allTime.income - allTime.total;
  const thisMonthIncome = monthSummary.income;
  const thisMonthExpense = monthSummary.total;
  const savings = thisMonthIncome - thisMonthExpense;

  const thisMonthTrend = trend[trend.length - 1];
  const lastMonthTrend = trend[trend.length - 2];
  const incomeChange = lastMonthTrend ? pctChange(thisMonthTrend?.income || 0, lastMonthTrend.income) : null;
  const expenseChange = lastMonthTrend ? pctChange(thisMonthTrend?.total || 0, lastMonthTrend.total) : null;

  const stats = [
    { title: "Total Balance", value: fmtINR(balance), icon: Wallet },
    { title: "Total Income", value: fmtINR(thisMonthIncome), change: incomeChange, icon: ArrowDownLeft },
    { title: "Total Expenses", value: fmtINR(thisMonthExpense), change: expenseChange, icon: ArrowUpRight, invert: true },
    { title: "Savings", value: fmtINR(savings), icon: TrendingUp },
  ];

  const maxTrendValue = Math.max(...trend.map((t) => Math.max(t.total, t.income)), 1);
  const topCategories = monthSummary.categories.slice(0, 4);
  const upcomingSubs = [...subscriptions]
    .map((s) => {
      const next = new Date(s.lastChargedOn);
      next.setDate(next.getDate() + s.cadenceDays);
      return { ...s, nextDate: next };
    })
    .sort((a, b) => a.nextDate - b.nextDate)
    .slice(0, 3);

  if (loading) {
    return (
      <Layout>
        <div className="text-center text-slate-400 text-sm py-16">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Good to see you 👋</h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">Here's what's happening with your finances.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const positive = stat.change != null ? (stat.invert ? stat.change <= 0 : stat.change >= 0) : true;
          return (
            <div key={stat.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{stat.title}</p>
                <div className="shrink-0 p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon size={20} />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-4">{stat.value}</h2>
              <div className="flex items-center gap-2 mt-2">
                {stat.change != null ? (
                  <>
                    <span className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
                      {stat.change >= 0 ? "+" : ""}
                      {stat.change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500">vs last month</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">This month</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Spending Trend</h2>
            <p className="text-sm text-slate-500 mt-1">Income vs expenses, last 6 months</p>
          </div>

          {trend.length === 0 ? (
            <p className="text-sm text-slate-500">Abhi trend data nahi hai.</p>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[500px] h-64 sm:h-72 flex items-end gap-4 sm:gap-6">
                  {trend.map((item) => {
                    const [y, m] = item.month.split("-").map(Number);
                    const label = new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short" });
                    const incomeHeight = (item.income / maxTrendValue) * 100;
                    const expenseHeight = (item.total / maxTrendValue) * 100;
                    return (
                      <div key={item.month} className="flex-1 h-full flex flex-col justify-end">
                        <div className="flex items-end justify-center gap-1.5 sm:gap-2 h-full">
                          <div
                            className="w-4 sm:w-5 bg-indigo-500 rounded-t-md"
                            style={{ height: `${incomeHeight}%` }}
                            title={`Income ${fmtINR(item.income)}`}
                          />
                          <div
                            className="w-4 sm:w-5 bg-red-500/70 rounded-t-md"
                            style={{ height: `${expenseHeight}%` }}
                            title={`Expense ${fmtINR(item.total)}`}
                          />
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-3">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-center gap-5 sm:gap-6 mt-5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Income
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Expenses
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Expense Categories</h2>
            <p className="text-sm text-slate-500 mt-1">Where your money goes this month</p>
          </div>

          {topCategories.length === 0 ? (
            <p className="text-sm text-slate-500">Is mahine ka koi kharcha nahi mila.</p>
          ) : (
            <div className="space-y-5">
              {topCategories.map((cat) => {
                const Icon = CATEGORY_ICON[cat.name] || CircleDollarSign;
                const percentage = thisMonthExpense > 0 ? (cat.total / thisMonthExpense) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 p-2 rounded-lg bg-slate-800 text-slate-300">
                          <Icon size={16} />
                        </div>
                        <span className="text-sm truncate">{cat.name}</span>
                      </div>
                      <span className="text-sm font-medium shrink-0">{fmtINR(cat.total)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <p className="text-sm text-slate-500 mt-1">Your latest financial activity</p>
            </div>
            <Link to="/transactions" className="text-sm text-indigo-400 hover:text-indigo-300 whitespace-nowrap">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {recentTransactions.length === 0 && (
              <p className="p-6 text-sm text-slate-500">Koi transaction nahi mila.</p>
            )}
            {recentTransactions.map((t) => (
              <div key={t._id} className="flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {t.type === "credit" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.merchant}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {t.category} • {fmtDate(t.date)}
                    </p>
                  </div>
                </div>
                <p className={`shrink-0 font-semibold text-sm sm:text-base ${t.type === "credit" ? "text-emerald-400" : "text-white"}`}>
                  {t.type === "credit" ? "+" : "-"}{fmtINR(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold">Budget Overview</h2>
                <p className="text-xs text-slate-500 mt-1">This month</p>
              </div>
              <TrendingDown size={20} className="text-indigo-400" />
            </div>

            {budgets.length === 0 ? (
              <p className="text-sm text-slate-500">Koi budget set nahi hai.</p>
            ) : (
              <div className="space-y-5">
                {budgets.slice(0, 3).map((budget) => (
                  <div key={budget.category}>
                    <div className="flex justify-between gap-3 text-sm mb-2">
                      <span>{budget.category}</span>
                      <span className="text-slate-400 text-xs sm:text-sm whitespace-nowrap">
                        {fmtINR(budget.spent)} / {fmtINR(budget.monthlyLimit)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${budget.exceeded ? "bg-red-500" : budget.percentUsed >= 90 ? "bg-yellow-500" : "bg-indigo-500"}`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/budgets" className="block text-center text-sm text-indigo-400 hover:text-indigo-300 mt-6">
              View budgets
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="shrink-0 p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <CalendarDays size={19} />
              </div>
              <div>
                <h2 className="font-semibold">Upcoming Payments</h2>
                <p className="text-xs text-slate-500 mt-1">Recurring payments</p>
              </div>
            </div>

            {upcomingSubs.length === 0 ? (
              <p className="text-sm text-slate-500">Abhi koi subscription detect nahi hui.</p>
            ) : (
              <div className="space-y-4">
                {upcomingSubs.map((sub) => (
                  <div key={sub.merchant} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sub.merchant}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {sub.nextDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">{fmtINR(sub.averageAmount)}</p>
                  </div>
                ))}
              </div>
            )}

            <Link to="/subscriptions" className="block text-center text-sm text-indigo-400 hover:text-indigo-300 mt-6">
              View subscriptions
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;