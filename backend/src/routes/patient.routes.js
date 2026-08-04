const express = require('express');
const patientController = require('../controllers/patient.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const { updatePatientProfileSchema, listPatientsSchema } = require('../validations/patient.schema');

const router = express.Router();

// All patient routes require authentication
router.use(authenticate);

// GET /api/v1/patients/me — Patient: get own profile
router.get('/me', authorize(ROLES.PATIENT), patientController.getMyProfile);

// PATCH /api/v1/patients/me — Patient: update own profile
router.patch('/me', authorize(ROLES.PATIENT), validate(updatePatientProfileSchema), patientController.updateMyProfile);

// GET /api/v1/patients — Doctor: list all patients
router.get('/', authorize(ROLES.DOCTOR), validate(listPatientsSchema, 'query'), patientController.listAll);

// GET /api/v1/patients/:id — Doctor: get specific patient
router.get('/:id', authorize(ROLES.DOCTOR), patientController.getById);

module.exports = router;
