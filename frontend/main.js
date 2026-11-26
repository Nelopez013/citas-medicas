import { $, showMsg } from "./state.js";
import { setMode, submitAuth, logout } from "./auth.js";
import { loadDoctors, confirmBooking } from "./patient.js";
import { addSlots } from "./doctor.js";
import { createDoctor } from "./admin.js";
import { saveProfile } from "./profile.js";
import { render } from "./render.js";

$("tabLogin").onclick = () => setMode("login");
$("tabRegister").onclick = () => setMode("register");
$("authBtn").onclick = submitAuth;
$("logoutBtn").onclick = logout;
$("specialty").onchange = () => loadDoctors().catch((e) => showMsg(e.message, true));
$("confirmBtn").onclick = confirmBooking;
$("addSlotBtn").onclick = addSlots;
$("createDocBtn").onclick = createDoctor;
$("saveProfileBtn").onclick = saveProfile;

render();