import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { api, saveSession } from "../api";

export default function RegisterMember() {
  const [families, setFamilies] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", family_id: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();



  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.registerMember(form);
      saveSession(token, user);
      navigate("/pending");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFF5F8]">
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-xl bg-maroon flex items-center justify-center text-white relative">
            <ShieldCheck size={32} />
          </div>
          <div className="text-center leading-tight">
            <div className="font-semibold text-[28px] text-[#2B1420]">Family Medicine</div>
            <div className="text-rose text-[28px] font-semibold -mt-1">Tracker</div>
          </div>
        </div>

        <h2 className="text-[32px] font-bold text-[#6D1B36] mb-2 text-center">Join your<br/>family account</h2>
        <p className="text-[16px] text-[#8A6A75] mb-12 text-center max-w-sm">
          Enter your unique Family ID to request access and create your personal login credentials.
        </p>

        <div className="flex items-center gap-3 px-6 py-4 bg-[#FFE8EE] rounded-xl text-[13px] text-[#6D1B36]">
          <ShieldCheck size={20} className="shrink-0" />
          <p>Your request will be sent to your Family Admin for approval before you can access the dashboard.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/50 backdrop-blur-sm relative">
        <div className="absolute top-8 left-8">
          <Link to="/login" className="flex items-center gap-2 text-[14px] font-medium text-rose hover:underline">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-border p-12 w-full max-w-[560px]">
          <h1 className="text-[28px] font-bold text-[#6D1B36] mb-2">Create Member Account</h1>
          <p className="text-[15px] text-[#8A6A75] mb-8">Please fill in the details below to join a family.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#2B1420] mb-2">Family ID</label>
              <input
                type="number"
                required value={form.family_id} onChange={update("family_id")}
                className="w-full border border-[#EAD3DA] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-rose placeholder-[#B58C97]"
                placeholder="Enter the unique Family ID (ask your Family Admin)"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#2B1420] mb-2">Your Name</label>
              <input
                required value={form.name} onChange={update("name")}
                className="w-full border border-[#EAD3DA] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-rose placeholder-[#B58C97]"
                placeholder="e.g., Neha Sharma"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#2B1420] mb-2">Email Address</label>
              <input
                type="email" required value={form.email} onChange={update("email")}
                className="w-full border border-[#EAD3DA] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-rose placeholder-[#B58C97]"
                placeholder="Enter your email address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#2B1420] mb-2">Mobile Number (Optional)</label>
                <input
                  value={form.phone} onChange={update("phone")}
                  className="w-full border border-[#EAD3DA] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-rose placeholder-[#B58C97]"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#2B1420] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required value={form.password} onChange={update("password")}
                    className="w-full border border-[#EAD3DA] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-rose placeholder-[#B58C97]"
                    placeholder="Create a password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B58C97] hover:text-rose transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#2B1420] mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"} required value={form.confirmPassword} onChange={update("confirmPassword")}
                  className="w-full border border-[#EAD3DA] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-rose placeholder-[#B58C97]"
                  placeholder="Confirm your password"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B58C97] hover:text-rose transition-colors">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-[13px] text-red-600">{error}</p>}
            
            <button disabled={loading} className="w-full bg-[#CC2054] hover:bg-[#B31B49] text-white text-[15px] font-semibold py-3.5 rounded-xl transition-colors mt-4">
              {loading ? "Registering..." : "Send Join Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
