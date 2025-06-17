const express = require('express');
const router = express.Router();
const levelHistoryController = require('../controllers/levelHistory.controller');

router.get('/graph', levelHistoryController.getHistoryData);
router.get('/table', levelHistoryController.getPaginatedHistory);

module.exports = router;