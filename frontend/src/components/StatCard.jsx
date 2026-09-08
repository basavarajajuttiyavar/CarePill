import React from "react";

export default function StatCard({ icon: Icon, iconBg, value, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between bg-white rounded-2xl border border-border px-5 py-4 text-left hover:border-[#E9AFC0] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={20} className="text-rose" />
        </div>
        <div>
          <div className="text-[22px] font-semibold text-[#2B1420] leading-tight">{value}</div>
          <div className="text-[13px] font-medium text-[#2B1420]">{label}</div>
          <div className="text-[11px] text-[#8A6A75]">{sub}</div>
        </div>
      </div>
      <span className="text-rose">›</span>
    </button>
  );
}
