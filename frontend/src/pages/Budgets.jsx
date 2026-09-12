import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  Receipt,
  HeartPulse,
  ShoppingCart,
  CircleDollarSign,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../services/api";

const CATEGORY_META = {
  Food: { icon: Utensils, color: "bg-orange-500" },
  Groceries: { icon: ShoppingCart, color: "bg-emerald-500" },
  Travel: { icon: Car, color: "bg-blue-500" },
  Shopping: { icon: ShoppingBag, color: "bg-purple-500" },
  "Bills & Utilities": { icon: Receipt, color: "bg-yellow-500" },
  Entertainment: { icon: Film, color: "bg-pink-500" },
  Health: { icon: HeartPulse, color: "bg-teal-500" },
  Other: { icon: CircleDollarSign, color: "bg-slate-500" },
};
const CATEGORIES = Object.keys(CATEGORY_META);

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState("Food");
  const [formLimit, setFormLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    setLoading(true);
    try {
      const res = await api.get("/api/budgets");
      setBudgets(res.data);
    } catch (err) {
      setError("Budgets load nahi ho paye");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBudget() {
    if (!formLimit || Number(formLimit) <= 0) {
      setError("Ek valid limit amount daalo");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/api/budgets", { category: formCategory, monthlyLimit: Number(formLimit) });
      setFormLimit("");
      setShowForm(false);
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.message || "Budget set nahi hua");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    try {
      await api.delete(`/api/budgets/${encodeURIComponent(category)}`);
      loadBudgets();
    } catch (err) {
      // no-op
    }
  }

  const totalBudget = budgets.reduce((total, b) => total + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((total, b) => total + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Budgets</h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Set spending limits and stay on track.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
        >
          <Plus size={19} />
          Add Budget
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Monthly Limit (₹)</label>
              <input
                type="number"
                value={formLimit}
                onChange={(e) => setFormLimit(e.target.value)}
                placeholder="5000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleAddBudget}
              disabled={saving}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-400 text-sm py-10">Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">
          Abhi koi budget set nahi hai. "Add Budget" dabao shuru karne ke liye.
        </div>
      ) : (
        <>
          {/* Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
              <p className="text-sm text-slate-400">Total Budget</p>
              <h2 className="text-2xl font-bold mt-2">₹{totalBudget.toLocaleString("en-IN")}</h2>
              <p className="text-xs text-slate-500 mt-2">This month</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
              <p className="text-sm text-slate-400">Total Spent</p>
              <h2 className="text-2xl font-bold mt-2">₹{totalSpent.toLocaleString("en-IN")}</h2>
              <p className="text-xs text-slate-500 mt-2">{percentage.toFixed(1)}% of total budget</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-slate-400">Remaining</p>
              <h2 className={`text-2xl font-bold mt-2 ${remaining < 0 ? "text-red-400" : "text-emerald-400"}`}>
                ₹{remaining.toLocaleString("en-IN")}
              </h2>
              <p className="text-xs text-slate-500 mt-2">Available to spend</p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h2 className="font-semibold">Monthly Spending</h2>
                <p className="text-sm text-slate-500 mt-1">You've used {percentage.toFixed(1)}% of your budget</p>
              </div>
              <span className="text-sm font-semibold text-slate-300">
                ₹{totalSpent.toLocaleString("en-IN")} / ₹{totalBudget.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Budget Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {budgets.map((budget) => {
              const meta = CATEGORY_META[budget.category] || CATEGORY_META.Other;
              const Icon = meta.icon;
              const progress = budget.monthlyLimit > 0 ? (budget.spent / budget.monthlyLimit) * 100 : 0;
              const isOverBudget = budget.exceeded;
              const isWarning = progress >= 80 && !isOverBudget;

              return (
                <div key={budget.category} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`shrink-0 w-11 h-11 rounded-xl ${meta.color}/10 flex items-center justify-center`}>
                        <Icon size={21} className={meta.color.replace("bg-", "text-")} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{budget.category}</h3>
                        <p className="text-xs text-slate-500 mt-1">Monthly budget</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(budget.category)} className="shrink-0 text-slate-500 hover:text-red-400 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Spent</p>
                      <p className="text-xl font-bold mt-1">₹{budget.spent.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Limit</p>
                      <p className="text-sm font-medium mt-1">₹{budget.monthlyLimit.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs mb-2 gap-3">
                      <span className="text-slate-500">{Math.round(progress)}% used</span>
                      <span className={isOverBudget ? "text-red-400" : isWarning ? "text-yellow-400" : "text-emerald-400"}>
                        {isOverBudget ? "Over budget" : isWarning ? "Almost there" : "On track"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isOverBudget ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <p className="text-sm text-slate-400">
                      {isOverBudget ? (
                        <>Over by <span className="text-red-400 font-medium">₹{(budget.spent - budget.monthlyLimit).toLocaleString("en-IN")}</span></>
                      ) : (
                        <>Remaining <span className="text-white font-medium">₹{(budget.monthlyLimit - budget.spent).toLocaleString("en-IN")}</span></>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
}

export default Budgets;