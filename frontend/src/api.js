const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("fmt_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.code === "ACCOUNT_SUSPENDED" || res.status === 401) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // auth
  sendOtp: (phone) => request("/auth/send-otp", { method: "POST", body: { phone }, auth: false }),
  login: (phone, password) => request("/auth/login", { method: "POST", body: { phone, password }, auth: false }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  getActiveFamilies: () => request("/auth/families", { auth: false }),
  registerMember: (payload) => request("/auth/register-member", { method: "POST", body: payload, auth: false }),

  // family + members
  getFamily: () => request("/family"),
  getMemberDraft: () => request("/family/members/draft"),
  saveMemberDraft: (payload) => request("/family/members/draft", { method: "POST", body: payload }),
  deleteMemberDraft: () => request("/family/members/draft", { method: "DELETE" }),
  addMember: (payload) => request("/family/members", { method: "POST", body: payload }),
  getMember: (id) => request(`/family/members/${id}`),
  updateMember: (id, payload) => request(`/family/members/${id}`, { method: "PATCH", body: payload }),
  deleteMember: (id) => request(`/family/members/${id}`, { method: "DELETE" }),
  getPendingMembers: () => request("/family/pending-members"),
  approveMember: (id, existingMemberId = null) => request(`/family/pending-members/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ existing_member_id: existingMemberId }),
  }),
  rejectMember: (id) => request(`/family/pending-members/${id}/reject`, { method: "POST" }),

  // medicines
  getMedicines: (memberId, status) =>
    request(`/members/${memberId}/medicines${status ? `?status=${status}` : ""}`),
  addMedicine: (payload) => request("/medicines", { method: "POST", body: payload }),
  getMedicine: (id) => request(`/medicines/${id}`),
  updateMedicine: (id, payload) => request(`/medicines/${id}`, { method: "PATCH", body: payload }),
  deleteMedicine: (id) => request(`/medicines/${id}`, { method: "DELETE" }),
  logDose: (medicineId, payload) => request(`/medicines/${medicineId}/dose-log`, { method: "POST", body: payload }),
  getDoseLogs: (id) => request(`/medicines/${id}/dose-log`),

  // doctors
  getDoctors: () => request("/doctors"),
  addDoctor: (payload) => request("/doctors", { method: "POST", body: payload }),
  updateDoctor: (id, payload) => request(`/doctors/${id}`, { method: "PATCH", body: payload }),
  deleteDoctor: (id) => request(`/doctors/${id}`, { method: "DELETE" }),

  // dashboard
  getToday: () => request("/dashboard/today"),
  getAnalytics: () => request("/analytics/medicines"),

  // emergency card
  getEmergencyCard: (memberId) => request(`/members/${memberId}/emergency-card`),
  shareEmergencyCard: (memberId) => request(`/members/${memberId}/emergency-card/share`, { method: "POST" }),

  // super admin
  getPendingRequests: () => request("/superadmin/requests"),
  approveRequest: (id) => request(`/superadmin/requests/${id}/approve`, { method: "POST" }),
  rejectRequest: (id) => request(`/superadmin/requests/${id}/reject`, { method: "POST" }),
  getSuperAdminStats: () => request("/superadmin/stats"),
  getFamilies: () => request("/superadmin/families"),
  suspendFamily: (id) => request(`/superadmin/families/${id}/suspend`, { method: "POST" }),
  reactivateFamily: (id) => request(`/superadmin/families/${id}/reactivate`, { method: "POST" }),
  deleteFamily: (id) => request(`/superadmin/families/${id}`, { method: "DELETE" }),
};

export function saveSession(token, user) {
  localStorage.setItem("fmt_token", token);
  localStorage.setItem("fmt_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("fmt_token");
  localStorage.removeItem("fmt_user");
}

export function getSessionUser() {
  const raw = localStorage.getItem("fmt_user");
  return raw ? JSON.parse(raw) : null;
}
