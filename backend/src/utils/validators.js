const prisma = require("../config/prisma");
const { HttpError } = require("../middleware/errorHandler");

const EMAIL_RE = /^[a-z0-9._%+-]+@fomag\.co$/i; // solo @fomag.co
const DOC_RE = /^\d{5,10}$/;

function validateNewUser({ documento, name, email, password }) {
  if (!documento || !name || !email || !password) {
    throw new HttpError(400, "Documento, nombre, email y contraseña son obligatorios");
  }
  const doc = String(documento).trim();
  if (!DOC_RE.test(doc)) throw new HttpError(400, "El documento debe tener entre 5 y 10 dígitos");
  const mail = String(email).trim().toLowerCase();
  if (!EMAIL_RE.test(mail)) throw new HttpError(400, "Solo se aceptan correos con formato @fomag.co");
  if (String(password).length < 6) throw new HttpError(400, "La contraseña debe tener al menos 6 caracteres");
  return { documento: doc, name: String(name).trim(), email: mail };
}

async function assertUnique({ email, documento }) {
  if (await prisma.user.findUnique({ where: { email } })) throw new HttpError(409, "El email ya está registrado");
  if (await prisma.user.findUnique({ where: { documento } })) throw new HttpError(409, "El documento ya está registrado");
}

module.exports = { validateNewUser, assertUnique };
