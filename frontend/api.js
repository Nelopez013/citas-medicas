import { API_URL, state } from "./state.js";
import { logout } from "./auth.js";

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(API_URL + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && state.token) logout();
  if (!res.ok) throw new Error(data.error || "Error de servidor");
  return data;
}