const authService = require("../services/AuthService");

class AuthController {
  async register(req, res, next) {
    try {
      res.status(201).json(await authService.register(req.body));
    } catch (e) { next(e); }
  }
  async login(req, res, next) {
    try {
      res.json(await authService.login(req.body));
    } catch (e) { next(e); }
  }
}

module.exports = new AuthController();
