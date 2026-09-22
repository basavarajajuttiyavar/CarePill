import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Pill, CalendarClock, Plus, Sun, Moon, CheckCircle2, Bell } from "lucide-react";
import { api, getSessionUser } from "../api";
import Avatar from "../components/Avatar";
import StatCard from "../components/StatCard";
import { calcAge } from "../utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getSessionUser();
  const [members, setMembers] = useState([]);
  const [today, setToday] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [medicineCounts, setMedicineCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [familyData, todayData] = await Promise.all([api.getFamily(), api.getToday()]);
        setMembers(familyData.members || []);
        setToday(todayData || []);

        if (user.role === 'admin') {
          try {
            const pending = await api.getPendingMembers();
            setPendingMembers(pending);
          } catch (e) { }
        }

        const counts = {};
        await Promise.all(
          (familyData.members || []).map(async (m) => {
            const meds = await api.getMedicines(m.member_id, "active");
            counts[m.member_id] = meds.length;
          })
        );
        setMedicineCounts(counts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeMedicineTotal = Object.values(medicineCounts).reduce((a, b) => a + b, 0);

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-[13px] text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[#2B1420]">Family Health Overview</h1>
        <p className="text-[13px] text-[#8A6A75] mt-1">Manage your family’s health, medicines, and medical information in one place.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Users} iconBg="#FBE3EA" value={members.length} label="Family Members" sub="View all members" onClick={() => navigate("/members")} />
        <StatCard icon={Pill} iconBg="#FBE3EA" value={activeMedicineTotal} label="Active Medicines" sub="Across all members" onClick={() => navigate("/medicines")} />
        <StatCard icon={CalendarClock} iconBg="#FCEFD8" value={today.length} label="Medicines Today" sub="To be taken" onClick={() => navigate("/today")} />
      </div>

      {pendingMembers.length > 0 && (
        <div className="bg-[#FFF5F8] border border-[#FAD2CF] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCE8E6] rounded-full flex items-center justify-center text-[#C5221F]">
              <Users size={20} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#C5221F]">Pending Join Requests</div>
              <div className="text-[13px] text-[#8A6A75]">You have {pendingMembers.length} member{pendingMembers.length > 1 ? 's' : ''} waiting to join your family.</div>
            </div>
          </div>
          <button onClick={() => navigate("/members")} className="text-[13px] font-medium bg-white text-[#C5221F] border border-[#FAD2CF] px-4 py-2 rounded-lg hover:bg-[#FCE8E6]">
            Review Requests
          </button>
        </div>
      )}

      <div className="grid grid-cols-[1.3fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-[15px] text-[#2B1420]">My Family</h2>
            <button onClick={() => navigate("/members/new")} className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-rose px-3 py-1.5 rounded-lg">
              <Plus size={14} /> Add Member
            </button>
          </div>
          <div>
            {members.map((m) => (
              <button
                key={m.member_id}
                onClick={() => navigate(`/members/${m.member_id}`)}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b last:border-0 border-[#F6E8ED] hover:bg-[#FDF5F7]"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} />
                  <div className="text-left">
                    <div className="text-[14px] font-medium text-[#2B1420]">{m.name}</div>
                    <div className="text-[12px] text-[#8A6A75]">{m.relationship} • {calcAge(m.date_of_birth)} years</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#8A6A75]">
                  {medicineCounts[m.member_id] ?? 0} Medicines
                  <span className="text-rose">›</span>
                </div>
              </button>
            ))}
            {members.length === 0 && <div className="px-5 py-6 text-[13px] text-[#8A6A75]">No family members yet.</div>}
          </div>
          <div className="px-5 py-3 text-center">
            <button onClick={() => navigate("/members")} className="text-[13px] font-medium text-rose">View all members →</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-[15px] text-[#2B1420]">Today's Medicines</h2>
            <button onClick={() => navigate("/today")} className="text-[13px] font-medium text-rose">View all</button>
          </div>
          <div>
            {today.map((d) => {
              const hour = parseInt(d.scheduled_time?.split(":")[0] || "0", 10);
              const PeriodIcon = hour >= 18 || hour < 5 ? Moon : Sun;
              return (
                <div key={d.dose_log_id} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0 border-[#F6E8ED]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FBE3EA] flex items-center justify-center">
                      <PeriodIcon size={16} className="text-rose" />
                    </div>
                    <div>
                      <div className="text-[12px] text-[#8A6A75]">{d.scheduled_time} · {d.member_name}</div>
                      <div className="text-[13px] font-medium text-[#2B1420]">{d.medicine_name} - {d.dosage}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        const newStatus = d.status === 'taken' ? 'missed' : 'taken';
                        setToday(today.map(item => item.dose_log_id === d.dose_log_id ? { ...item, status: newStatus } : item));
                        try {
                          await api.logDose(d.medicine_id, { status: newStatus, scheduled_time: d.scheduled_time });
                        } catch (err) {
                          const todayData = await api.getToday();
                          setToday(todayData || []);
                        }
                      }}
                      className="transition-transform hover:scale-110"
                    >
                      {d.status === "taken"
                        ? <CheckCircle2 size={24} className="text-green-500" />
                        : <Bell size={22} className="text-[#8A6A75] hover:text-rose transition-colors" />}
                    </button>
                  </div>
                </div>
              );
            })}
            {today.length === 0 && <div className="px-5 py-6 text-[13px] text-[#8A6A75]">Nothing scheduled today.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
