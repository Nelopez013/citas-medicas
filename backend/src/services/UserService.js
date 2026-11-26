const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { HttpError } = require("../middleware/errorHandler");

class UserService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { doctor: true } });
    if (!user) throw new HttpError(404, "Usuario no encontrado");
    const activeAppointments = await prisma.appointment.count({ where: { userId, status: "ACTIVE" } });
    return {
      id: user.id, documento: user.documento, name: user.name, email: user.email, role: user.role,
      specialty: user.doctor ? user.doctor.specialty : null, activeAppointments,
    };
  }

  async updateProfile(userId, { name, currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "Usuario no encontrado");

    const data = {};
    if (name !== undefined) {
      if (!name.trim()) throw new HttpError(400, "El nombre no puede estar vacío");
      data.name = name.trim();
    }
    if (newPassword) {
      if (newPassword.length < 6) throw new HttpError(400, "La nueva contraseña debe tener al menos 6 caracteres");
      const ok = await bcrypt.compare(currentPassword || "", user.passwordHash);
      if (!ok) throw new HttpError(403, "La contraseña actual es incorrecta");
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    await prisma.user.update({ where: { id: userId }, data });
    return this.getProfile(userId);
  }
}

module.exports = new UserService();
