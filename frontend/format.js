export const fmt = (iso) =>
  new Date(iso).toLocaleString("es-CO", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const fmtTime = (iso) => new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

export const fmtDay = (iso) => new Date(iso).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

// Agrupa elementos por día: [[etiquetaDia, [items]], ...]
export function groupByDay(items) {
  const map = new Map();
  items.forEach((it) => {
    const k = fmtDay(it.startsAt);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(it);
  });
  return [...map.entries()];
}

export function emptyItem(ul, text) {
  const li = document.createElement("li");
  li.textContent = text;
  ul.appendChild(li);
}