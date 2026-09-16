import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Users, User, Mail, Calendar, Clock, Hourglass } from "lucide-react";
import { api, getSessionUser, clearSession } from "../api";
import { formatDate } from "../utils";

export default function PendingApproval() {
  const user = getSessionUser();
  const [family, setFamily] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { family } = await api.getFamily();
        setFamily(family);
      } catch (err) {}
    })();
  }, []);

  const handleLogout = () => {
    clearSession();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F8] p-4">
      {/* Top Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-maroon flex items-center justify-center text-white relative">
          <ShieldCheck size={20} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-[15px] text-[#2B1420]">Family Medicine</div>
          <div className="text-rose text-[15px] font-semibold -mt-0.5">Tracker</div>
        </div>
      </div>

      <div className="w-full max-w-[560px] space-y-4">
        {/* Main Card */}
        <div className="bg-white rounded-[32px] shadow-sm border border-border p-12 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-[#FFE8EE] rounded-3xl flex items-center justify-center">
            {/* Using a placeholder since I can't render the exact custom graphic, but a clipboard icon is a good fallback */}
            <div className="w-16 h-20 bg-rose rounded-xl relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-maroon rounded-full"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#FF6B6B] rounded-full border-4 border-white flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-[28px] font-bold text-[#6D1B36] mb-3">Your family account is<br/>under review</h1>
          <p className="text-[15px] text-[#8A6A75] mb-8 max-w-sm mx-auto">
            Thank you for registering with Family Medicine Tracker.<br/>Your request has been successfully submitted.
          </p>

          <div className="bg-[#FFFAFB] border border-[#F6E8ED] rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="grid grid-cols-[140px_1fr] items-center text-[14px]">
              <div className="flex items-center gap-2 text-[#8A6A75]"><Users size={16} className="text-rose" /> Family Name</div>
              <div className="font-medium text-[#2B1420]">{family?.family_name || "..."}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center text-[14px]">
              <div className="flex items-center gap-2 text-[#8A6A75]"><User size={16} className="text-rose" /> Admin Name</div>
              <div className="font-medium text-[#2B1420]">{user?.name}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center text-[14px]">
              <div className="flex items-center gap-2 text-[#8A6A75]"><Mail size={16} className="text-rose" /> Email Address</div>
              <div className="font-medium text-[#2B1420]">{user?.email}</div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center text-[14px]">
              <div className="flex items-center gap-2 text-[#8A6A75]"><Calendar size={16} className="text-rose" /> Status</div>
              <div><span className="bg-[#FFF2DE] text-[#B87000] px-3 py-1 rounded-full text-[12px] font-medium">Pending Approval</span></div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center text-[14px]">
              <div className="flex items-center gap-2 text-[#8A6A75]"><Clock size={16} className="text-rose" /> Requested On</div>
              <div className="font-medium text-[#2B1420]">{family?.created_at ? new Date(family.created_at).toLocaleString() : "..."}</div>
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#FFF5F8] flex items-center justify-center text-rose mb-4 relative">
               <Hourglass size={20} />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-20 bg-[#F6E8ED] -z-10"></div>
            </div>
            <p className="text-[13px] text-[#8A6A75] max-w-sm">
              {user?.status === "pending_member" 
                ? "Your Family Admin will review your join request. You will gain access once they approve it."
                : "A Super Admin will review your request. You will receive an email notification once your account is approved."}
            </p>
          </div>

          <Link to="/login" onClick={handleLogout} className="block w-full bg-[#CC2054] hover:bg-[#B31B49] text-white text-[15px] font-semibold py-3.5 rounded-xl transition-colors">
            Back to Login
          </Link>
        </div>

        {/* Support Card */}
        <div className="bg-[#FFE8EE] rounded-[24px] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose shrink-0">
              {/* Headset icon approximation */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <div>
              <div className="font-semibold text-[#6D1B36] text-[15px]">Need help?</div>
              <div className="text-[13px] text-[#8A6A75]">If you have any questions, please contact our support team.</div>
            </div>
          </div>
          <button className="bg-white border border-[#E9AFC0] text-rose font-medium text-[13px] px-5 py-2.5 rounded-lg shrink-0">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
