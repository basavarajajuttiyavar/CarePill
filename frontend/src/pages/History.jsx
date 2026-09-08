import React, { useEffect, useState } from "react";
import { History as HistoryIcon, CalendarClock, ChevronDown, Check, X } from "lucide-react";
import Avatar from "../components/Avatar";
import { api } from "../api";

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getToday().then(data => {
      // Group by date
      const grouped = {};
      data.sort((a, b) => b.dose_log_id - a.dose_log_id); // Latest first
      data.forEach(log => {
        // If not logged, assume today's date for upcoming items
        const dateObj = log.logged_at ? new Date(log.logged_at) : new Date();
        const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        
        if (!grouped[dateStr]) grouped[dateStr] = {};
        const key = `${log.medicine_id}-${log.scheduled_time}`;
        
        // Keep only the latest log for a specific medicine at a specific time on a specific day
        if (!grouped[dateStr][key]) {
          grouped[dateStr][key] = {
            time: formatTime(log.scheduled_time),
            name: log.member_name,
            med: log.medicine_name,
            dose: log.dosage || "1 Tablet",
            status: log.status.charAt(0).toUpperCase() + log.status.slice(1),
            rawDate: dateObj,
            scheduled_time: log.scheduled_time
          };
        }
      });

      // Convert to array and sort dates descending
      const result = Object.keys(grouped).map(date => {
        const records = Object.values(grouped[date]).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
        return {
          date,
          rawDate: records[0].rawDate,
          records
        };
      }).sort((a, b) => b.rawDate - a.rawDate);

      setHistoryData(result);
      setLoading(false);
    });
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const StatusBadge = ({ status }) => {
    if (status === "Taken") {
      return (
        <div className="inline-flex items-center gap-1.5 bg-[#E6F4EA] text-[#137333] px-2.5 py-1 rounded-full text-[12px] font-medium border border-[#CEEAD6]">
          <Check size={12} /> Taken
        </div>
      );
    }
    if (status === "Upcoming") {
      return (
        <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#1D4ED8] px-2.5 py-1 rounded-full text-[12px] font-medium border border-[#DBEAFE]">
          <CalendarClock size={12} /> Upcoming
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 bg-[#FCE8E6] text-[#C5221F] px-2.5 py-1 rounded-full text-[12px] font-medium border border-[#FAD2CF]">
        <X size={12} /> Missed
      </div>
    );
  };

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading history...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FBE3EA] flex items-center justify-center text-rose">
            <HistoryIcon size={24} />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#2B1420]">Medication History</h1>
            <p className="text-[13px] text-[#8A6A75] mt-1">View past medication records and adherence.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-between gap-3 border border-border rounded-lg px-4 py-2.5 bg-white text-[13px] text-[#2B1420] min-w-[160px]">
            <div className="flex items-center gap-2">
              <span className="text-[#8A6A75]">👤</span> All Members
            </div>
            <ChevronDown size={14} className="text-[#8A6A75]" />
          </div>
          <div className="flex items-center justify-between gap-3 border border-border rounded-lg px-4 py-2.5 bg-white text-[13px] text-[#2B1420] min-w-[220px]">
            <div className="flex items-center gap-2">
              <CalendarClock size={16} className="text-[#8A6A75]" /> Last 7 Days
            </div>
            <ChevronDown size={14} className="text-[#8A6A75]" />
          </div>
        </div>
      </div>

      <div className="w-full text-left text-[13px] text-[#8A6A75] mb-2 px-6 grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr]">
        <div>Date & Time</div>
        <div>Member</div>
        <div>Medicine</div>
        <div>Dose</div>
        <div>Status</div>
      </div>

      <div className="space-y-6">
        {historyData.map((group, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="bg-[#F8F9FA] px-6 py-3 border-b border-border flex items-center gap-2 text-[14px] font-semibold text-[#2B1420]">
              <CalendarClock size={16} className="text-[#8A6A75]" /> {group.date}
            </div>
            <div>
              {group.records.map((rec, j) => (
                <div key={j} className="px-6 py-4 border-b border-[#F6E8ED] last:border-0 grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] items-center text-[13px] text-[#2B1420]">
                  <div>{group.date.split(" ")[0]} {group.date.split(" ")[1]} {group.date.split(" ")[2]}, {rec.time}</div>
                  <div className="flex items-center gap-3">
                    <Avatar name={rec.name} size={28} />
                    <span className="font-medium">{rec.name}</span>
                  </div>
                  <div>{rec.med}</div>
                  <div>{rec.dose}</div>
                  <div><StatusBadge status={rec.status} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {historyData.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-[#8A6A75] text-[13px]">
            No history records found.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 bg-[#F6F5FF] text-[#6355D8] text-[13px] px-4 py-3 rounded-lg border border-[#E3E0FA]">
        <div className="w-5 h-5 rounded-full border border-[#6355D8] flex items-center justify-center font-serif text-[11px] italic">i</div>
        All times are shown in your local time zone.
      </div>
    </div>
  );
}
