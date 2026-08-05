const express = require('express');
const programController = require('../controllers/program.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const { createProgramSchema, extendProgramSchema } = require('../validations/program.schema');

const router = express.Router();

// Require authentication for all program routes
router.use(authenticate);

// GET /api/v1/programs/patient/:patientId — Doctor/Patient: get active program & weekly schedules
router.get('/patient/:patientId', programController.getActiveProgram);

// POST /api/v1/programs — Doctor: create/assign new program
router.post('/', authorize(ROLES.DOCTOR), validate(createProgramSchema), programController.createProgram);

// POST /api/v1/programs/:programId/extend — Doctor: quick extend program
router.post('/:programId/extend', authorize(ROLES.DOCTOR), validate(extendProgramSchema), programController.extendProgram);

// PATCH /api/v1/programs/:programId/reassign — Doctor: reassign program configuration
router.patch('/:programId/reassign', authorize(ROLES.DOCTOR), programController.reassignProgram);

module.exports = router;
