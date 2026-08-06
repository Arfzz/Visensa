const express = require('express');
const sessionController = require('../controllers/session.controller');
const { authenticate }  = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize');
const { validate }      = require('../middlewares/validate');
const {
  logExerciseSchema,
  logMinigameSchema,
  listSessionSchema,
} = require('../validations/session.schema');

const router = express.Router();

// All session routes require authentication
router.use(authenticate);

// ====================================================
// EXERCISE LOG ROUTES
// ====================================================

// POST   /api/v1/sessions/exercise           → Patient: log exercise (requires scheduleId)
router.post(
  '/exercise',
  authorize(ROLES.PATIENT),
  validate(logExerciseSchema),
  sessionController.logExercise
);

// POST   /api/v1/sessions/exercise/direct     → Patient: log session from camera (no scheduleId needed)
router.post(
  '/exercise/direct',
  authorize(ROLES.PATIENT),
  sessionController.logExerciseDirect
);

// GET    /api/v1/sessions/exercise/me         → Patient: own exercise history
router.get(
  '/exercise/me',
  authorize(ROLES.PATIENT),
  sessionController.getMyExerciseLogs
);

// GET    /api/v1/sessions/exercise           → Doctor: all exercise logs
router.get(
  '/exercise',
  authorize(ROLES.DOCTOR),
  validate(listSessionSchema, 'query'),
  sessionController.getAllExerciseLogs
);

// GET    /api/v1/sessions/exercise/:id       → Doctor or Patient: single log
router.get(
  '/exercise/:id',
  authorize(ROLES.DOCTOR, ROLES.PATIENT),
  sessionController.getExerciseLogById
);

// ====================================================
// MINIGAME LOG ROUTES
// ====================================================

// POST   /api/v1/sessions/minigame           → Patient: log Piano Tiles result
router.post(
  '/minigame',
  authorize(ROLES.PATIENT),
  validate(logMinigameSchema),
  sessionController.logMinigame
);

// GET    /api/v1/sessions/minigame/me        → Patient: own minigame history
router.get(
  '/minigame/me',
  authorize(ROLES.PATIENT),
  sessionController.getMyMinigameLogs
);

// ====================================================
// STATS ROUTES
// ====================================================

// GET    /api/v1/sessions/stats/me           → Patient: gamification stats + trend
router.get(
  '/stats/me',
  authorize(ROLES.PATIENT),
  sessionController.getMyStats
);

// GET    /api/v1/sessions/stats/monthly-goal  → Patient: get monthly exercise goal
router.get(
  '/stats/monthly-goal',
  authorize(ROLES.PATIENT),
  sessionController.getMonthlyGoalController
);

module.exports = router;
