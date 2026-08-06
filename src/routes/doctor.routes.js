const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');

// Import middleware security (Sesuaikan path-nya sama struktur lu)
const { authenticate } = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize'); 

// Tembak GET /api/v1/doctors/me
router.get('/me', authenticate, authorize(ROLES.DOCTOR), doctorController.getMyProfile);

module.exports = router;