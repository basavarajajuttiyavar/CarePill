import React from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full bg-[#2B1420] text-white pt-8 pb-4 mt-auto">
            <div className="max-w-[1400px] mx-auto w-full px-8 flex flex-wrap justify-between gap-6 border-t-[4px] border-rose pt-6 mt-1">
                <div className="w-full md:w-1/4 pr-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-rose flex items-center justify-center text-white">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="leading-tight">
                            <div className="font-semibold text-[15px]">Family Medicine</div>
                            <div className="text-[#F2A6BE] text-[12px] font-medium -mt-1">Tracker</div>
                        </div>
                    </div>
                    <p className="text-[#EAD3DA] text-[12.5px] leading-relaxed">
                        Manage your family's health securely. Keep tracking organized, log doses efficiently, and securely share emergency cards with doctors.
                    </p>
                </div>

                {/* Columns mapping exactly to reference image style but CarePill relevant */}
                <div>
                    <h3 className="font-semibold text-[14px] mb-3 text-[#FFF5F8]">Core Features</h3>
                    <ul className="space-y-1.5 text-[13px] text-[#EAD3DA]">
                        <li><Link to="/" className="hover:text-white transition-colors">Dashboard</Link></li>
                        <li><Link to="/members" className="hover:text-white transition-colors">Family Members</Link></li>
                        <li><Link to="/medicines" className="hover:text-white transition-colors">Medicines</Link></li>
                        <li><Link to="/today" className="hover:text-white transition-colors">Today's schedule</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-[14px] mb-3 text-[#FFF5F8]">Other Offerings</h3>
                    <ul className="space-y-1.5 text-[13px] text-[#EAD3DA]">
                        <li><Link to="/emergency-card" className="hover:text-white transition-colors">Emergency Card</Link></li>
                        <li><Link to="/doctors" className="hover:text-white transition-colors">Manage Doctors</Link></li>
                        <li><Link to="/history" className="hover:text-white transition-colors">Dose History</Link></li>
                        <li><Link to="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-[14px] mb-3 text-[#FFF5F8]">Reach Us</h3>
                    <ul className="space-y-1.5 text-[13px] text-[#EAD3DA]">
                        <li><a href="#" className="hover:text-white transition-colors">Book Appointment</a></li>
                        <li><Link to="/login" className="hover:text-white transition-colors">Login / Register</Link></li>
                        <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-8 mt-6 pt-4 border-t border-[#5A3B45] flex items-center justify-between text-[#B58C97] text-[11px]">
                <p>Copyright © {new Date().getFullYear()} - Family Medicine Tracker. All Rights Reserved.</p>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>

            <div className="fixed bottom-6 right-6 w-[48px] h-[48px] bg-rose rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:bg-[#B31B49] transition-colors z-50">
                <MessageCircle size={22} />
            </div>
        </footer>
    );
}
