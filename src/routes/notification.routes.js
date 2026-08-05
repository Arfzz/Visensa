const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize, ROLES } = require('../middlewares/authorize');

const router = express.Router();

// Require authentication for notification routes
router.use(authenticate);

// GET /api/v1/notifications — Doctor: Get clinical alerts
router.get('/', authorize(ROLES.DOCTOR), notificationController.getNotifications);

// PATCH /api/v1/notifications/:id/read — Doctor: Mark notification as read
router.patch('/:id/read', authorize(ROLES.DOCTOR), notificationController.markAsRead);

module.exports = router;
