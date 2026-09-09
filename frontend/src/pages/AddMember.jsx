import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Users, Droplet, Contact, PlusCircle, Save } from "lucide-react";
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

export default function AddMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');

  const [form, setForm] = useState({
    name: "", date_of_birth: "", gender: "", relationship: "", phone: "", email: "", occupation: "",
    blood_group: "", allergies: "", chronic_conditions: "", emergency_contact_name: "", emergency_contact_relationship: "", emergency_contact_phone: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.getMember(id).then(member => {
        setForm({
          name: member.name || "",
          date_of_birth: member.date_of_birth ? new Date(member.date_of_birth).toISOString().split('T')[0] : "",
          gender: member.gender || "",
          relationship: member.relationship || "",
          phone: member.phone || "",
          email: member.email || "",
          occupation: member.occupation || "",
          blood_group: member.blood_group || "",
          allergies: member.allergies || "",
          chronic_conditions: member.chronic_conditions || "",
          emergency_contact_name: member.emergency_contact_name || "",
          emergency_contact_relationship: member.emergency_contact_relationship || "",
          emergency_contact_phone: member.emergency_contact_phone || "",
        });
        setLoading(false);
      }).catch(err => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.date_of_birth || !form.gender || !form.relationship) {
      setError("Please fill in the required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.updateMember(id, form);
        navigate(`/members/${id}`);
      } else {
        await api.addMember(form);
        navigate("/members");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-[13px] text-[#8A6A75]">Loading...</div>;

  return (
    <div className="p-8">
      <button onClick={() => isEdit ? navigate(`/members/${id}`) : navigate("/members")} className="flex items-center gap-1.5 text-[13px] text-rose font-medium mb-3">
        <ArrowLeft size={15} /> Back to {isEdit ? "Profile" : "Members"}
      </button>
      <h1 className="text-[22px] font-semibold text-[#2B1420]">{isEdit ? "Edit Family Member" : "Add Family Member"}</h1>
      <p className="text-[13px] text-[#8A6A75] mt-1 mb-6">
        {isEdit ? "Update member's information." : "Add a new member to your family to manage their medicines and health information."}
      </p>

      <div className="bg-white rounded-2xl border border-border p-6 space-y-8 max-w-4xl">
        <section>
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-rose mb-4">
            <Users size={16} /> Personal Information
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <Field label="Full Name" required>
              <input className={inputClass} placeholder="Enter full name" value={form.name} onChange={update("name")} />
            </Field>
            <Field label="Date of Birth" required>
              <input type="date" className={inputClass} value={form.date_of_birth} onChange={update("date_of_birth")} />
            </Field>
            <Field label="Gender" required>
              <select className={inputClass} value={form.gender} onChange={update("gender")}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Relationship" required>
              <select className={inputClass} value={form.relationship} onChange={update("relationship")}>
                <option value="">Select relationship</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Son</option>
                <option>Daughter</option>
                <option>Spouse</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Field label="Phone Number">
              <input className={inputClass} placeholder="Enter phone number" value={form.phone} onChange={update("phone")} />
            </Field>
            <Field label="Email (Optional)">
              <input className={inputClass} placeholder="Enter email address" value={form.email} onChange={update("email")} />
            </Field>
            <Field label="Occupation (Optional)">
              <input className={inputClass} placeholder="Enter occupation" value={form.occupation} onChange={update("occupation")} />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-rose mb-4">
            <Droplet size={16} /> Health Information
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Blood Group">
              <select className={inputClass} value={form.blood_group} onChange={update("blood_group")}>
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Allergies (If any)">
              <input className={inputClass} placeholder="e.g. Penicillin, Pollen, Nuts" value={form.allergies} onChange={update("allergies")} />
              <p className="text-[11px] text-[#B58C97] mt-1">Separate multiple allergies with commas</p>
            </Field>
            <Field label="Chronic Conditions (If any)">
              <input className={inputClass} placeholder="e.g. Diabetes, Asthma, Hypertension" value={form.chronic_conditions} onChange={update("chronic_conditions")} />
              <p className="text-[11px] text-[#B58C97] mt-1">Separate multiple conditions with commas</p>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-rose mb-4">
            <Contact size={16} /> Emergency Contact (Optional)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Contact Name">
              <input className={inputClass} placeholder="Enter contact name" value={form.emergency_contact_name} onChange={update("emergency_contact_name")} />
            </Field>
            <Field label="Relationship">
              <select className={inputClass} value={form.emergency_contact_relationship} onChange={update("emergency_contact_relationship")}>
                <option value="">Select relationship</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Son</option>
                <option>Daughter</option>
                <option>Spouse</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Phone Number">
              <input className={inputClass} placeholder="Enter phone number" value={form.emergency_contact_phone} onChange={update("emergency_contact_phone")} />
            </Field>
          </div>
        </section>

        {error && <p className="text-[12px] text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <button onClick={() => isEdit ? navigate(`/members/${id}`) : navigate("/members")} className="px-5 py-2.5 rounded-lg border border-[#EAD3DA] text-[13px] font-medium text-[#2B1420]">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose text-white text-[13px] font-medium disabled:opacity-60">
            {isEdit ? <Save size={15} /> : <PlusCircle size={15} />}
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
