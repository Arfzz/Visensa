const sessionService = require('../services/session.service');
const { parsePagination } = require('../utils/pagination');

/**
 * SessionController — Handles HTTP layer for rehabilitation sessions.
 */
const sessionController = {
  /**
   * POST /api/v1/sessions — Patient: log a completed exercise session.
   */
  async create(req, res, next) {
    try {
      const session = await sessionService.createSession(req.user.id, req.body);
      return res.created({ message: 'Session logged successfully.', data: session });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/sessions/me — Patient: get own session history.
   */
  async getMySessions(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const { data, total } = await sessionService.getPatientSessions(req.user.id, { page, limit });
      return res.paginate({ message: 'Session history retrieved.', data, page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/sessions — Doctor: get all sessions (with optional patientId filter).
   */
  async listAll(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const { patientId } = req.query;
      const { data, total } = await sessionService.getAllSessions({ page, limit, patientId });
      return res.paginate({ message: 'All sessions retrieved.', data, page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/sessions/:id — Get a single session detail.
   */
  async getById(req, res, next) {
    try {
      const session = await sessionService.getById(req.params.id);
      return res.ok({ message: 'Session detail retrieved.', data: session });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = sessionController;
