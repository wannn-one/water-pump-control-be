const express = require('express');
const router = express.Router();
const pumpControlController = require('../controllers/pump.controller');

// Toggle pump state (ON/OFF)
router.put('/:pumpId/toggle', pumpControlController.togglePump);

// Set pump mode (Manual / Automatic)
router.put('/:pumpId/mode', pumpControlController.setPumpMode);

// Get pump history
router.get('/:pumpId/history', pumpControlController.getPumpHistory);

// Get all pumps
router.get('/', pumpControlController.getAllPumps);

// Get pump by ID
router.get('/:pumpId', pumpControlController.getPumpById);

// Set pump relay pin
router.put('/:pumpId/setRelayPin', pumpControlController.setRelayPin);

module.exports = router;
