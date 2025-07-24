const express = require('express');
const router = express.Router();
const actionLogController = require('../controllers/actionLog.controller');

// Route untuk mengambil data log aksi dengan pagination
router.get('/actions', actionLogController.getPaginatedActionLogs);

// Route untuk export CSV
router.get('/actions/download/csv', actionLogController.exportActionLogsToCsv);

module.exports = router;
