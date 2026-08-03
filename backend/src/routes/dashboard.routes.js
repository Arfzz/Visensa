const express    = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate }    = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/dashboard
 * Doctor: Summary stats — total patients, active patients, sessions this month, avg accuracy.
 */
router.get(
  '/',
  authorize(ROLES.DOCTOR),
  dashboardController.getDoctorDashboard
);

/**
 * GET /api/v1/dashboard/patients/:patientId
 * Doctor: Drill-down detail for a specific patient — stats + session trend + history.
 */
router.get(
  '/patients/:patientId',
  authorize(ROLES.DOCTOR),
  dashboardController.getPatientDetail
);

/**
 * GET /api/v1/dashboard/stats/me
 * Patient: Own aggregated exercise stats — total sessions, reps, duration, accuracy trend.
 */
router.get(
  '/stats/me',
  authorize(ROLES.PATIENT),
  dashboardController.getMyStats
);

module.exports = router;
