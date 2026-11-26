const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { HttpError } = require("../middleware/errorHandler");
const { validateNewUser, assertUnique } = require("../utils/validators");

class AuthService {
  
  async register(body) {
    const clean = validateNewUser(body);
    await assertUnique(clean);
    const passwordHash = await bcrypt.hash(body.password, 10);
    try {
      const user = await prisma.user.create({ data: { ...clean, passwordHash, role: "PATIENT" } });
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    } catch (e) {
      if (e.code === "P2002") throw new HttpError(409, "Documento o email ya registrados");
      throw e;
    }
  }

  async login({ email, password }) {
    if (!email || !password) throw new HttpError(400, "Email y contraseña son obligatorios");
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw new HttpError(401, "Credenciales inválidas");

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}

module.exports = new AuthService();
