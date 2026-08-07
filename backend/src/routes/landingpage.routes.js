const express = require('express');
const router = express.Router();
const landingPageController = require('../controllers/landingpage.controller');

// GET /api/v1/landing-page/testimonials
router.get('/testimonials', landingPageController.getTestimonials);

module.exports = router;