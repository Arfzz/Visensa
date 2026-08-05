const express = require('express');
const router = express.Router();
const minigameController = require('../controllers/minigame.controller');

router.post('/logs', minigameController.storeLog);

module.exports = router;