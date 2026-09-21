import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import Avatar from "./Avatar";
import { getSessionUser, clearSession } from "../api";
import { useNavigate } from "react-router-dom";

export default function TopBar({ familyName }) {
  const user = getSessionUser() || { name: "Account", role: "" };
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="w-full bg-white border-b border-border z-10 sticky top-0 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between px-8 py-3.5 max-w-[1400px] mx-auto w-full">
        <div>
          {familyName && (
            <p className="text-[13px] text-[#8A6A75]">
              Family: <span className="text-rose font-medium">{familyName}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-5">
          <button className="relative text-[#5A3B45]">
            <Bell size={20} />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 outline-none text-left"
            >
              <Avatar name={user.name} size={36} />
              <div className="leading-tight">
                <div className="text-[13px] font-medium text-[#2B1420]">{user.name}</div>
                <div className="text-[11px] text-[#8A6A75] capitalize">{user.role}</div>
              </div>
              <ChevronDown size={16} className={`text-[#8A6A75] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#8A6A75] hover:bg-[#FFF5F8] hover:text-rose transition-colors text-left"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
