const express = require('express');
const patientController = require('../controllers/patient.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const {
  updatePatientProfileSchema,
  listPatientsSchema,
  registerPatientSchema,
} = require('../validations/patient.schema');

const router = express.Router();

// All patient routes require authentication
router.use(authenticate);

// POST /api/v1/patients/register — Doctor: register new patient
router.post('/register', authorize(ROLES.DOCTOR), validate(registerPatientSchema), patientController.registerPatient);

// POST /api/v1/patients/:id/notes — Doctor: update therapist notes
router.post('/:id/notes', authorize(ROLES.DOCTOR), patientController.updateNotes);

// GET /api/v1/patients/:id/feedback-logs — Doctor/Patient: get patient feedback logs
router.get('/:id/feedback-logs', authorize(ROLES.DOCTOR, ROLES.PATIENT), patientController.getFeedbackLogs);

// GET /api/v1/patients/me — Patient: get own profile
router.get('/me', authorize(ROLES.PATIENT), patientController.getMyProfile);

// PATCH /api/v1/patients/me — Patient: update own profile
router.patch('/me', authorize(ROLES.PATIENT), validate(updatePatientProfileSchema), patientController.updateMyProfile);

// GET /api/v1/patients — Doctor: list all patients
router.get('/', authorize(ROLES.DOCTOR), validate(listPatientsSchema, 'query'), patientController.listAll);

// GET /api/v1/patients/:id — Doctor: get specific patient
router.get('/:id', authorize(ROLES.DOCTOR), patientController.getById);

module.exports = router;
