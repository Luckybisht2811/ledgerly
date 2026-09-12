import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

const CATEGORIES = ["Food", "Groceries", "Travel", "Shopping", "Bills & Utilities", "Entertainment", "Health", "Other"];

function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/transactions");
      setTransactions(res.data);
    } catch (err) {
      setError("Transactions load nahi ho paye. Backend chal raha hai check karo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCategoryChange(id, newCategory) {
    try {
      await api.patch(`/api/transactions/${id}`, { category: newCategory });
      loadTransactions();
    } catch (err) {
      // no-op, list just won't update
    } finally {
      setEditingId(null);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/transactions/${id}`);
      loadTransactions();
    } catch (err) {
      // no-op
    }
  }

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.merchant.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || t.category === categoryFilter;
    const matchesType =
      typeFilter === "All Types" ||
      (typeFilter === "Debit" && t.type === "debit") ||
      (typeFilter === "Credit" && t.type === "credit");
    return matchesSearch && matchesCategory && matchesType;
  });

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">View and manage all your transactions.</p>
        </div>

        <button
          onClick={() => navigate("/add-transaction")}
          className="w-full md:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 outline-none focus:border-indigo-500"
          >
            <option>All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 outline-none focus:border-indigo-500"
          >
            <option>All Types</option>
            <option>Debit</option>
            <option>Credit</option>
          </select>

          <button
            onClick={() => { setSearch(""); setCategoryFilter("All Categories"); setTypeFilter("All Types"); }}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition flex items-center justify-center gap-2"
          >
            <Filter size={18} />
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {/* Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-slate-800/50">
                <tr className="text-left text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Transaction</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filtered.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {transaction.type === "credit" ? <ArrowUpRight size={19} /> : <ArrowDownLeft size={19} />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{transaction.merchant}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {editingId === transaction._id ? (
                        <select
                          autoFocus
                          defaultValue={transaction.category}
                          onBlur={() => setEditingId(null)}
                          onChange={(e) => handleCategoryChange(transaction._id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingId(transaction._id)}
                          className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
                        >
                          {transaction.category}
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-400">{fmtDate(transaction.date)}</td>

                    <td className="px-6 py-5 text-xs text-slate-500 capitalize">{transaction.source}</td>

                    <td
                      className={`px-6 py-5 text-right font-semibold ${
                        transaction.type === "credit" ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-5">
                      <button onClick={() => handleDelete(transaction._id)} className="text-slate-500 hover:text-red-400 transition">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-10 text-center text-slate-500 text-sm">Koi transaction nahi mila.</div>
            )}
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 border-t border-slate-800">
          <p className="text-sm text-slate-500 text-center">
            Showing {filtered.length} of {transactions.length} transactions
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Transactions;