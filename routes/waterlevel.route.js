const express = require('express');
const router = express.Router();
const waterLevelController = require('../controllers/waterlevel.controller');

router.route('/')
    .get(waterLevelController.getWaterLevels) // Get all water levels
    .post(waterLevelController.logWaterLevel); // Log water level

// Get the latest water level
router.get('/latest', waterLevelController.getLatestWaterLevel);

module.exports = router;