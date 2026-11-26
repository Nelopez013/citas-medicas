import { $, state, ROLE_LABEL, showMsg } from "./state.js";
import { api } from "./api.js";

export async function loadProfile() {
  const u = await api("/users/me");
  $("profName").value = u.name;
  const extra =
    u.role === "DOCTOR" ? `Médico · ${u.specialty}` : u.role === "ADMIN" ? "Administrador" : `${u.activeAppointments} cita(s) activa(s)`;
  $("profInfo").textContent = `${u.email} · Doc. ${u.documento} · ${extra}`;
}

export async function saveProfile() {
  try {
    const body = { name: $("profName").value };
    const nw = $("newPass").value;
    if (nw) {
      body.currentPassword = $("curPass").value;
      body.newPassword = nw;
    }
    const u = await api("/users/me", { method: "PATCH", body: JSON.stringify(body) });
    state.userName = u.name;
    localStorage.setItem("userName", u.name);
    $("userName").textContent = `${u.name} (${ROLE_LABEL[state.role]})`;
    $("curPass").value = $("newPass").value = "";
    showMsg("Perfil actualizado.");
    loadProfile();
  } catch (e) {
    showMsg(e.message, true);
  }
}