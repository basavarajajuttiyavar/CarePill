import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreVertical, Droplet, ShieldCheck } from "lucide-react";
import { api } from "../api";
import Avatar from "../components/Avatar";
import { calcAge, formatDate } from "../utils";

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [medicineCounts, setMedicineCounts] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await api.getFamily();
      setMembers(data.members || []);
      const counts = {};
      await Promise.all(
        (data.members || []).map(async (m) => {
          const meds = await api.getMedicines(m.member_id, "active");
          counts[m.member_id] = meds.length;
        })
      );
      setMedicineCounts(counts);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [members, query]
  );

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[#2B1420]">My Family Members</h1>
          <p className="text-[13px] text-[#8A6A75] mt-1">Manage your family members and their health information.</p>
        </div>
        <button onClick={() => navigate("/members/new")} className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-rose px-4 py-2.5 rounded-lg">
          <Plus size={15} /> Add Family Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 bg-[#FDF5F7] rounded-lg px-3 py-2 max-w-sm">
            <Search size={15} className="text-[#8A6A75]" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members by name..."
              className="bg-transparent outline-none text-[13px] w-full placeholder:text-[#B58C97]"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] text-[#8A6A75] border-b border-border">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Relationship</th>
              <th className="px-5 py-3 font-medium">Age</th>
              <th className="px-5 py-3 font-medium">Blood Group</th>
              <th className="px-5 py-3 font-medium">Allergies</th>
              <th className="px-5 py-3 font-medium">Active Medicines</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.member_id} className="border-b last:border-0 border-[#F6E8ED]">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <div>
                      <div className="text-[14px] font-medium text-[#2B1420]">{m.name}</div>
                      <div className="text-[11px] text-[#8A6A75]">{m.gender} • {calcAge(m.date_of_birth)} years · DOB: {formatDate(m.date_of_birth)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#2B1420]">{m.relationship}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#2B1420]">{calcAge(m.date_of_birth)}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-rose bg-[#FBE3EA] px-2 py-0.5 rounded-full">
                    <Droplet size={11} /> {m.blood_group || "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#2B1420]">{m.allergies || "None"}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[12px] font-medium text-rose bg-[#FBE3EA] px-2 py-0.5 rounded-full">{medicineCounts[m.member_id] ?? 0}</span>{" "}
                  <span className="text-[13px] text-[#2B1420]">medicines</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/members/${m.member_id}`)} className="text-[12px] font-medium text-rose border border-[#E9AFC0] px-3 py-1.5 rounded-lg">
                      View Profile
                    </button>
                    <MoreVertical size={16} className="text-[#8A6A75]" />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-[#8A6A75]">No members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 bg-[#FDF0F3] rounded-2xl px-6 py-4 mt-5">
        <ShieldCheck size={20} className="text-rose" />
        <div>
          <div className="font-medium text-[13px] text-[#2B1420]">Keep your family information updated</div>
          <div className="text-[12px] text-[#8A6A75]">Accurate information helps in better medication tracking and emergency care.</div>
        </div>
      </div>
    </div>
  );
}
