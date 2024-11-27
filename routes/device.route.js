const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

router.route('/')
    .get(deviceController.getAllDevices) // Get all devices
    .post(deviceController.registerDevice); // Register a new device

router.route('/:id')
    .get(deviceController.getDeviceById) // Get a device by id
    .put(deviceController.updateDevice) // Update a device
    .delete(deviceController.deleteDevice); // Delete a device

module.exports = router;
