import React, { useEffect, useState } from "react";
import { Users, FileCheck, Pill, Activity } from "lucide-react";
import { api } from "../api";

export default function SuperAdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSuperAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading statistics...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[#6D1B36] mb-1">System Overview</h1>
        <p className="text-[14px] text-[#8A6A75]">High-level metrics for the Family Medicine Tracker platform.</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-border flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#2B1420]">{stats.activeFamilies}</div>
            <div className="text-[13px] text-[#8A6A75]">Active Families</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#FFF5F8] text-rose flex items-center justify-center">
            <FileCheck size={24} />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#2B1420]">{stats.pendingRequests}</div>
            <div className="text-[13px] text-[#8A6A75]">Pending Approvals</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#2B1420]">{stats.totalUsers}</div>
            <div className="text-[13px] text-[#8A6A75]">Total Members</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#FCECD8] text-[#9A5405] flex items-center justify-center">
            <Pill size={24} />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#2B1420]">{stats.totalPrescriptions}</div>
            <div className="text-[13px] text-[#8A6A75]">Prescriptions</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-[16px] font-bold text-[#2B1420]">Recent Activity</h2>
        </div>
        <div className="divide-y divide-[#F6E8ED]">
          {stats.recentActivity.map((r, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#2B1420] text-[14px]">{r.description}</div>
                <div className="text-[#8A6A75] text-[12px] mt-1">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="text-[12px] font-medium px-3 py-1 rounded-full border border-border capitalize">
                {r.status}
              </div>
            </div>
          ))}
          {stats.recentActivity.length === 0 && (
            <div className="px-6 py-8 text-center text-[#8A6A75] text-[14px]">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
