import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { api, saveSession } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      saveSession(token, user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blush">
      <div className="bg-white rounded-2xl border border-border p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-maroon flex items-center justify-center text-white">
            <ShieldCheck size={20} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px] text-[#2B1420]">Family Medicine</div>
            <div className="text-rose text-[15px] font-semibold -mt-0.5">Tracker</div>
          </div>
        </div>

        <h1 className="text-[18px] font-semibold text-[#2B1420] mb-1">Welcome back</h1>
        <p className="text-[13px] text-[#8A6A75] mb-6">Log in to manage your family's medicines.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#2B1420] mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#EAD3DA] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-rose"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#2B1420] mb-1.5">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#EAD3DA] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-rose"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-rose text-white text-[13px] font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
