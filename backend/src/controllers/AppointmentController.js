const appointmentService = require("../services/AppointmentService");

class AppointmentController {
  async create(req, res, next) {
    try {
      res.status(201).json(await appointmentService.book(req.user.id, req.body.slotId));
    } catch (e) { next(e); }
  }
  async mine(req, res, next) {
    try {
      res.json(await appointmentService.listMine(req.user.id));
    } catch (e) { next(e); }
  }
  async cancel(req, res, next) {
    try {
      res.json(await appointmentService.cancel(req.user.id, req.params.id));
    } catch (e) { next(e); }
  }
}

module.exports = new AppointmentController();
