const adminService = require("../services/AdminService");

class AdminController {
  async list(req, res, next) {
    try { res.json(await adminService.listDoctors()); } catch (e) { next(e); }
  }
  async create(req, res, next) {
    try { res.status(201).json(await adminService.createDoctor(req.body)); } catch (e) { next(e); }
  }
  async remove(req, res, next) {
    try { res.json(await adminService.deleteDoctor(req.params.id)); } catch (e) { next(e); }
  }
}

module.exports = new AdminController();
