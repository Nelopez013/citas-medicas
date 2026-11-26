const calendarService = require("../services/CalendarService");

class CalendarController {
  async list(req, res, next) {
    try { res.json(await calendarService.listMine(req.user.id)); } catch (e) { next(e); }
  }
  async add(req, res, next) {
    try { res.status(201).json(await calendarService.add(req.user.id, req.body)); } catch (e) { next(e); }
  }
  async remove(req, res, next) {
    try { res.json(await calendarService.remove(req.user.id, req.params.id)); } catch (e) { next(e); }
  }
}

module.exports = new CalendarController();
