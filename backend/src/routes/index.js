const router = require("express").Router();
const auth = require("../middleware/auth");
const { requireRole } = auth;
const authCtrl = require("../controllers/AuthController");
const doctorCtrl = require("../controllers/DoctorController");
const apptCtrl = require("../controllers/AppointmentController");
const userCtrl = require("../controllers/UserController");
const calendarCtrl = require("../controllers/CalendarController");
const adminCtrl = require("../controllers/AdminController");

const h = (ctrl, method) => (req, res, next) => ctrl[method](req, res, next);

router.post("/auth/register", h(authCtrl, "register"));
router.post("/auth/login", h(authCtrl, "login"));

router.use(auth);


router.get("/users/me", h(userCtrl, "me"));
router.patch("/users/me", h(userCtrl, "update"));


const patient = requireRole("PATIENT");
router.get("/doctors/specialties", patient, h(doctorCtrl, "specialties"));
router.get("/doctors", patient, h(doctorCtrl, "list"));
router.post("/appointments", patient, h(apptCtrl, "create"));
router.get("/appointments", patient, h(apptCtrl, "mine"));
router.delete("/appointments/:id", patient, h(apptCtrl, "cancel"));


const doctor = requireRole("DOCTOR");
router.get("/calendar/slots", doctor, h(calendarCtrl, "list"));
router.post("/calendar/slots", doctor, h(calendarCtrl, "add"));
router.delete("/calendar/slots/:id", doctor, h(calendarCtrl, "remove"));


const admin = requireRole("ADMIN");
router.get("/admin/doctors", admin, h(adminCtrl, "list"));
router.post("/admin/doctors", admin, h(adminCtrl, "create"));
router.delete("/admin/doctors/:id", admin, h(adminCtrl, "remove"));

module.exports = router;