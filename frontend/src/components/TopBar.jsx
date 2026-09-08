import React from "react";
import { Bell, ChevronDown } from "lucide-react";
import Avatar from "./Avatar";
import { getSessionUser } from "../api";

export default function TopBar({ familyName }) {
  const user = getSessionUser() || { name: "Account", role: "" };

  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white">
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
        <div className="flex items-center gap-2">
          <Avatar name={user.name} size={36} />
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-[#2B1420]">{user.name}</div>
            <div className="text-[11px] text-[#8A6A75] capitalize">{user.role}</div>
          </div>
          <ChevronDown size={16} className="text-[#8A6A75]" />
        </div>
      </div>
    </div>
  );
}
