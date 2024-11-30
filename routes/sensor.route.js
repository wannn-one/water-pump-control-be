const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');

// Endpoint untuk mengontrol sensor (ON/OFF)
router.put('/:sensorId/setRange', sensorController.setRange); 

router.put('/:sensorId/updateLastReading', sensorController.updateLastReading); // Update last reading

// Endpoint untuk mengambil riwayat log sensor
router.get('/:sensorId/history', sensorController.getSensorHistory); // Get sensor history

module.exports = router;