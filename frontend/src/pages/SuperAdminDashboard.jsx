import React, { useEffect, useState } from "react";
import { Users, Home, Calendar, Check, X } from "lucide-react";
import { api } from "../api";

export default function SuperAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await api.getPendingRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    await api.approveRequest(id);
    fetchRequests();
  };

  const handleReject = async (id) => {
    if (confirm("Are you sure you want to reject this request?")) {
      await api.rejectRequest(id);
      fetchRequests();
    }
  };

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading pending requests...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#6D1B36] mb-1">Pending Family Requests</h1>
          <p className="text-[14px] text-[#8A6A75]">Review and approve or reject new family account requests.</p>
        </div>
        <div className="bg-[#FFF5F8] px-6 py-4 rounded-xl flex items-center gap-4">
          <div className="text-rose"><Users size={24} /></div>
          <div>
            <div className="text-[20px] font-bold text-[#2B1420]">{requests.length}</div>
            <div className="text-[12px] text-[#8A6A75]">Pending Requests</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border">
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_100px] px-6 py-3 border-b border-border text-[13px] font-medium text-[#8A6A75]">
          <div>Family Name</div>
          <div>Admin Details</div>
          <div>Members</div>
          <div>Requested On</div>
          <div>Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#F6E8ED]">
          {requests.map((r) => (
            <div key={r.family_id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_100px] items-center px-6 py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFE8EE] flex items-center justify-center text-rose shrink-0">
                  <Home size={18} />
                </div>
                <div>
                  <div className="font-semibold text-[#2B1420] text-[15px]">{r.family_name}</div>
                  <div className="text-[#8A6A75] text-[12px]">family_id: {r.family_id}</div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-[#2B1420] text-[14px]">{r.admin_name}</div>
                <div className="text-[#8A6A75] text-[13px]">{r.email}</div>
                <div className="text-[#8A6A75] text-[13px]">{r.phone || "No phone"}</div>
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} className="text-rose" />
                <div className="font-semibold text-[#2B1420] text-[14px]">{r.member_count}</div>
                <div className="text-[#8A6A75] text-[12px]">Members</div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-rose" />
                <div>
                  <div className="font-semibold text-[#2B1420] text-[14px]">
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-[#8A6A75] text-[12px]">
                    {new Date(r.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(r.family_id)}
                  className="flex items-center justify-center border border-green-500 text-green-600 bg-white hover:bg-green-50 w-8 h-8 rounded-lg transition-colors shadow-sm"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleReject(r.family_id)}
                  className="flex items-center justify-center border border-[#E9AFC0] text-rose bg-white hover:bg-[#FFF5F8] w-8 h-8 rounded-lg transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="px-6 py-8 text-center text-[#8A6A75] text-[14px]">
              No pending family requests at the moment.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-[#FFE8EE] rounded-xl flex items-center justify-center mb-3 text-rose">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
        </div>
        <div className="text-[13px] text-[#8A6A75]">Review each request carefully before taking action.</div>
      </div>
    </div>
  );
}
