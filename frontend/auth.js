import { $, state, EMAIL_RE, showMsg } from "./state.js";
import { api } from "./api.js";
import { render } from "./render.js";

export function setMode(m) {
  state.mode = m;
  $("tabLogin").classList.toggle("active", m === "login");
  $("tabRegister").classList.toggle("active", m === "register");
  $("regFields").classList.toggle("hidden", m === "login");
  $("authBtn").textContent = m === "login" ? "Entrar" : "Crear cuenta";
}

export async function submitAuth() {
  try {
    const email = $("email").value.trim(), password = $("password").value;
    if (state.mode === "register") {
      if (!EMAIL_RE.test(email)) throw new Error("Solo se aceptan correos @fomag.co");
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ documento: $("documento").value, name: $("name").value, email, password }),
      });
      showMsg("Cuenta creada. Iniciando sesión...");
    }
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    state.token = data.token;
    state.userName = data.user.name;
    state.role = data.user.role;
    localStorage.setItem("token", state.token);
    localStorage.setItem("userName", state.userName);
    localStorage.setItem("role", state.role);
    render();
  } catch (e) {
    showMsg(e.message, true);
  }
}

export function logout() {
  state.token = state.userName = state.role = state.selectedSlot = null;
  ["token", "userName", "role"].forEach((k) => localStorage.removeItem(k));
  render();
}