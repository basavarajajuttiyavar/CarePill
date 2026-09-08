import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, User, Bell, ShieldCheck, Info, Pencil, ChevronRight, Lock, DownloadCloud, Trash2, Mail } from "lucide-react";
import { api, getSessionUser } from "../api";

function Toggle({ checked }) {
  return (
    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-rose' : 'bg-gray-300'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  );
}

export default function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#FBE3EA] flex items-center justify-center text-rose shrink-0">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#2B1420]">Settings</h1>
          <p className="text-[13px] text-[#8A6A75] mt-1">Manage your account and app preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0"><User size={16} /></div>
            Profile
          </h2>
          <p className="text-[13px] text-[#8A6A75] ml-10 mb-6">Manage your profile information.</p>
          
          <div className="space-y-4 mb-8 ml-10 flex-1">
            <div className="flex items-center justify-between text-[13px] text-[#2B1420]">
              <span className="flex items-center gap-3"><User size={16} className="text-[#8A6A75]"/> Name</span>
              <span>{user?.name}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#2B1420]">
              <span className="flex items-center gap-3"><Mail size={16} className="text-[#8A6A75]"/> Email</span>
              <span>{user?.email}</span>
            </div>
          </div>
          
          <div className="ml-10">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E9AFC0] text-[13px] font-medium text-rose hover:bg-[#FDF0F3] transition-colors">
              <Pencil size={14} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0"><Bell size={16} /></div>
            Notifications
          </h2>
          <p className="text-[13px] text-[#8A6A75] ml-10 mb-6">Choose what you want to be notified about.</p>
          
          <div className="space-y-4 mb-8 ml-10 flex-1">
            <div className="flex items-center justify-between text-[13px] text-[#2B1420] pb-4 border-b border-[#F6E8ED]">
              <span>Medicine Reminders</span>
              <Toggle checked={true} />
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#2B1420] pb-4 border-b border-[#F6E8ED]">
              <span>Daily Summary</span>
              <Toggle checked={true} />
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#2B1420]">
              <span>Low Stock Alerts</span>
              <Toggle checked={false} />
            </div>
          </div>
          
          <div className="ml-10">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E9AFC0] text-[13px] font-medium text-rose hover:bg-[#FDF0F3] transition-colors">
              <Bell size={14} /> Manage Reminders
            </button>
          </div>
        </div>

        {/* Data & Security Card */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0"><ShieldCheck size={16} /></div>
            Data & Security
          </h2>
          <p className="text-[13px] text-[#8A6A75] ml-10 mb-6">Manage your data and security settings.</p>
          
          <div className="space-y-2 ml-10">
            <div className="flex items-center justify-between text-[13px] text-[#2B1420] py-2 cursor-pointer hover:text-rose">
              <span className="flex items-center gap-3"><Lock size={16} className="text-[#8A6A75]"/> Change Password</span>
              <ChevronRight size={16} className="text-[#8A6A75]" />
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#2B1420] py-2 cursor-pointer hover:text-rose">
              <span className="flex items-center gap-3"><DownloadCloud size={16} className="text-[#8A6A75]"/> Export Family Data</span>
              <ChevronRight size={16} className="text-[#8A6A75]" />
            </div>
            <div className="flex items-center justify-between text-[13px] text-rose py-2 cursor-pointer">
              <span className="flex items-center gap-3"><Trash2 size={16} className="text-rose"/> Delete Family Data</span>
              <ChevronRight size={16} className="text-rose" />
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#2B1420] mb-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF0F3] flex items-center justify-center text-rose shrink-0"><Info size={16} /></div>
            About
          </h2>
          <p className="text-[13px] text-[#8A6A75] ml-10 mb-6">App version and information.</p>
          
          <div className="ml-10">
            <div className="flex items-center justify-between text-[13px] text-[#2B1420] py-2">
              <span>Version</span>
              <span className="text-[#8A6A75]">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
