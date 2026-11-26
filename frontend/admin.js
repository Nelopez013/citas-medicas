import { $, EMAIL_RE, showMsg } from "./state.js";
import { api } from "./api.js";
import { emptyItem } from "./format.js";

export async function loadDoctorList() {
  const ul = $("docList");
  ul.replaceChildren();
  const items = await api("/admin/doctors");
  if (!items.length) return emptyItem(ul, "No hay médicos registrados.");
  items.forEach((d) => {
    const li = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = `${d.name} · ${d.specialty} · ${d.email} · citas activas: ${d.activeAppointments}`;
    const btn = document.createElement("button");
    btn.className = "danger";
    btn.textContent = "Eliminar";
    btn.onclick = async () => {
      if (!confirm(`¿Eliminar a ${d.name}?`)) return;
      try {
        await api("/admin/doctors/" + d.id, { method: "DELETE" });
        showMsg("Médico eliminado.");
        loadDoctorList();
      } catch (e) {
        showMsg(e.message, true);
      }
    };
    li.append(info, btn);
    ul.appendChild(li);
  });
}

export async function createDoctor() {
  try {
    const email = $("dEmail").value.trim();
    if (!EMAIL_RE.test(email)) throw new Error("Solo se aceptan correos @fomag.co");
    await api("/admin/doctors", {
      method: "POST",
      body: JSON.stringify({
        documento: $("dDocumento").value,
        name: $("dName").value,
        email,
        specialty: $("dSpecialty").value,
        password: $("dPassword").value,
      }),
    });
    ["dDocumento", "dName", "dEmail", "dSpecialty", "dPassword"].forEach((id) => ($(id).value = ""));
    showMsg("Médico creado.");
    loadDoctorList();
  } catch (e) {
    showMsg(e.message, true);
  }
}