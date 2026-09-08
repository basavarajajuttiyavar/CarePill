import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Droplet, ShieldCheck, CalendarClock, Pill, Plus, Check, Clock, Sun, Moon } from "lucide-react";
import { api } from "../api";
import Avatar from "../components/Avatar";
import { calcAge, formatDate } from "../utils";

function StatusTag({ status }) {
  if (status === "taken") {
    return (
      <div className="flex items-center gap-1 bg-[#E6F4EA] text-[#137333] px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#CEEAD6]">
        <Check size={12} /> Taken
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 bg-[#E8F0FE] text-[#1967D2] px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#D2E3FC]">
      <Clock size={12} /> Upcoming
    </div>
  );
}

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [today, setToday] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [memberData, meds, todayData] = await Promise.all([
        api.getMember(id), 
        api.getMedicines(id, "active"),
        api.getToday()
      ]);
      setMember(memberData);
      setMedicines(meds);
      setToday(todayData.filter(d => d.member_id === parseInt(id)));
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading profile...</div>;
  if (!member) return <div className="p-8 text-[13px] text-[#8A6A75]">Member not found.</div>;

  const allergies = (member.allergies || "").split(",").map((a) => a.trim()).filter(Boolean);
  // Using an ad-hoc field here as it doesn't exist in DB schema, for UI mockup purposes
  const chronicConditions = (member.chronic_conditions || "Hypertension (High Blood Pressure)").split(",").map((c) => c.trim()).filter(Boolean);

  // Format time for 12hr AM/PM
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  return (
    <div className="p-8">
      <button onClick={() => navigate("/members")} className="flex items-center gap-1.5 text-[13px] text-rose font-medium mb-3">
        <ArrowLeft size={15} /> Back to Members
      </button>

      <div className="bg-white rounded-2xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Avatar name={member.name} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-semibold text-[#2B1420]">{member.name}</span>
                <span className="text-[11px] font-medium text-rose bg-[#FBE3EA] px-2 py-0.5 rounded-full">{member.relationship}</span>
              </div>
              <div className="text-[12px] text-[#8A6A75] mt-0.5">
                {member.gender} • {calcAge(member.date_of_birth)} years • DOB: {formatDate(member.date_of_birth)}
              </div>
              <div className="flex items-center gap-1 text-[12px] text-rose mt-1 font-medium">
                <Droplet size={12} /> Blood Group: {member.blood_group || "—"}
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-rose border border-[#E9AFC0] px-3.5 py-2 rounded-lg">
            <Pencil size={14} /> Edit Profile
          </button>
        </div>

        <div className="flex gap-6 px-6 border-b border-border">
          {["overview", "medicines", "health info", "history"].map((t) => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`py-3 text-[13px] capitalize border-b-2 -mb-px ${tab === t ? "border-rose text-rose font-medium" : "border-transparent text-[#8A6A75]"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-3 gap-5 p-6">
            <div className="border border-border rounded-xl flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-[13px] font-semibold text-[#2B1420]">
                <CalendarClock size={15} className="text-rose" /> Today's Medicines
              </div>
              <div className="p-4 space-y-3 flex-1">
                {today.map((d) => (
                  <div key={d.dose_log_id} className="flex justify-between items-start pb-2 border-b last:border-0 border-[#F6E8ED]">
                    <div>
                      <div className="text-[12px] font-semibold text-[#2B1420]">{formatTime(d.scheduled_time)}</div>
                      <div className="text-[11px] text-[#8A6A75]">{d.medicine_name} - {d.dosage}</div>
                    </div>
                    <StatusTag status={d.status} />
                  </div>
                ))}
                {today.length === 0 && <div className="text-[12px] text-[#8A6A75]">Nothing scheduled today.</div>}
              </div>
              <div className="px-4 py-3 border-t border-border text-center">
                <button onClick={() => navigate("/today")} className="text-[12px] font-medium text-rose">View full schedule →</button>
              </div>
            </div>

            <div className="border border-border rounded-xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border text-[13px] font-semibold text-[#2B1420]">
                <span className="flex items-center gap-2"><Pill size={15} className="text-rose" /> Active Medicines</span>
                <span className="text-[11px] bg-[#FBE3EA] text-rose px-2 py-0.5 rounded-full">{medicines.length}</span>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {medicines.map((m) => (
                  <div key={m.medicine_id} className="pb-2 border-b last:border-0 border-[#F6E8ED]">
                    <div className="text-[13px] font-medium text-[#2B1420]">{m.medicine_name}</div>
                    <div className="text-[11px] text-[#8A6A75]">{m.dosage} - {m.frequency}</div>
                  </div>
                ))}
                {medicines.length === 0 && <div className="text-[12px] text-[#8A6A75]">No active medicines.</div>}
              </div>
              <div className="px-4 py-3 border-t border-border text-center">
                <button onClick={() => setTab("medicines")} className="text-[12px] font-medium text-rose">View all medicines →</button>
              </div>
            </div>

            <div className="border border-border rounded-xl flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-[13px] font-semibold text-[#2B1420]">
                <ShieldCheck size={15} className="text-rose" /> Health Summary
              </div>
              <div className="p-4 space-y-5 text-[13px] flex-1">
                <div>
                  <div className="text-[#2B1420] mb-2 font-medium">Allergies</div>
                  {allergies.length
                    ? allergies.map((a) => <span key={a} className="inline-block text-[11px] font-medium text-rose bg-[#FBE3EA] px-2 py-0.5 rounded-full mr-1">{a}</span>)
                    : <span className="text-[12px] text-[#8A6A75]">No other allergies</span>}
                </div>
                <div>
                  <div className="text-[#2B1420] mb-2 font-medium">Chronic Conditions</div>
                  {chronicConditions.length
                    ? chronicConditions.map((c) => <span key={c} className="inline-block text-[11px] font-medium text-[#B87000] bg-[#FFF2DE] px-2 py-0.5 rounded-full mr-1">{c}</span>)
                    : <span className="text-[12px] text-[#8A6A75]">No other conditions</span>}
                </div>
              </div>
              <div className="px-4 py-3 border-t border-border text-center">
                <button onClick={() => setTab("health info")} className="text-[12px] font-medium text-rose">View full health info →</button>
              </div>
            </div>
          </div>
        )}

        {tab === "medicines" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[#2B1420]">Medicines for {member.name}</h3>
              <button onClick={() => navigate(`/members/${id}/medicines/new`)} className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-rose px-3.5 py-2 rounded-lg">
                <Plus size={14} /> Add Medicine
              </button>
            </div>
            <div className="space-y-2">
              {medicines.map((m) => (
                <div key={m.medicine_id} className="flex items-center justify-between border border-border rounded-xl px-4 py-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#2B1420]">{m.medicine_name}</div>
                    <div className="text-[11px] text-[#8A6A75]">{m.dosage} · {m.frequency} · {m.reason}</div>
                  </div>
                  <div className="text-[11px] text-[#8A6A75]">{m.prescription_type === "doctor" ? "Doctor-prescribed" : "Self-medicated"}</div>
                </div>
              ))}
              {medicines.length === 0 && <div className="text-[13px] text-[#8A6A75]">No medicines recorded yet.</div>}
            </div>
          </div>
        )}

        {tab === "health info" && (
          <div className="p-6 grid grid-cols-2 gap-6 text-[13px]">
            <div><div className="text-[#8A6A75] mb-1">Blood Group</div><div className="text-[#2B1420] font-medium">{member.blood_group || "—"}</div></div>
            <div><div className="text-[#8A6A75] mb-1">Phone</div><div className="text-[#2B1420] font-medium">{member.phone || "Not added"}</div></div>
            <div><div className="text-[#8A6A75] mb-1">Allergies</div><div className="text-[#2B1420] font-medium">{member.allergies || "None"}</div></div>
          </div>
        )}
        
        {tab === "history" && (
          <div className="p-6">
            <div className="text-[13px] text-[#8A6A75]">History placeholder. Full dose log history goes here.</div>
          </div>
        )}

        <div className="flex items-center justify-between bg-[#FDF0F3] rounded-xl mx-6 mb-6 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-rose" />
            <div>
              <div className="text-[13px] font-medium text-[#2B1420]">Emergency Contact</div>
              <div className="text-[12px] text-[#8A6A75]">
                {member.emergency_contact_name ? `${member.emergency_contact_name} - ${member.emergency_contact_phone}` : `No emergency contact added for ${member.name.split(" ")[0]}.`}
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-rose border border-[#E9AFC0] px-3.5 py-2 rounded-lg bg-white">
            <Plus size={14} /> Add Emergency Contact
          </button>
        </div>
      </div>
    </div>
  );
}
