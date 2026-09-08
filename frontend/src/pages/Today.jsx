import React, { useEffect, useState } from "react";
import { CalendarClock, Check, X } from "lucide-react";
import { api } from "../api";
import Avatar from "../components/Avatar";

export default function Today() {
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchToday = async () => {
    const data = await api.getToday();
    
    // Deduplicate by medicine_id + scheduled_time, keeping the latest (highest dose_log_id or logged_at)
    // Since getToday orders by scheduled_time ASC, we can group them and keep the last one we see.
    // However, if we just want the latest status, we can sort by dose_log_id descending first, then deduplicate.
    const sortedData = [...data].sort((a, b) => b.dose_log_id - a.dose_log_id);
    const seen = new Set();
    const deduplicated = [];
    
    for (const d of sortedData) {
      const key = `${d.medicine_id}-${d.scheduled_time}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(d);
      }
    }
    
    // Restore chronological order
    deduplicated.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

    setToday(deduplicated);
    setLoading(false);
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleStatusUpdate = async (doseLogId, medicineId, status, time) => {
    // Optimistic update
    setToday(today.map(d => d.dose_log_id === doseLogId ? { ...d, status } : d));
    try {
      await api.logDose(medicineId, { status, scheduled_time: time });
    } catch (err) {
      // Revert if error (in real app, we'd show error)
      fetchToday();
    }
  };

  // Format time for 12hr AM/PM
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading today's schedule...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FBE3EA] flex items-center justify-center text-rose">
            <CalendarClock size={24} />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#2B1420]">Today's Medicines</h1>
            <p className="text-[13px] text-[#8A6A75] mt-1">Mark medicines as taken or missed for today.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-[#EAD3DA] rounded-lg px-3 py-2 text-[13px] text-[#2B1420]">
          <CalendarClock size={16} className="text-[#8A6A75]" />
          <span>Today</span>
        </div>
      </div>

      <div className="space-y-4">
        {today.map((d) => (
          <div key={d.dose_log_id} className="bg-white rounded-2xl border border-border p-5 flex items-center">
            <div className="w-32 flex-shrink-0 text-[15px] font-semibold text-[#2B1420]">
              {formatTime(d.scheduled_time)}
            </div>
            
            <div className="flex-1 border-l border-border pl-6 flex items-center gap-4">
              <Avatar name={d.member_name} size={48} />
              <div>
                <div className="text-[15px] font-semibold text-[#2B1420]">{d.member_name}</div>
                <div className="text-[14px] text-[#2B1420] mt-0.5">{d.medicine_name}</div>
                <div className="text-[12px] text-[#8A6A75] mt-1">For {d.medicine_name.includes('Telma') ? 'Hypertension' : d.medicine_name.includes('Metformin') ? 'Diabetes' : 'General Health'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleStatusUpdate(d.dose_log_id, d.medicine_id, 'taken', d.scheduled_time)}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg border text-[13px] font-medium transition-colors ${
                  d.status === 'taken' 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : 'border-green-500 text-green-600 hover:bg-green-50'
                }`}
              >
                <Check size={16} /> Taken
              </button>
              <button 
                onClick={() => handleStatusUpdate(d.dose_log_id, d.medicine_id, 'missed', d.scheduled_time)}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg border text-[13px] font-medium transition-colors ${
                  d.status === 'missed' 
                  ? 'bg-red-50 border-rose text-rose' 
                  : 'border-rose text-rose hover:bg-red-50'
                }`}
              >
                <X size={16} /> Missed
              </button>
            </div>
          </div>
        ))}
        {today.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-[#8A6A75] text-[13px]">
            No medicines scheduled for today.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 bg-[#F6F5FF] text-[#6355D8] text-[13px] px-4 py-3 rounded-lg border border-[#E3E0FA]">
        <div className="w-5 h-5 rounded-full border border-[#6355D8] flex items-center justify-center font-serif text-[11px] italic">i</div>
        Your updates are saved and help us track medication adherence.
      </div>
    </div>
  );
}
