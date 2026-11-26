const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { HttpError } = require("../middleware/errorHandler");
const { validateNewUser, assertUnique } = require("../utils/validators");

class AdminService {
  async listDoctors() {
    const doctors = await prisma.doctor.findMany({ include: { user: true }, orderBy: { id: "asc" } });
    return Promise.all(doctors.map(async (d) => ({
      id: d.id,
      name: d.user.name,
      email: d.user.email,
      documento: d.user.documento,
      specialty: d.specialty,
      activeAppointments: await prisma.appointment.count({ where: { status: "ACTIVE", slot: { doctorId: d.id } } }),
    })));
  }

  async createDoctor(body) {
    const clean = validateNewUser(body);
    const specialty = String(body.specialty || "").trim();
    if (!specialty) throw new HttpError(400, "La especialidad es obligatoria");
    await assertUnique(clean);

    const passwordHash = await bcrypt.hash(body.password, 10);
    try {
      const user = await prisma.user.create({
        data: { ...clean, passwordHash, role: "DOCTOR", doctor: { create: { specialty } } },
        include: { doctor: true },
      });
      return { id: user.doctor.id, name: user.name, email: user.email, documento: user.documento, specialty, activeAppointments: 0 };
    } catch (e) {
      if (e.code === "P2002") throw new HttpError(409, "Documento o email ya registrados");
      throw e;
    }
  }

  async deleteDoctor(doctorId) {
    const id = Number(doctorId);
    if (!Number.isInteger(id)) throw new HttpError(400, "id inválido");
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new HttpError(404, "Médico no encontrado");

    const active = await prisma.appointment.count({ where: { status: "ACTIVE", slot: { doctorId: id } } });
    if (active > 0) throw new HttpError(409, "El médico tiene citas activas; deben cancelarse antes");

    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { slot: { doctorId: id } } }),
      prisma.slot.deleteMany({ where: { doctorId: id } }),
      prisma.doctor.delete({ where: { id } }),
      prisma.user.delete({ where: { id: doctor.userId } }),
    ]);
    return { deleted: true };
  }
}

module.exports = new AdminService();
