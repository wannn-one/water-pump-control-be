const express = require('express');
const router = express.Router();
const pumpControlController = require('../controllers/pumpcontrol.controller');

// Add pump data
router.post('/add', pumpControlController.addPumpData);

// Control pump (ON/OFF)
router.put('/edit/:id', pumpControlController.controlPump);

// Get current pump status
router.get('/status', pumpControlController.getPumpStatus);

// Get pump logs
router.get('/logs', pumpControlController.getPumpLogs);

module.exports = router;