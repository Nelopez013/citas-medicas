import { $, state, ROLE_LABEL, showMsg } from "./state.js";
import { loadProfile } from "./profile.js";
import { loadSpecialties, loadAppointments } from "./patient.js";
import { loadSlots } from "./doctor.js";
import { loadDoctorList } from "./admin.js";

export async function render() {
  const logged = !!state.token;
  $("authView").classList.toggle("hidden", logged);
  $("appView").classList.toggle("hidden", !logged);
  $("userBox").classList.toggle("hidden", !logged);
  $("userName").textContent = state.userName ? `${state.userName} (${ROLE_LABEL[state.role] || ""})` : "";
  $("patientView").classList.toggle("hidden", !(logged && state.role === "PATIENT"));
  $("doctorView").classList.toggle("hidden", !(logged && state.role === "DOCTOR"));
  $("adminView").classList.toggle("hidden", !(logged && state.role === "ADMIN"));
  if (!logged) return;
  try {
    const tasks = [loadProfile()];
    if (state.role === "PATIENT") tasks.push(loadSpecialties(), loadAppointments());
    else if (state.role === "DOCTOR") tasks.push(loadSlots());
    else if (state.role === "ADMIN") tasks.push(loadDoctorList());
    await Promise.all(tasks);
  } catch (e) {
    showMsg(e.message, true);
  }
}