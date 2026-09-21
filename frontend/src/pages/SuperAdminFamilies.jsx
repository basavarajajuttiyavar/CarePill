import React, { useEffect, useState } from "react";
import { Users, Home, Calendar, Trash2, Ban } from "lucide-react";
import { api } from "../api";

export default function SuperAdminFamilies() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilies = async () => {
    try {
      const data = await api.getFamilies();
      setFamilies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleSuspend = async (id) => {
    if (confirm("Are you sure you want to suspend this family's access?")) {
      await api.suspendFamily(id);
      fetchFamilies();
    }
  };

  const handleReactivate = async (id) => {
    if (confirm("Are you sure you want to reactivate this family's access?")) {
      await api.reactivateFamily(id);
      fetchFamilies();
    }
  };

  const handleDelete = async (id) => {
    if (confirm("DANGER: Are you sure you want to permanently delete this family and ALL their data?")) {
      await api.deleteFamily(id);
      fetchFamilies();
    }
  };

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading families...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#6D1B36] mb-1">Manage Families</h1>
          <p className="text-[14px] text-[#8A6A75]">View and manage all family accounts in the system.</p>
        </div>
        <div className="bg-[#FFF5F8] px-6 py-4 rounded-xl flex items-center gap-4">
          <div className="text-rose"><Users size={24} /></div>
          <div>
            <div className="text-[20px] font-bold text-[#2B1420]">{families.length}</div>
            <div className="text-[12px] text-[#8A6A75]">Total Families</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5fr_2fr_1fr_1fr_0.8fr] gap-4 px-6 py-4 border-b border-border text-[13px] font-medium text-[#8A6A75]">
          <div>Family Name</div>
          <div>Admin Details</div>
          <div>Members</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#F6E8ED]">
          {families.map((r) => (
            <div key={r.family_id} className="grid grid-cols-[2.5fr_2fr_1fr_1fr_0.8fr] gap-4 items-center px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFE8EE] flex items-center justify-center text-rose shrink-0">
                  <Home size={18} />
                </div>
                <div>
                  <div className="font-semibold text-[#2B1420] text-[16px]">{r.family_name}</div>
                  <div className="text-[#8A6A75] text-[12px]">family_id: {r.family_id}</div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-[#2B1420] text-[15px]">{r.admin_name}</div>
                <div className="text-[#8A6A75] text-[14px]">{r.email}</div>
                <div className="text-[#8A6A75] text-[14px]">{r.phone || "No phone"}</div>
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} className="text-rose" />
                <div className="font-semibold text-[#2B1420] text-[14px]">{r.member_count}</div>
                <div className="text-[#8A6A75] text-[12px]">Members</div>
              </div>

              <div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium border ${r.status === 'active' ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]' :
                  r.status === 'suspended' ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]' :
                    'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]'
                  }`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {r.status === 'active' && (
                  <button
                    onClick={() => handleSuspend(r.family_id)}
                    title="Suspend"
                    className="flex items-center justify-center border border-[#FFE0B2] text-[#E65100] bg-white hover:bg-[#FFF3E0] p-2 rounded-lg transition-colors"
                  >
                    <Ban size={16} />
                  </button>
                )}
                {r.status === 'suspended' && (
                  <button
                    onClick={() => handleReactivate(r.family_id)}
                    title="Reactivate"
                    className="flex items-center justify-center border border-[#CEEAD6] text-[#137333] bg-white hover:bg-[#E6F4EA] p-2 rounded-lg transition-colors"
                  >
                    <Users size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r.family_id)}
                  title="Delete"
                  className="flex items-center justify-center border border-[#FAD2CF] text-[#C5221F] bg-white hover:bg-[#FCE8E6] p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {families.length === 0 && (
            <div className="px-6 py-8 text-center text-[#8A6A75] text-[14px]">
              No families found in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
