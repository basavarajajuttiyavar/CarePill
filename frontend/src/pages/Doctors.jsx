import React, { useEffect, useState } from "react";
import { Stethoscope, ArrowLeft, FileText, Pill, ChevronRight, PlusCircle, Pencil, Trash2, MoreVertical } from "lucide-react";
import { api } from "../api";
import Avatar from "../components/Avatar";

const inputClass = "w-full border border-[#EAD3DA] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-rose placeholder:text-[#B58C97]";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#2B1420] mb-1.5">
        {label} {required && <span className="text-rose">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [referredMeds, setReferredMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ doctor_name: "", specialization: "", hospital: "", clinic: "", city: "", state: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const fetchDoctors = async () => {
    const docs = await api.getDoctors();
    setDoctors(docs);
    return docs;
  };

  useEffect(() => {
    fetchDoctors().then(docs => {
      if (docs.length > 0) setSelectedDoctor(docs[0]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedDoctor || isAdding || isEditing) return;
    (async () => {
      const family = await api.getFamily();
      const meds = [];
      for (const m of family.members || []) {
        const memberMeds = await api.getMedicines(m.member_id, "active");
        for (const med of memberMeds) {
          if (med.doctor_id === selectedDoctor.doctor_id) {
            meds.push({ ...med, member_name: m.name, relationship: m.relationship });
          }
        }
      }
      setReferredMeds(meds);
    })();
  }, [selectedDoctor, isAdding, isEditing]);

  const updateForm = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSaveDoctor = async () => {
    if (!form.doctor_name) {
      setError("Doctor name is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (isEditing) {
        const updatedDoc = await api.updateDoctor(selectedDoctor.doctor_id, form);
        await fetchDoctors();
        setIsEditing(false);
        setSelectedDoctor(updatedDoc);
      } else {
        const newDoc = await api.addDoctor(form);
        await fetchDoctors();
        setIsAdding(false);
        setSelectedDoctor(newDoc);
        setForm({ doctor_name: "", specialization: "", hospital: "", clinic: "", city: "", state: "", phone: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (confirm("Are you sure you want to delete this doctor? They will be removed from all associated medicines.")) {
      await api.deleteDoctor(selectedDoctor.doctor_id);
      const docs = await fetchDoctors();
      setSelectedDoctor(docs[0] || null);
      setShowMenu(false);
    }
  };

  const startEdit = () => {
    setForm({
      doctor_name: selectedDoctor.doctor_name || "",
      specialization: selectedDoctor.specialization || "",
      hospital: selectedDoctor.hospital || "",
      clinic: selectedDoctor.clinic || "",
      city: selectedDoctor.city || "",
      state: selectedDoctor.state || "",
      phone: selectedDoctor.phone || ""
    });
    setIsEditing(true);
    setShowMenu(false);
  };

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading doctors...</div>;

  return (
    <div className="p-8 max-w-6xl h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FBE3EA] flex items-center justify-center text-rose">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#2B1420]">Doctors</h1>
            <p className="text-[13px] text-[#8A6A75] mt-1">View and manage your trusted doctors.</p>
          </div>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(false); setForm({ doctor_name: "", specialization: "", hospital: "", clinic: "", city: "", state: "", phone: "" }); setSelectedDoctor(null); }}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose text-white text-[13px] font-medium"
        >
          <PlusCircle size={15} /> Add Doctor
        </button>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_2fr] gap-8 min-h-0">
        <div className="space-y-3 overflow-y-auto pr-2 pb-8">
          {doctors.map(d => (
            <div 
              key={d.doctor_id}
              onClick={() => { setIsAdding(false); setIsEditing(false); setSelectedDoctor(d); }}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedDoctor?.doctor_id === d.doctor_id && !isAdding && !isEditing
                ? 'bg-[#FFF5F8] border-[#F6E8ED]' 
                : 'bg-white border-border hover:border-[#EAD3DA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={d.doctor_name} size={48} />
                <div>
                  <div className="text-[15px] font-semibold text-[#2B1420]">{d.doctor_name}</div>
                  <div className="text-[13px] text-[#8A6A75]">{d.specialization}</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#8A6A75]" />
            </div>
          ))}
          {doctors.length === 0 && <div className="text-[13px] text-[#8A6A75]">No doctors added yet.</div>}
        </div>

        <div className="border-l border-border pl-8 overflow-y-auto pb-8">
          {isAdding || isEditing ? (
            <div>
              <button 
                onClick={() => { setIsAdding(false); setIsEditing(false); if (!selectedDoctor) setSelectedDoctor(doctors[0] || null); }}
                className="flex items-center gap-1.5 text-[13px] text-rose font-medium mb-6"
              >
                <ArrowLeft size={15} /> Cancel
              </button>
              <h2 className="text-[20px] font-semibold text-[#2B1420] mb-6">{isEditing ? "Edit Doctor" : "Add New Doctor"}</h2>
              
              <div className="space-y-4 max-w-lg">
                <Field label="Doctor Name" required>
                  <input className={inputClass} placeholder="e.g. Dr. Arjun Mehta" value={form.doctor_name} onChange={updateForm("doctor_name")} />
                </Field>
                <Field label="Specialization">
                  <input className={inputClass} placeholder="e.g. Cardiologist" value={form.specialization} onChange={updateForm("specialization")} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Hospital">
                    <input className={inputClass} placeholder="Enter hospital name" value={form.hospital} onChange={updateForm("hospital")} />
                  </Field>
                  <Field label="Clinic">
                    <input className={inputClass} placeholder="Enter clinic name" value={form.clinic} onChange={updateForm("clinic")} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City">
                    <input className={inputClass} placeholder="Enter city" value={form.city} onChange={updateForm("city")} />
                  </Field>
                  <Field label="State">
                    <input className={inputClass} placeholder="Enter state" value={form.state} onChange={updateForm("state")} />
                  </Field>
                </div>
                <Field label="Phone">
                  <input className={inputClass} placeholder="Enter phone number" value={form.phone} onChange={updateForm("phone")} />
                </Field>

                {error && <p className="text-[12px] text-red-600">{error}</p>}

                <div className="pt-4">
                  <button 
                    onClick={handleSaveDoctor} 
                    disabled={submitting} 
                    className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose text-white text-[13px] font-medium disabled:opacity-60"
                  >
                    {submitting ? "Saving..." : isEditing ? "Save Changes" : "Save Doctor"}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedDoctor ? (
            <div>
              <div className="flex justify-between items-start mb-6 lg:hidden">
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="flex items-center gap-1.5 text-[13px] text-rose font-medium"
                >
                  <ArrowLeft size={15} /> Back to Doctors
                </button>
              </div>
              
              <div className="flex justify-between items-start mb-10 pb-10 border-b border-border">
                <div className="flex gap-6 items-start">
                  <Avatar name={selectedDoctor.doctor_name} size={100} />
                  <div className="pt-2 text-[14px]">
                    <h2 className="text-[24px] font-semibold text-[#2B1420] mb-3">{selectedDoctor.doctor_name}</h2>
                    <div className="grid grid-cols-[100px_1fr] gap-y-2 text-[#2B1420]">
                      <div className="text-[#8A6A75]">Specialization:</div>
                      <div className="font-medium text-rose">{selectedDoctor.specialization || "General"}</div>
                      <div className="text-[#8A6A75]">Hospital:</div>
                      <div className="font-medium">{selectedDoctor.hospital || selectedDoctor.clinic || "N/A"}</div>
                      <div className="text-[#8A6A75]">Phone:</div>
                      <div className="font-medium font-mono">{selectedDoctor.phone || "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={startEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9AFC0] rounded-lg text-[13px] font-medium text-rose hover:bg-[#FDF0F3]"
                  >
                    <Pencil size={15} /> Edit
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
                          onClick={handleDeleteDoctor}
                          className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-red-600 hover:bg-red-50 text-left font-medium"
                        >
                          <Trash2 size={16} /> Delete Doctor
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-[16px] font-semibold text-[#2B1420] mb-1">
                  <FileText size={18} className="text-rose" /> Medicines referred for your family
                </h3>
                <p className="text-[13px] text-[#8A6A75] mb-6">Medicines prescribed by this doctor for your family members.</p>
                
                <div className="space-y-3">
                  {referredMeds.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-white cursor-pointer hover:border-[#EAD3DA] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0">
                          <Pill size={18} />
                        </div>
                        <div className="font-medium text-[#2B1420] text-[14px] w-48 truncate">{m.medicine_name}</div>
                        <div className="text-[#8A6A75] text-[14px]">{m.member_name} ({m.relationship})</div>
                      </div>
                      <ChevronRight size={18} className="text-[#8A6A75]" />
                    </div>
                  ))}
                  {referredMeds.length === 0 && <div className="text-[13px] text-[#8A6A75]">No medicines referred by this doctor.</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[13px] text-[#8A6A75]">
              Select a doctor to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
