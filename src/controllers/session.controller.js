const sessionService = require('../services/session.service');
const { parsePagination } = require('../utils/pagination');

/**
 * SessionController — HTTP layer for exercise & minigame session logging.
 *
 * All patient-facing endpoints read the patient table PK from req.user.profile.id
 * (set by authenticate middleware after querying patient table).
 */
const sessionController = {

  // ====================================================
  // EXERCISE LOGS
  // ====================================================

  /**
   * POST /api/v1/sessions/exercise
   * Patient: Log a completed exercise session.
   * Body: { scheduleId, durationSeconds, maxAngle?, painLevel? }
   */
  async logExercise(req, res, next) {
    try {
      const log = await sessionService.logExercise(req.body.scheduleId, req.body);
      return res.created({ message: 'Exercise session logged successfully.', data: log });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/sessions/exercise/direct
   * Patient: Log a completed therapy session without a scheduleId.
   * Used by SessionComplete page after finishing therapy at /camera.
   * Body: { durationSeconds, painLevel? }
   */
  async logExerciseDirect(req, res, next) {
    try {
      const patientId = req.user.profile?.id;
      if (!patientId) {
        return res.status(400).json({ success: false, message: 'Patient profile not found in token.' });
      }
      const log = await sessionService.logExerciseDirect(patientId, req.body);
      return res.created({ message: 'Session logged successfully.', data: log });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/sessions/exercise/me
   * Patient: Get own exercise history.
   */
  async getMyExerciseLogs(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const patientId = req.user.profile.id; // patient table PK
      const { data, total } = await sessionService.getPatientExerciseLogs(patientId, { page, limit });
      return res.paginate({ message: 'Exercise history retrieved.', data, page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/sessions/exercise
   * Doctor: Get all exercise logs (optional ?patientId= filter).
   */
  async getAllExerciseLogs(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const { patientId }   = req.query;
      const { data, total } = await sessionService.getAllExerciseLogs({ page, limit, patientId });
      return res.paginate({ message: 'All exercise logs retrieved.', data, page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/sessions/exercise/:id
   * Doctor or Patient: Get a single exercise log by ID.
   */
  async getExerciseLogById(req, res, next) {
    try {
      const log = await sessionService.getExerciseLogById(req.params.id);
      return res.ok({ message: 'Exercise log retrieved.', data: log });
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyGoalController(req, res, next) {
    try {
      const userId = req.user.id; // Ambil ID user dari JWT auth
      const monthlyGoal = await sessionService.getMonthlyGoal(userId);

      return res.status(200).json({
        success: true,
        data: {
          monthly_goal: monthlyGoal
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // ====================================================
  // MINIGAME LOGS (Piano Tiles)
  // ====================================================

  /**
   * POST /api/v1/sessions/minigame
   * Patient: Log a completed Piano Tiles session.
   * Body: { score, durationSeconds, maxCombo, scheduleId? }
   */
  async logMinigame(req, res, next) {
    try {
      const patientId = req.user.profile.id; // patient table PK
      const log = await sessionService.logMinigame(patientId, req.body);
      return res.created({ message: 'Minigame session logged successfully.', data: log });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/sessions/minigame/me
   * Patient: Get own minigame history.
   */
  async getMyMinigameLogs(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const patientId = req.user.profile.id;
      const { data, total } = await sessionService.getPatientMinigameLogs(patientId, { page, limit });
      return res.paginate({ message: 'Minigame history retrieved.', data, page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  // ====================================================
  // STATS
  // ====================================================

  /**
   * GET /api/v1/sessions/stats/me
   * Patient: Get own gamification stats + trends.
   */
  async getMyStats(req, res, next) {
    try {
      const patientId = req.user.profile.id;
      const stats = await sessionService.getPatientStats(patientId);
      return res.ok({ message: 'Stats retrieved.', data: stats });
    } catch (err) {
      next(err);
    }
  },

  async getSessionStats (req, res, next) {
  try {
    const userId = req.user.id; // Asumsi lu ngambil userId dari token JWT lu
    
    // 1. Tarik stats dari fungsi lu yang lama
    const patientData = await sessionService.getPatientStats(req.user.profile.id); // Asumsi patientId
    
    // 2. Tarik angka target bulanan pake fungsi yang baru lu selipin tadi
    const monthlyGoal = await sessionService.getMonthlyGoal(userId);

    // 3. Gabungin datanya pas dilempar ke Frontend
    return res.status(200).json({
      success: true,
      data: {
        ...patientData, // Nge-spread data stats & history gamification lu
        monthly_goal: monthlyGoal // <-- Ini angka dinamisnya masuk!
      }
    });

  } catch (error) {
    next(error); // Lempar ke error handler
  }
}

};

module.exports = sessionController;
