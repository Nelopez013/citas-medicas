// Cambia esta URL por la de Render al desplegar (ej. https://citas-api.onrender.com/api)
export const API_URL = "http://localhost:3000/api";
export const EMAIL_RE = /^[a-z0-9._%+-]+@fomag\.co$/i;
export const ROLE_LABEL = { PATIENT: "Paciente", DOCTOR: "Médico", ADMIN: "Administrador" };

export const $ = (id) => document.getElementById(id);

// Estado compartido entre módulos (sesión y selección de horario)
export const state = {
  token: localStorage.getItem("token"),
  userName: localStorage.getItem("userName"),
  role: localStorage.getItem("role"),
  mode: "login",
  selectedSlot: null,
};

export function showMsg(text, isError = false) {
  const el = $("msg");
  el.textContent = text;
  el.className = "msg" + (isError ? " error" : "");
  setTimeout(() => el.classList.add("hidden"), 4000);
}