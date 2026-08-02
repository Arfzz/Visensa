const express = require('express');
const sessionController = require('../controllers/session.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const { createSessionSchema, listSessionSchema } = require('../validations/session.schema');

const router = express.Router();

// All session routes require authentication
router.use(authenticate);

// POST /api/v1/sessions — Patient: log a completed session
router.post('/', authorize(ROLES.PATIENT), validate(createSessionSchema), sessionController.create);

// GET /api/v1/sessions/me — Patient: view own session history
router.get('/me', authorize(ROLES.PATIENT), sessionController.getMySessions);

// GET /api/v1/sessions — Doctor: view all sessions (with filter)
router.get('/', authorize(ROLES.DOCTOR), validate(listSessionSchema, 'query'), sessionController.listAll);

// GET /api/v1/sessions/:id — Doctor or Patient: get session detail
router.get('/:id', authorize(ROLES.DOCTOR, ROLES.PATIENT), sessionController.getById);

module.exports = router;
