const prisma = require("../config/prisma");

class DoctorService {
  async listSpecialties() {
    const rows = await prisma.doctor.findMany({ distinct: ["specialty"], select: { specialty: true }, orderBy: { specialty: "asc" } });
    return rows.map((r) => r.specialty);
  }

  async listBySpecialty(specialty) {
    const doctors = await prisma.doctor.findMany({
      where: specialty ? { specialty } : {},
      include: {
        user: { select: { name: true } },
        slots: {
          where: { isBooked: false, startsAt: { gt: new Date() } },
          orderBy: { startsAt: "asc" },
          select: { id: true, startsAt: true },
        },
      },
    });
    return doctors
      .map((d) => ({ id: d.id, name: d.user.name, specialty: d.specialty, slots: d.slots }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

module.exports = new DoctorService();
