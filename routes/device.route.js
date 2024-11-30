const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

router.route('/')
  .get(deviceController.getDevices) // Get all devices
  .post(deviceController.createDevice); // Create a new device

router.route('/:id')
    .get(deviceController.getDeviceById) // Get a single device by ID
    .put(deviceController.updateDevice) // Update a device
    .delete(deviceController.deleteDevice); // Delete a device

module.exports = router;