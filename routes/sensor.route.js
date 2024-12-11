const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');

// Endpoint untuk mengontrol sensor (ON/OFF)
router.put('/:sensorId/setRange', sensorController.setRange); 

router.put('/:sensorId/updateLastReading', sensorController.updateLastReading); // Update last reading

// Endpoint untuk mengambil riwayat log sensor
router.get('/:sensorId/history', sensorController.getSensorHistory); // Get sensor history

// Endpoint untuk mengambil semua sensor
router.get('/', sensorController.getAllSensors); // Get all sensors

// Endpoint untuk mengambil sensor berdasarkan ID
router.get('/:sensorId', sensorController.getSensorById); // Get sensor by ID

router.get('/history/all', sensorController.getAllSensorsHistory); // Get all sensors history

// Download sensor history as CSV
router.get('/history/download/csv', sensorController.downloadAllSensorHistoriesAsCSV);

module.exports = router;