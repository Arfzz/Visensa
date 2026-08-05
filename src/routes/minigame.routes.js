const express = require('express');
const router = express.Router();
const minigameController = require('../controllers/minigame.controller');

router.post('/logs', minigameController.storeLog);
router.get('/logs/:userId', minigameController.getLogs);

module.exports = router;