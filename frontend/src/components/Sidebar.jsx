import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home, Users, Pill, CalendarClock, History as HistoryIcon, Stethoscope,
  Contact, Settings, LogOut, ShieldCheck,
} from "lucide-react";
import { clearSession } from "../api";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: Home, end: true },
  { to: "/members", label: "Family Members", icon: Users },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/today", label: "Today's Medicines", icon: CalendarClock },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/emergency-card", label: "Emergency Card", icon: Contact },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-maroon text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
          <ShieldCheck size={20} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-[15px]">Family Medicine</div>
          <div className="text-[#F2A6BE] text-[15px] font-semibold -mt-0.5">Tracker</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                isActive ? "bg-white text-maroon font-medium" : "text-white/85 hover:bg-white/10"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6 pt-2 border-t border-white/10 mt-2">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/85 hover:bg-white/10">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
