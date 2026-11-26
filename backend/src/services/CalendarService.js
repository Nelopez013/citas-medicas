const prisma = require("../config/prisma");
const { HttpError } = require("../middleware/errorHandler");


class CalendarService {
  async getDoctor(userId) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new HttpError(403, "Tu usuario no tiene perfil de médico");
    return doctor;
  }

  async listMine(userId) {
    const doctor = await this.getDoctor(userId);
    const slots = await prisma.slot.findMany({
      where: { doctorId: doctor.id, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      include: { appointments: { where: { status: "ACTIVE" }, include: { user: { select: { name: true } } } } },
    });
    return slots.map((s) => ({
      id: s.id,
      startsAt: s.startsAt,
      isBooked: s.isBooked,
      patient: s.appointments[0] ? s.appointments[0].user.name : null,
    }));
  }

  // Acepta un horario (startsAt) o varios (startsAtList, máx. 100) para "trazar" el calendario
  async add(userId, { startsAt, startsAtList } = {}) {
    const doctor = await this.getDoctor(userId);
    const list = Array.isArray(startsAtList) ? startsAtList : [startsAt];
    if (list.length === 0 || list.length > 100) throw new HttpError(400, "Envía entre 1 y 100 horarios");

    const dates = list.map((v) => new Date(v));
    if (dates.some((d) => isNaN(d))) throw new HttpError(400, "Fecha y hora inválidas");
    const future = dates.filter((d) => d > new Date());
    if (!future.length) throw new HttpError(400, "Los horarios deben ser a futuro");

    const result = await prisma.slot.createMany({
      data: future.map((d) => ({ doctorId: doctor.id, startsAt: d })),
      skipDuplicates: true, // respeta la restricción única (médico, fecha-hora)
    });
    return { created: result.count, skipped: list.length - result.count };
  }

  async remove(userId, slotId) {
    const doctor = await this.getDoctor(userId);
    const id = Number(slotId);
    if (!Number.isInteger(id)) throw new HttpError(400, "id inválido");

    const slot = await prisma.slot.findUnique({ where: { id } });
    if (!slot || slot.doctorId !== doctor.id) throw new HttpError(404, "Horario no encontrado");
    if (slot.isBooked) throw new HttpError(409, "El horario tiene una cita reservada");

    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { slotId: id } }), // solo quedan canceladas
      prisma.slot.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }
}

module.exports = new CalendarService();
