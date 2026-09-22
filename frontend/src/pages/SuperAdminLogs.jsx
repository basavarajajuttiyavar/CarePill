import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { api } from "../api";

export default function SuperAdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.getSuperAdminLogs().then((data) => {
            setLogs(data);
        }).catch(err => {
            setError(err.message);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-[24px] font-bold text-[#6D1B36] mb-1">Activity Logs</h1>
                <p className="text-[14px] text-[#8A6A75]">Audit trail of all Super Admin actions.</p>
            </div>

            {error && <div className="mb-4 text-red-600 text-[14px]">{error}</div>}

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FFF5F8] border-b border-border">
                                <th className="px-6 py-4 text-[13px] font-semibold text-[#6D1B36]">Date & Time</th>
                                <th className="px-6 py-4 text-[13px] font-semibold text-[#6D1B36]">Action</th>
                                <th className="px-6 py-4 text-[13px] font-semibold text-[#6D1B36]">Admin</th>
                                <th className="px-6 py-4 text-[13px] font-semibold text-[#6D1B36]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F6E8ED]">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-[#8A6A75] text-[13px]">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8">
                                        <div className="flex flex-col items-center justify-center text-[#8A6A75] text-[14px]">
                                            <ShieldAlert size={32} className="mb-2 text-[#EAD3DA]" />
                                            No activity logs found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.activity_log_id} className="hover:bg-[#FDF5F7] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-medium text-[#2B1420]">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-[12px] text-[#8A6A75]">
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-[#2B1420] font-medium">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-medium text-[#2B1420]">
                                                {log.admin_name || "Unknown"}
                                            </div>
                                            <div className="text-[12px] text-[#8A6A75]">
                                                {log.email || "No email"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium capitalize border ${log.status === 'success'
                                                    ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]'
                                                    : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
