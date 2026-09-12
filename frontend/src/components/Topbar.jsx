import { useState, useEffect, useRef } from "react";
import { Bell, Menu, Settings as SettingsIcon, LogOut, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Topbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <Menu size={23} />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Dashboard</h2>
          <p className="hidden sm:block text-sm text-slate-400">Track and understand your spending</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative text-slate-400 hover:text-white transition">
          <Bell size={21} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-slate-800 rounded-full pl-1 pr-2 py-1 transition"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {initial}
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden z-50">
              {user && (
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>
              )}

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <SettingsIcon size={16} />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;