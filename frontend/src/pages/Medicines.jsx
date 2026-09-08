import React, { useEffect, useState } from "react";
import { Pill, Search, PlusCircle, ChevronRight, Filter } from "lucide-react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const family = await api.getFamily();
        const allMeds = [];
        for (const m of family.members || []) {
          const memberMeds = await api.getMedicines(m.member_id, "active");
          for (const med of memberMeds) {
            allMeds.push({ ...med, member: m });
          }
        }
        setMedicines(allMeds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredMeds = medicines.filter(m => 
    m.medicine_name.toLowerCase().includes(search.toLowerCase()) ||
    m.member.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FBE3EA] flex items-center justify-center text-rose shrink-0">
            <Pill size={24} />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#2B1420]">Medicines</h1>
            <p className="text-[13px] text-[#8A6A75] mt-1">All active medicines across your family.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/members")}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose text-white text-[13px] font-medium"
        >
          <PlusCircle size={15} /> Add Medicine
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6A75]" />
          <input 
            type="text" 
            placeholder="Search medicines or members..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-lg text-[13px] outline-none focus:border-rose placeholder:text-[#B58C97]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-[13px] font-medium text-[#2B1420] hover:border-[#EAD3DA]">
          <Filter size={15} className="text-[#8A6A75]" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="text-[13px] text-[#8A6A75]">Loading medicines...</div>
      ) : filteredMeds.length === 0 ? (
        <div className="text-[13px] text-[#8A6A75] py-8 text-center border border-dashed border-border rounded-xl bg-white">
          No medicines found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeds.map(m => (
            <div 
              key={m.medicine_id}
              onClick={() => navigate(`/medicines/${m.medicine_id}`)}
              className="bg-white border border-border rounded-2xl p-5 cursor-pointer hover:border-[#EAD3DA] transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0">
                  <Pill size={20} />
                </div>
                <div className="bg-[#ECFDF5] text-[#059669] text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                  Active
                </div>
              </div>
              
              <h3 className="text-[16px] font-semibold text-[#2B1420] mb-1 group-hover:text-rose transition-colors">
                {m.medicine_name} <span className="text-[#8A6A75] font-normal text-[14px]">{m.dosage}</span>
              </h3>
              <p className="text-[13px] text-[#8A6A75] mb-4">
                {m.medicine_type} • {m.frequency}
              </p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Avatar name={m.member.name} size={24} />
                <span className="text-[13px] font-medium text-[#2B1420]">{m.member.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
