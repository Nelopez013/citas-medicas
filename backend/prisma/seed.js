require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Contraseña de prueba para todos los médicos: Doctor123
const doctors = [
  { documento: "1000000001", name: "Dra. Laura Gómez", email: "laura.gomez@fomag.co", specialty: "Medicina General" },
  { documento: "1000000002", name: "Dr. Carlos Ruiz", email: "carlos.ruiz@fomag.co", specialty: "Cardiología" },
  { documento: "1000000003", name: "Dra. Ana Torres", email: "ana.torres@fomag.co", specialty: "Pediatría" },
  { documento: "1000000004", name: "Dr. Jorge Medina", email: "jorge.medina@fomag.co", specialty: "Dermatología" },
];

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany({ where: { role: "DOCTOR" } });

  const passwordHash = await bcrypt.hash("Doctor123", 10);
  for (const d of doctors) {
    const user = await prisma.user.create({
      data: {
        documento: d.documento, name: d.name, email: d.email, passwordHash, role: "DOCTOR",
        doctor: { create: { specialty: d.specialty } },
      },
      include: { doctor: true },
    });
    const slots = [];
    for (let day = 1; day <= 5; day++) {
      for (const hour of [8, 9, 10, 11, 14, 15, 16]) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        date.setHours(hour, 0, 0, 0);
        slots.push({ doctorId: user.doctor.id, startsAt: date });
      }
    }
    await prisma.slot.createMany({ data: slots });
  }
  console.log("Seed completado. Médicos: *@fomag.co / contraseña Doctor123");
}

main().finally(() => prisma.$disconnect());
