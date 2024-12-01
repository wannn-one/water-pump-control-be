const Device = require('../models/device.model');
const DeviceLog = require('../models/devicelog.model');
const Pump = require('../models/pump.model');
const WaterLevel = require('../models/sensor.model');

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving devices', error: err.message });
  }
};

// Get device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.find({ deviceId: req.params.id });
    if (!device) return res.status(404).json({ message: 'Device not found' });
    res.status(200).json(device);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving device', error: err.message });
  }
};

// Create a new device
exports.createDevice = async (req, res) => {
  try {
    const { deviceId, type, location, status } = req.body;

    // Check if deviceId already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ message: 'Device with this ID already exists' });
    }

    const newDevice = new Device({ deviceId, type, location, status });
    const savedDevice = await newDevice.save();

    // if type is 'ESP_PLC' then create a new pump, else if type is 'ESP_WATERLEVEL' then create a new water level sensor, else return error
    if (type === 'ESP_PLC') {
      // Create a new pump
      await Pump.create({
        pumpId: 'PUMP-' + deviceId,
        associatedDevice: deviceId,
        status: 'OFF',
        lastAction: 'TURN_OFF',
        lastUpdated: Date.now(),
      });
    } else if (type === 'ESP_WATERLEVEL') {
      // Create a new water level sensor
      await WaterLevel.create({
        sensorId: 'SENSOR-' + deviceId,
        associatedDevice: deviceId,
        status: 'NORMAL',
        lastUpdated: Date.now(),
      });
    } else {
      return res.status(400).json({ message: 'Invalid device type' });
    }

    await DeviceLog.create({
      deviceId: savedDevice.deviceId,
      action: 'CREATE',
      status: savedDevice.status,
      timestamp: Date.now(),
    });

    res.status(201).json( { message: 'Device created successfully', device: savedDevice });
  } catch (err) {
    res.status(500).json({ message: 'Error creating device', error: err.message });
  }
};

// Update a device
exports.updateDevice = async (req, res) => {
  try {
    const updatedDevice = await Device.findOneAndUpdate({ deviceId: req.params.id, }, req.body);
    if (!updatedDevice) return res.status(404).json({ message: 'Device not found' });

    // Log the update of the device
    await DeviceLog.create({
      deviceId: updatedDevice.deviceId,
      action: 'UPDATE',
      status: updatedDevice.status,
      timestamp: Date.now(),
    });

    res.status(200).json({message: "Device updated successfully", device: updatedDevice});
  } catch (err) {
    res.status(500).json({ message: 'Error updating device', error: err.message });
  }
};

// Delete a device
exports.deleteDevice = async (req, res) => {
  try {
    const deletedDevice = await Device.findOneAndDelete({ deviceId: req.params.id });
    if (!deletedDevice) return res.status(404).json({ message: 'Device not found' });

    // Log the deletion of the device
    await DeviceLog.create({
      deviceId: deletedDevice.deviceId,
      action: 'DELETE',
      status: deletedDevice.status,
      timestamp: Date.now(),
    });

    res.status(200).json({ message: 'Device deleted successfully', device: deletedDevice });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting device', error: err.message });
  }
};
