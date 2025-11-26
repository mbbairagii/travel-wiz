const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
export function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(opts.headers || {}), "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, { ...opts, headers });
}
