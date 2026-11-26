require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@fomag.co").toLowerCase();
  if (!/^[a-z0-9._%+-]+@fomag\.co$/i.test(email)) throw new Error("ADMIN_EMAIL debe ser @fomag.co");
  if (!process.env.ADMIN_PASSWORD) console.warn("ADMIN_PASSWORD no definida: usando 'Admin123'. Cámbiala.");
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123", 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { documento: "9999999999", name: "Administrador", email, passwordHash, role: "ADMIN" },
  });
  console.log(`Administrador listo: ${email}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());
