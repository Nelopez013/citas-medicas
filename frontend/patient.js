import { $, state, showMsg } from "./state.js";
import { api } from "./api.js";
import { fmt, fmtTime, groupByDay, emptyItem } from "./format.js";

export async function loadSpecialties() {
  const list = await api("/doctors/specialties");
  const sel = $("specialty");
  sel.replaceChildren(new Option("Selecciona una especialidad...", ""));
  list.forEach((s) => sel.add(new Option(s, s)));
}

export async function loadDoctors() {
  state.selectedSlot = null;
  updateSelection();
  const box = $("doctors");
  box.replaceChildren();
  const specialty = $("specialty").value;
  if (!specialty) return;

  const doctors = await api("/doctors?specialty=" + encodeURIComponent(specialty));
  doctors.forEach((d) => {
    const div = document.createElement("div");
    div.className = "doctor";
    const title = document.createElement("strong");
    title.textContent = d.name;
    div.appendChild(title);

    if (!d.slots.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "Sin horarios libres";
      div.appendChild(p);
    }
    groupByDay(d.slots).forEach(([day, slots]) => {
      const g = document.createElement("div");
      g.className = "daygroup";
      const lbl = document.createElement("div");
      lbl.className = "daylabel";
      lbl.textContent = day;
      const wrap = document.createElement("div");
      wrap.className = "slots";
      slots.forEach((s) => {
        const b = document.createElement("button");
        b.className = "slot";
        b.textContent = fmtTime(s.startsAt);
        b.onclick = () => {
          state.selectedSlot = { id: s.id, doctor: d.name, startsAt: s.startsAt };
          document.querySelectorAll(".slot").forEach((x) => x.classList.remove("selected"));
          b.classList.add("selected");
          updateSelection();
        };
        wrap.appendChild(b);
      });
      g.append(lbl, wrap);
      div.appendChild(g);
    });
    box.appendChild(div);
  });
}

export function updateSelection() {
  $("selection").textContent = state.selectedSlot
    ? `${state.selectedSlot.doctor} · ${fmt(state.selectedSlot.startsAt)}`
    : "Aún no has elegido un horario.";
  $("confirmBtn").disabled = !state.selectedSlot;
}

export async function confirmBooking() {
  try {
    await api("/appointments", { method: "POST", body: JSON.stringify({ slotId: state.selectedSlot.id }) });
    showMsg("¡Cita reservada!");
    state.selectedSlot = null;
    updateSelection();
    await Promise.all([loadDoctors(), loadAppointments()]);
  } catch (e) {
    showMsg(e.message, true);
    loadDoctors();
  }
}

export async function loadAppointments() {
  const ul = $("myAppointments");
  ul.replaceChildren();
  const items = await api("/appointments");
  if (!items.length) return emptyItem(ul, "No tienes citas activas.");
  items.forEach((a) => {
    const li = document.createElement("li");
    const info = document.createElement("span");
    info.textContent = `${a.slot.doctor.name} (${a.slot.doctor.specialty}) · ${fmt(a.slot.startsAt)}`;
    const btn = document.createElement("button");
    btn.className = "danger";
    btn.textContent = "Cancelar";
    btn.onclick = async () => {
      try {
        await api("/appointments/" + a.id, { method: "DELETE" });
        showMsg("Cita cancelada.");
        await Promise.all([loadAppointments(), loadDoctors()]);
      } catch (e) {
        showMsg(e.message, true);
      }
    };
    li.append(info, btn);
    ul.appendChild(li);
  });
}