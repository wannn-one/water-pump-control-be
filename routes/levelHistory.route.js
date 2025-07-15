const express = require('express');
const router = express.Router();
const levelHistoryController = require('../controllers/levelHistory.controller');

router.get('/graph', levelHistoryController.getHistoryData);
router.get('/table', levelHistoryController.getPaginatedHistory);
router.get('/download/csv', levelHistoryController.exportHistoryToExcel);

module.exports = router;