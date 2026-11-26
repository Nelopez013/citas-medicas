const doctorService = require("../services/DoctorService");

class DoctorController {
  async specialties(req, res, next) {
    try {
      res.json(await doctorService.listSpecialties());
    } catch (e) { next(e); }
  }
  async list(req, res, next) {
    try {
      res.json(await doctorService.listBySpecialty(req.query.specialty));
    } catch (e) { next(e); }
  }
}

module.exports = new DoctorController();
