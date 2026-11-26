const userService = require("../services/UserService");

class UserController {
  async me(req, res, next) {
    try { res.json(await userService.getProfile(req.user.id)); } catch (e) { next(e); }
  }
  async update(req, res, next) {
    try { res.json(await userService.updateProfile(req.user.id, req.body)); } catch (e) { next(e); }
  }
}

module.exports = new UserController();
