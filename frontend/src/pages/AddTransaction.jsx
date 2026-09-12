import { useState } from "react";

import {
  Smartphone,
  Mail,
  PenLine,
  ArrowLeft,
  Send,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

const CATEGORIES = ["Food", "Groceries", "Travel", "Shopping", "Bills & Utilities", "Entertainment", "Health", "Other"];

function AddTransaction() {
  const [activeTab, setActiveTab] = useState("sms");
  const navigate = useNavigate();

  const tabs = [
    { id: "sms", label: "SMS", icon: Smartphone, description: "Paste bank transaction SMS" },
    { id: "email", label: "Email", icon: Mail, description: "Paste transaction email" },
    { id: "manual", label: "Manual", icon: PenLine, description: "Enter transaction yourself" },
  ];

  return (
    <Layout>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="shrink-0 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Add Transaction</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">Add a transaction using SMS, email, or manual entry.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left p-4 sm:p-5 rounded-2xl border transition ${
                active ? "bg-indigo-600/10 border-indigo-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`shrink-0 p-3 rounded-xl ${active ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                  <Icon size={21} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{tab.label}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tab.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-7">
        {activeTab === "sms" && <SmsForm />}
        {activeTab === "email" && <EmailForm />}
        {activeTab === "manual" && <ManualForm />}
      </div>
    </Layout>
  );
}

/* ========= SMS FORM ========= */
function SmsForm() {
  const [sms, setSms] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!sms.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/api/sms/parse", { text: sms });
      setStatus({ type: "ok", text: res.data.message });
      setSms("");
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "SMS parse nahi hui" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Parse transaction SMS</h2>
        <p className="text-slate-400 text-sm mt-1">Paste the SMS you received from your bank or payment provider.</p>
      </div>

      <textarea
        value={sms}
        onChange={(e) => setSms(e.target.value)}
        placeholder={`Example:\n\nRs.450.00 debited from A/c XX1234 on 09-Sep-26 to SWIGGY. UPI Ref No 123456789.\n\nMultiple SMS ho toh blank line se separate karo.`}
        rows={9}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none text-sm sm:text-base"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5">
        <p className="text-xs text-slate-500 leading-5">Your transaction details will be extracted automatically.</p>
        <button
          onClick={handleSubmit}
          disabled={!sms.trim() || loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
        >
          <Send size={18} />
          {loading ? "Parsing..." : "Parse SMS"}
        </button>
      </div>

      {status && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm border ${
            status.type === "ok" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}

/* ========= EMAIL FORM ========= */
function EmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/api/email/parse", { text: email });
      setStatus({ type: "ok", text: res.data.message });
      setEmail("");
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "Email parse nahi hui" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Parse transaction email</h2>
        <p className="text-slate-400 text-sm mt-1">Paste the transaction email content here.</p>
      </div>

      <textarea
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={`Example:\n\nDear Customer, Rs.1250.00 has been debited towards AMAZON on your account ending 1234 on 09-Sep-26.`}
        rows={9}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none text-sm sm:text-base"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5">
        <p className="text-xs text-slate-500 leading-5">Ledgerly will extract useful transaction information.</p>
        <button
          onClick={handleSubmit}
          disabled={!email.trim() || loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
        >
          <Send size={18} />
          {loading ? "Parsing..." : "Parse Email"}
        </button>
      </div>

      {status && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm border ${
            status.type === "ok" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}

/* ========= MANUAL FORM ========= */
function ManualForm() {
  const [formData, setFormData] = useState({ merchant: "", amount: "", category: "Other", type: "debit", date: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/api/transactions", formData);
      setStatus({ type: "ok", text: "Transaction add ho gayi!" });
      setFormData({ merchant: "", amount: "", category: "Other", type: "debit", date: "" });
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "Add nahi hui" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Add transaction manually</h2>
        <p className="text-slate-400 text-sm mt-1">Enter the transaction details yourself.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Merchant</label>
          <input
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            placeholder="e.g. Amazon"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 outline-none focus:border-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">Transaction Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="debit">Expense / Debit</option>
            <option value="credit">Income / Credit</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-slate-300 mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full md:max-w-[50%] bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {status && (
        <div
          className={`mt-5 p-3 rounded-lg text-sm border ${
            status.type === "ok" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="flex justify-stretch sm:justify-end mt-7">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 font-medium transition"
        >
          <CheckCircle2 size={18} />
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </div>
    </form>
  );
}

export default AddTransaction;