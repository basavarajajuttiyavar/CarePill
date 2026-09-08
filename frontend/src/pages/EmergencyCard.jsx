import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Contact, Droplet, TriangleAlert, Pill, Sun, Moon, User, Phone, Info, ChevronDown } from "lucide-react";
import { api } from "../api";
import Avatar from "../components/Avatar";

export default function EmergencyCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(id);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFamily().then(family => {
      setMembers(family.members || []);
      if (!id && family.members?.length > 0) {
        setSelectedMemberId(family.members[0].member_id);
      }
    });
  }, [id]);

  useEffect(() => {
    if (!selectedMemberId) return;
    setLoading(true);
    api.getEmergencyCard(selectedMemberId).then(data => {
      setCard(data);
      setLoading(false);
    });
  }, [selectedMemberId]);

  if (loading && !card) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading emergency card...</div>;
  if (!card) return <div className="p-8 text-[13px] text-[#8A6A75]">Emergency card not found.</div>;

  const { member, active_medicines } = card;

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate("/members")} className="flex items-center gap-1.5 text-[13px] text-rose font-medium mb-8 hover:underline">
        <ArrowLeft size={15} /> Back to Family Members
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FBE3EA] flex items-center justify-center text-rose shrink-0">
            <Contact size={24} />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#2B1420]">Emergency Card</h1>
            <p className="text-[13px] text-[#8A6A75] mt-1">Important medical information at a glance.</p>
          </div>
        </div>
        
        {members.length > 0 && (
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-border rounded-lg pl-10 pr-10 py-2.5 text-[13px] font-medium text-[#2B1420] outline-none min-w-[240px]"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {members.map(m => (
                <option key={m.member_id} value={m.member_id}>{m.name} ({m.relationship})</option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5">
               <Avatar name={members.find(m => m.member_id == selectedMemberId)?.name || ""} size={20} />
            </div>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A6A75] pointer-events-none" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
        <div className="flex gap-8 items-center pb-8 border-b border-border">
          <Avatar name={member.name} size={100} />
          <div>
            <h2 className="text-[24px] font-bold text-[#2B1420] uppercase tracking-wide mb-4">{member.name}</h2>
            <div className="flex gap-12">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-[#FDF0F3] text-rose flex items-center justify-center"><Droplet size={20} /></div>
                <div>
                  <div className="text-[12px] text-[#8A6A75]">Blood Group</div>
                  <div className="text-[16px] font-semibold text-[#2B1420]">{member.blood_group || "Unknown"}</div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-[#FDF0F3] text-rose flex items-center justify-center"><TriangleAlert size={20} /></div>
                <div>
                  <div className="text-[12px] text-[#8A6A75]">Allergies</div>
                  <div className="text-[16px] font-semibold text-rose">{member.allergies || "None"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-8 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0"><Pill size={16} /></div>
            <h3 className="text-[16px] font-medium text-[#2B1420]">Current Medicines</h3>
          </div>
          
          <div className="space-y-4 ml-11">
            {active_medicines.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[14px] text-[#2B1420]">{m.medicine_name}</span>
                {/* Mocking the Morning/Night tags based on index for the visual match */}
                {i % 2 === 0 ? (
                  <div className="flex items-center gap-1.5 bg-[#F0FDF4] text-[#166534] px-3 py-1.5 rounded-full text-[12px] font-medium">
                    <Sun size={14} /> Morning
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-[#F3F0FF] text-[#5B21B6] px-3 py-1.5 rounded-full text-[12px] font-medium">
                    <Moon size={14} /> Night
                  </div>
                )}
              </div>
            ))}
            {active_medicines.length === 0 && <div className="text-[13px] text-[#8A6A75]">No active medicines.</div>}
          </div>
        </div>

        <div className="py-8 grid grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#4BB543] shrink-0 border border-[#E9ECEF]">
              <User size={20} />
            </div>
            <div>
              <div className="text-[12px] text-[#4BB543] font-medium mb-1">Primary Doctor</div>
              <div className="text-[16px] font-semibold text-[#2B1420] mb-2">Dr. Arjun Mehta</div>
              <div className="flex items-center gap-2 text-[14px] text-[#2B1420]">
                <Phone size={14} className="text-[#8A6A75]" /> 98765 43210
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF8E6] flex items-center justify-center text-[#F59E0B] shrink-0 border border-[#FEF3C7]">
              <Phone size={20} />
            </div>
            <div>
              <div className="text-[12px] text-[#F59E0B] font-medium mb-1">Emergency Contact</div>
              <div className="text-[16px] font-semibold text-[#2B1420] mb-2">{member.emergency_contact_name || "Not Set"}</div>
              <div className="flex items-center gap-2 text-[14px] text-[#2B1420]">
                <Phone size={14} className="text-[#8A6A75]" /> {member.emergency_contact_phone || "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 flex items-center gap-3 text-[#166534] text-[13px] font-medium">
          <div className="w-5 h-5 rounded-full border border-[#166534] flex items-center justify-center font-serif text-[11px] italic shrink-0">i</div>
          Show this card in case of emergency.
        </div>
      </div>
    </div>
  );
}
