import { useState, useEffect } from "react";
import {
  RefreshCcw,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Info,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../services/api";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/dashboard/subscriptions");
      setSubscriptions(res.data);
    } catch (err) {
      setError("Subscriptions load nahi ho payi");
    } finally {
      setLoading(false);
    }
  }

  const monthlyCost = subscriptions.reduce((total, sub) => total + sub.averageAmount, 0);
  const yearlyCost = monthlyCost * 12;

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function nextBillingEstimate(sub) {
    const next = new Date(sub.lastChargedOn);
    next.setDate(next.getDate() + sub.cadenceDays);
    return next;
  }

  const upcoming = [...subscriptions].sort((a, b) => nextBillingEstimate(a) - nextBillingEstimate(b)).slice(0, 3);

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Subscriptions</h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Automatically detected recurring payments.</p>
        </div>

        <button
          onClick={loadSubscriptions}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 sm:mb-8">
        <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300">
          Ledgerly detects subscriptions automatically by finding merchants charged the same amount roughly every month.
          Nothing to add manually — just keep parsing your SMS/email.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-slate-400 text-sm py-10">Loading...</div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">
          Abhi koi recurring subscription detect nahi hui. Kam se kam 2 mahine ka same-amount, same-merchant kharcha chahiye detect hone ke liye.
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Active Subscriptions</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2">{subscriptions.length}</h2>
                </div>
                <div className="shrink-0 p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Monthly Cost</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2">₹{Math.round(monthlyCost).toLocaleString("en-IN")}</h2>
                </div>
                <div className="shrink-0 p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <CreditCard size={22} />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 sm:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Estimated Yearly Cost</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2">₹{Math.round(yearlyCost).toLocaleString("en-IN")}</h2>
                </div>
                <div className="shrink-0 p-3 rounded-xl bg-orange-500/10 text-orange-400">
                  <CalendarDays size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming payments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
            <div className="mb-5 sm:mb-6">
              <h2 className="font-semibold">Estimated Next Payments</h2>
              <p className="text-sm text-slate-500 mt-1">Based on average cadence between past charges.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((sub) => (
                <div key={sub.merchant} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{sub.merchant}</h3>
                      <p className="text-xs text-slate-500 mt-1">~{fmtDate(nextBillingEstimate(sub))}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">₹{sub.averageAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All subscriptions table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800">
              <h2 className="text-lg sm:text-xl font-semibold">All Detected Subscriptions</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr className="text-left text-sm text-slate-400">
                    <th className="px-6 py-4 font-medium">Subscription</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Cadence</th>
                    <th className="px-6 py-4 font-medium">Last Charged</th>
                    <th className="px-6 py-4 font-medium">Occurrences</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subscriptions.map((sub) => (
                    <tr key={sub.merchant} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-semibold">
                            {sub.merchant.charAt(0)}
                          </div>
                          <p className="font-medium">{sub.merchant}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs whitespace-nowrap">{sub.category}</span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-400">every ~{sub.cadenceDays} days</td>
                      <td className="px-6 py-5 text-sm text-slate-400 whitespace-nowrap">{fmtDate(sub.lastChargedOn)}</td>
                      <td className="px-6 py-5 text-sm text-slate-400">{sub.occurrences}x</td>
                      <td className="px-6 py-5 font-semibold whitespace-nowrap text-right">₹{sub.averageAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default Subscriptions;