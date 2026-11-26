const prisma = require("../config/prisma");
const { HttpError } = require("../middleware/errorHandler");

const include = { slot: { include: { doctor: { include: { user: { select: { name: true } } } } } } };

const format = (a) => ({
  id: a.id,
  status: a.status,
  createdAt: a.createdAt,
  slot: {
    id: a.slot.id,
    startsAt: a.slot.startsAt,
    doctor: { id: a.slot.doctor.id, name: a.slot.doctor.user.name, specialty: a.slot.doctor.specialty },
  },
});

class AppointmentService {

  async book(userId, slotId) {
    const id = Number(slotId);
    if (!Number.isInteger(id)) throw new HttpError(400, "slotId inválido");

    const appt = await prisma.$transaction(async (tx) => {
      const locked = await tx.slot.updateMany({
        where: { id, isBooked: false, startsAt: { gt: new Date() } },
        data: { isBooked: true },
      });
      if (locked.count === 0) throw new HttpError(409, "El horario ya no está disponible");
      return tx.appointment.create({ data: { userId, slotId: id }, include });
    });
    return format(appt);
  }

  async listMine(userId) {
    const items = await prisma.appointment.findMany({
      where: { userId, status: "ACTIVE" },
      include,
      orderBy: { slot: { startsAt: "asc" } },
    });
    return items.map(format);
  }

  async cancel(userId, appointmentId) {
    const id = Number(appointmentId);
    if (!Number.isInteger(id)) throw new HttpError(400, "id inválido");

    const updated = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({ where: { id } });
      if (!appt || appt.userId !== userId) throw new HttpError(404, "Cita no encontrada");
      if (appt.status === "CANCELLED") throw new HttpError(409, "La cita ya fue cancelada");

      await tx.slot.update({ where: { id: appt.slotId }, data: { isBooked: false } });
      return tx.appointment.update({ where: { id }, data: { status: "CANCELLED" }, include });
    });
    return format(updated);
  }
}

module.exports = new AppointmentService();
