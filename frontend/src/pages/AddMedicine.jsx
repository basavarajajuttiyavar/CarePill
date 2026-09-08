import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Info, Pill, Clock, Bell, Plus, X, Save } from "lucide-react";
import { api } from "../api";

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

export default function AddMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');

  const [form, setForm] = useState({
    medicine_name: "",
    strength: "",
    form_type: "",
    notes: "",
    frequency: "",
    prescription_type: "self",
    doctor_id: "",
  });
  const [times, setTimes] = useState(["08:00"]);
  const [remindersOn, setRemindersOn] = useState(true);
  const [reminderBefore, setReminderBefore] = useState("15 minutes before");
  const [repeat, setRepeat] = useState("Every day");
  const [doctors, setDoctors] = useState([]);
  
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.getDoctors().then(setDoctors);
    if (isEdit) {
      api.getMedicine(id).then(med => {
        setForm({
          medicine_name: med.medicine_name || "",
          strength: med.dosage || "",
          form_type: med.medicine_type || "",
          notes: med.notes || "",
          frequency: med.frequency || "",
          prescription_type: med.prescription_type || "self",
          doctor_id: med.doctor_id || "",
        });
        setLoading(false);
      }).catch(err => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addTime = () => setTimes([...times, "12:00"]);
  const removeTime = (idx) => setTimes(times.filter((_, i) => i !== idx));
  const updateTime = (idx, val) => {
    const newTimes = [...times];
    newTimes[idx] = val;
    setTimes(newTimes);
  };

  const handleSubmit = async () => {
    if (!form.medicine_name || !form.strength || !form.form_type || !form.frequency || times.length === 0) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.updateMedicine(id, {
          medicine_name: form.medicine_name,
          dosage: form.strength,
          medicine_type: form.form_type,
          frequency: form.frequency,
          notes: form.notes,
          prescription_type: form.prescription_type,
          doctor_id: form.prescription_type === 'doctor' ? form.doctor_id : null,
        });
        navigate(`/medicines/${id}`);
      } else {
        const med = await api.addMedicine({
          member_id: id,
          medicine_name: form.medicine_name,
          dosage: form.strength,
          medicine_type: form.form_type,
          frequency: form.frequency,
          notes: form.notes,
          prescription_type: form.prescription_type,
          doctor_id: form.prescription_type === 'doctor' ? form.doctor_id : null,
        });
        
        // Log doses for initial times
        await Promise.all(times.map(t => api.logDose(med.medicine_id, {
          status: "upcoming",
          scheduled_time: t
        })));
        navigate(`/members/${id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading...</div>;

  return (
    <div className="p-8 pb-24">
      <button onClick={() => isEdit ? navigate(`/medicines/${id}`) : navigate(`/members/${id}`)} className="flex items-center gap-1.5 text-[13px] text-rose font-medium mb-3">
        <ArrowLeft size={15} /> Back to {isEdit ? "Medicine" : "Member Profile"}
      </button>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#2B1420]">{isEdit ? "Edit Medicine" : "Add New Medicine"}</h1>
          <p className="text-[13px] text-[#8A6A75] mt-1">Add medicine details and schedule so we can help you stay on track.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#FDF0F3] text-rose text-[13px] font-medium px-4 py-2.5 rounded-lg border border-[#F6E8ED]">
          <Info size={16} /> All fields marked with * are required.
        </div>
      </div>

      <div className="grid grid-cols-[1fr_350px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-rose mb-5">
              <Pill size={16} /> Medicine Details
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Medicine Name" required>
                <input className={inputClass} placeholder="e.g. Telma 40mg" value={form.medicine_name} onChange={update("medicine_name")} />
              </Field>
              <Field label="Strength" required>
                <input className={inputClass} placeholder="e.g. 40mg, 500mg" value={form.strength} onChange={update("strength")} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Form" required>
                <select className={inputClass} value={form.form_type} onChange={update("form_type")}>
                  <option value="">Select form</option>
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Syrup</option>
                  <option>Injection</option>
                  <option>Drops</option>
                  <option>Ointment</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Notes (Optional)">
                <input className={inputClass} placeholder="e.g. Take with food" value={form.notes} onChange={update("notes")} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Prescription Type">
                <select className={inputClass} value={form.prescription_type} onChange={update("prescription_type")}>
                  <option value="self">Self-medicated</option>
                  <option value="doctor">Prescribed by Doctor</option>
                </select>
              </Field>
              {form.prescription_type === 'doctor' && (
                <Field label="Doctor">
                  <select className={inputClass} value={form.doctor_id} onChange={update("doctor_id")}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d.doctor_id} value={d.doctor_id}>{d.doctor_name}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold text-rose">
                <Bell size={16} /> Reminders
              </h2>
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#2B1420]">
                <button 
                  onClick={() => setRemindersOn(!remindersOn)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${remindersOn ? 'bg-rose' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${remindersOn ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                On
              </div>
            </div>
            <p className="text-[13px] text-[#8A6A75] -mt-3 mb-5">Get notified when it's time to take this medicine.</p>
            <div className={`grid grid-cols-2 gap-4 ${!remindersOn && 'opacity-50 pointer-events-none'}`}>
              <Field label="Reminder Before">
                <select className={inputClass} value={reminderBefore} onChange={(e) => setReminderBefore(e.target.value)}>
                  <option>5 minutes before</option>
                  <option>10 minutes before</option>
                  <option>15 minutes before</option>
                  <option>30 minutes before</option>
                  <option>1 hour before</option>
                </select>
              </Field>
              <Field label="Repeat">
                <select className={inputClass} value={repeat} onChange={(e) => setRepeat(e.target.value)}>
                  <option>Every day</option>
                  <option>Alternate days</option>
                  <option>Specific days</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-rose mb-5">
            <Clock size={16} /> Schedule
          </h2>
          <div className="mb-5">
            <Field label="Frequency" required>
              <select className={inputClass} value={form.frequency} onChange={update("frequency")}>
                <option value="">Select frequency</option>
                <option>Every day</option>
                <option>Alternate days</option>
                <option>Specific days</option>
                <option>As needed</option>
              </select>
            </Field>
          </div>
          
          <div className="mb-2">
            <label className="block text-[13px] font-medium text-[#2B1420] mb-1.5">
              Time(s) <span className="text-rose">*</span>
            </label>
            <div className="space-y-2">
              {times.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6A75]" />
                    <input 
                      type="time" 
                      className={`${inputClass} pl-9`} 
                      value={t} 
                      onChange={(e) => updateTime(idx, e.target.value)} 
                    />
                  </div>
                  {times.length > 1 && (
                    <button onClick={() => removeTime(idx)} className="text-[#8A6A75] hover:text-rose p-2">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button onClick={addTime} className="flex items-center gap-1.5 text-rose text-[13px] font-medium mt-3 mb-6">
            <Plus size={14} /> Add Another Time
          </button>
        </div>
      </div>

      {error && <p className="text-[12px] text-red-600 mt-4 text-right">{error}</p>}

      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-border px-8 py-4 flex justify-end gap-3 z-10">
        <button onClick={() => isEdit ? navigate(`/medicines/${id}`) : navigate(`/members/${id}`)} className="px-5 py-2.5 rounded-lg border border-[#EAD3DA] text-[13px] font-medium text-[#2B1420] bg-white">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose text-white text-[13px] font-medium disabled:opacity-60">
          <Save size={15} /> {submitting ? "Saving..." : "Save Medicine"}
        </button>
      </div>
    </div>
  );
}
