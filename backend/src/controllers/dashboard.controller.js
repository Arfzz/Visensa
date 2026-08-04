const dashboardService = require('../services/dashboard.service');
const sessionService   = require('../services/session.service');

/**
 * DashboardController — Handles HTTP layer for dashboard & statistics.
 */
const dashboardController = {
  /**
   * GET /api/v1/dashboard — Doctor: get own dashboard summary.
   */
  async getDoctorDashboard(req, res, next) {
    try {
      const summary = await dashboardService.getDoctorSummary(req.user.id);
      return res.ok({ message: 'Dashboard data retrieved.', data: summary });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/patients/:patientId — Doctor: get per-patient detail.
   */
  async getPatientDetail(req, res, next) {
    try {
      const detail = await dashboardService.getPatientDetail(req.params.patientId);
      return res.ok({ message: 'Patient detail retrieved.', data: detail });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/dashboard/stats/me — Patient: get own exercise statistics.
   * Uses session service's aggregation method.
   */
  async getMyStats(req, res, next) {
    try {
      // patient ID is already resolved in req.user.profile.id by authenticate middleware
      const patientId = req.user.profile.id;
      if (!patientId) {
        return res.ok({ message: 'No stats yet. Start your first session!', data: null });
      }

      const stats = await sessionService.getPatientStats(patientId);
      return res.ok({ message: 'Statistics retrieved.', data: stats });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
