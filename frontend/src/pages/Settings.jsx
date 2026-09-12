import { useState, useEffect } from "react";
import { User, Mail, Lock, Bell, Shield, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import api from "../services/api";

function Settings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [profileStatus, setProfileStatus] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/api/auth/me");
      setProfile({ name: res.data.name, email: res.data.email });
    } catch (err) {
      // if this fails, ProtectedRoute/interceptor will already redirect on 401
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileStatus(null);
    try {
      const res = await api.patch("/api/auth/profile", profile);
      localStorage.setItem("user", JSON.stringify(res.data));
      setProfileStatus({ type: "ok", text: "Profile update ho gayi" });
    } catch (err) {
      setProfileStatus({
        type: "error",
        text: err.response?.data?.message || "Update fail hua",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordStatus(null);
    try {
      await api.patch("/api/auth/password", passwordForm);
      setPasswordStatus({ type: "ok", text: "Password change ho gaya" });
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordStatus({
        type: "error",
        text: err.response?.data?.message || "Password change nahi hua",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <Layout>
      <div className="w-full max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Manage your profile and application preferences.
          </p>
        </div>

        {/* Profile */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-start sm:items-center gap-3 mb-6">
            <div className="shrink-0 p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <User size={21} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <p className="text-sm text-slate-500 mt-1">
                Update your personal information.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {profileStatus && (
              <p
                className={`text-sm mt-4 ${profileStatus.type === "ok" ? "text-emerald-400" : "text-red-400"}`}
              >
                {profileStatus.text}
              </p>
            )}

            <div className="flex justify-stretch sm:justify-end mt-6">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium transition"
              >
                <Save size={18} />
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Security */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-start sm:items-center gap-3 mb-6">
            <div className="shrink-0 p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Lock size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Security</h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage your password and account security.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {passwordStatus && (
              <p
                className={`text-sm mt-4 ${passwordStatus.type === "ok" ? "text-emerald-400" : "text-red-400"}`}
              >
                {passwordStatus.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-5 w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-lg text-sm font-medium transition"
            >
              {savingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* Notifications - static for now, not wired to backend */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-start sm:items-center gap-3 mb-6">
            <div className="shrink-0 p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Bell size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-slate-500 mt-1">
                Coming soon — not yet connected to backend.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-start sm:items-center gap-3 mb-5">
            <div className="shrink-0 p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Privacy</h2>
              <p className="text-sm text-slate-500 mt-1">
                Your financial information stays private.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <p className="text-sm text-slate-300 leading-6">
              Ledgerly only uses your transaction information to provide
              financial insights and analytics.
            </p>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start sm:items-center gap-3 mb-4">
            <div className="shrink-0 p-3 rounded-xl bg-red-500/10 text-red-400">
              <LogOut size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-400">
                Account Actions
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Actions related to your account.
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-5 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </section>
      </div>
    </Layout>
  );
}

export default Settings;
