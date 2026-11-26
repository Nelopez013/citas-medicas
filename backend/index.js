require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const routes = require("./src/routes");
const { errorHandler } = require("./src/middleware/errorHandler");

if (!process.env.JWT_SECRET) {
  console.error("Falta la variable JWT_SECRET");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1); 
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos, intenta de nuevo en unos minutos" },
}));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
