import { $, showMsg } from "./state.js";
import { api } from "./api.js";
import { fmtTime, groupByDay } from "./format.js";

export async function loadSlots() {
  const box = $("mySlots");
  box.replaceChildren();
  const items = await api("/calendar/slots");
  if (!items.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No tienes horarios próximos.";
    return box.appendChild(p);
  }
  groupByDay(items).forEach(([day, slots]) => {
    const g = document.createElement("div");
    g.className = "daygroup";
    const lbl = document.createElement("div");
    lbl.className = "daylabel";
    lbl.textContent = day;
    const ul = document.createElement("ul");
    slots.forEach((s) => {
      const li = document.createElement("li");
      const info = document.createElement("span");
      info.textContent = fmtTime(s.startsAt) + " ";
      const badge = document.createElement("span");
      badge.className = "badge" + (s.isBooked ? " busy" : "");
      badge.textContent = s.isBooked ? "Reservada por " + s.patient : "Libre";
      info.appendChild(badge);
      const btn = document.createElement("button");
      btn.className = "danger";
      btn.textContent = "Quitar";
      btn.disabled = s.isBooked;
      btn.onclick = async () => {
        try {
          await api("/calendar/slots/" + s.id, { method: "DELETE" });
          loadSlots();
        } catch (e) {
          showMsg(e.message, true);
        }
      };
      li.append(info, btn);
      ul.appendChild(li);
    });
    g.append(lbl, ul);
    box.appendChild(g);
  });
}

export async function addSlots() {
  try {
    const date = $("slotDate").value, from = $("slotFrom").value, to = $("slotTo").value;
    const step = Number($("slotStep").value);
    if (!date || !from || !to) throw new Error("Completa fecha, hora de inicio y hora de fin");

    const start = new Date(`${date}T${from}`), end = new Date(`${date}T${to}`);
    if (end <= start) throw new Error("La hora final debe ser posterior a la inicial");

    const list = [];
    for (let t = new Date(start); t < end; t = new Date(t.getTime() + step * 60000)) list.push(t.toISOString());
    if (list.length > 100) throw new Error("Máximo 100 horarios por vez");

    const r = await api("/calendar/slots", { method: "POST", body: JSON.stringify({ startsAtList: list }) });
    showMsg(`Horarios creados: ${r.created}` + (r.skipped ? ` (omitidos: ${r.skipped}, ya existían o pasados)` : ""));
    loadSlots();
  } catch (e) {
    showMsg(e.message, true);
  }
}