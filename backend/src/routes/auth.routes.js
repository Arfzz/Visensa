const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validations/auth.schema');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// GET /api/v1/auth/me  [Protected]
router.get('/me', authenticate, authController.me);

module.exports = router;
