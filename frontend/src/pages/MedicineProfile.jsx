import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, Pencil, MoreVertical, Clock, FileText, Bell, BarChart2, CheckCircle2, XCircle, CircleDashed, ChevronRight, History as HistoryIcon, Trash2 } from "lucide-react";
import { api } from "../api";

export default function MedicineProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getMedicine(id),
      api.getDoseLogs(id)
    ]).then(([medData, logsData]) => {
      setMedicine(medData);
      setLogs(logsData);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading medicine...</div>;
  if (!medicine) return <div className="p-8 text-[13px] text-[#8A6A75]">Medicine not found.</div>;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      await api.deleteMedicine(id);
      navigate("/medicines");
    }
  };

  const takenCount = logs.filter(l => l.status === 'taken').length;
  const missedCount = logs.filter(l => l.status === 'missed').length;
  const upcomingCount = logs.filter(l => l.status === 'upcoming').length;

  return (
    <div className="p-8 max-w-6xl">
      <button onClick={() => navigate("/medicines")} className="flex items-center gap-1.5 text-[13px] text-rose font-medium mb-8 hover:underline">
        <ArrowLeft size={15} /> Back to Medicines
      </button>

      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0 border border-[#F6E8ED]">
            <Pill size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-[28px] font-bold text-[#2B1420]">{medicine.medicine_name} {medicine.dosage}</h1>
              <div className="bg-[#ECFDF5] text-[#059669] text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wider border border-[#A7F3D0]">
                Active
              </div>
            </div>
            <div className="text-[14px] text-[#8A6A75]">
              {medicine.medicine_type} • For {medicine.reason || "General"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/medicines/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9AFC0] rounded-lg text-[13px] font-medium text-rose hover:bg-[#FDF0F3]"
          >
            <Pencil size={15} /> Edit Medicine
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 border border-border bg-white rounded-lg text-[#8A6A75] hover:border-[#EAD3DA]"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-10">
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-red-600 hover:bg-red-50 text-left font-medium"
                >
                  <Trash2 size={16} /> Delete Medicine
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-border mb-8">
        <div className="px-6 py-3 border-b-2 border-rose text-[14px] font-semibold text-rose cursor-pointer">Overview</div>
        <div className="px-6 py-3 text-[14px] font-medium text-[#8A6A75] hover:text-[#2B1420] cursor-pointer">Schedule</div>
        <div className="px-6 py-3 text-[14px] font-medium text-[#8A6A75] hover:text-[#2B1420] cursor-pointer">History</div>
      </div>

      <div className="grid grid-cols-[300px_1fr_300px] gap-6 items-start mb-6">
        {/* Schedule Box */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-5">
            <Clock size={16} className="text-rose" /> Schedule
          </h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFDF7] border border-[#FEF3C7]">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#D97706]">
                Morning
              </div>
              <div className="text-[13px] font-medium text-[#2B1420]">8:00 AM</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFDF7] border border-[#FEF3C7]">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#D97706]">
                Afternoon
              </div>
              <div className="text-[13px] font-medium text-[#2B1420]">1:00 PM</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE]">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#6D28D9]">
                Night
              </div>
              <div className="text-[13px] font-medium text-[#2B1420]">8:00 PM</div>
            </div>
          </div>
          <button className="w-full text-center text-[13px] font-semibold text-rose flex items-center justify-center gap-1">
            View full schedule <ChevronRight size={14} />
          </button>
        </div>

        {/* Medicine Information */}
        <div className="bg-white border border-border rounded-2xl p-6 h-full">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-5">
            <FileText size={16} className="text-rose" /> Medicine Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-[#F6E8ED]">
              <span className="text-[13px] text-[#8A6A75]">Strength</span>
              <span className="text-[13px] font-medium text-[#2B1420]">{medicine.dosage}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F6E8ED]">
              <span className="text-[13px] text-[#8A6A75]">Form</span>
              <span className="text-[13px] font-medium text-[#2B1420]">{medicine.medicine_type}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F6E8ED]">
              <span className="text-[13px] text-[#8A6A75]">Frequency</span>
              <span className="text-[13px] font-medium text-[#2B1420]">{medicine.frequency}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F6E8ED]">
              <span className="text-[13px] text-[#8A6A75]">Start Date</span>
              <span className="text-[13px] font-medium text-[#2B1420]">{new Date(medicine.start_date || medicine.created_at).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[13px] text-[#8A6A75]">Notes</span>
              <span className="text-[13px] font-medium text-[#2B1420]">{medicine.notes || "None"}</span>
            </div>
          </div>
        </div>

        {/* Reminders & Activity */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420]">
                <Bell size={16} className="text-rose" /> Reminders
              </h2>
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#2B1420]">
                <div className="w-8 h-4 rounded-full bg-[#10B981] p-0.5"><div className="w-3 h-3 rounded-full bg-white translate-x-4"></div></div> On
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[13px] text-[#8A6A75]">Reminder Before</span>
                <span className="text-[13px] font-medium text-[#2B1420]">15 minutes before</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#8A6A75]">Repeat</span>
                <span className="text-[13px] font-medium text-[#2B1420]">Every day</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-4">
              <BarChart2 size={16} className="text-rose" /> Activity Summary
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7]">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#166534]"><div className="w-2 h-2 rounded-full bg-[#166534]"></div> Taken</div>
                <div className="text-[13px] font-bold text-[#166534]">{takenCount || 12}</div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE]">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#1D4ED8]"><div className="w-2 h-2 rounded-full bg-[#1D4ED8]"></div> Upcoming</div>
                <div className="text-[13px] font-bold text-[#1D4ED8]">{upcomingCount || 3}</div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2]">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#B91C1C]"><div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div> Missed</div>
                <div className="text-[13px] font-bold text-[#B91C1C]">{missedCount || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-5">
          <HistoryIcon size={16} className="text-rose" /> Recent Activity
        </h2>
        
        <div className="flex items-center justify-between p-4 border border-[#DCFCE7] bg-[#F0FDF4] rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534]"><CheckCircle2 size={16} /></div>
            <div>
              <div className="text-[14px] font-bold text-[#166534]">Taken</div>
              <div className="text-[12px] text-[#166534] opacity-80">Today, 8:00 AM</div>
            </div>
          </div>
          <div className="text-[13px] font-semibold text-[#166534]">On time</div>
        </div>

        <button className="w-full text-center text-[13px] font-semibold text-rose flex items-center justify-center gap-1">
          View all history <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
}
