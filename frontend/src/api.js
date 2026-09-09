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
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // auth
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),

  // family + members
  getFamily: () => request("/family"),
  addMember: (payload) => request("/family/members", { method: "POST", body: payload }),
  getMember: (id) => request(`/family/members/${id}`),
  updateMember: (id, payload) => request(`/family/members/${id}`, { method: "PATCH", body: payload }),
  deleteMember: (id) => request(`/family/members/${id}`, { method: "DELETE" }),

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
