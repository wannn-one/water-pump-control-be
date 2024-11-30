const mongoose = require('mongoose');
const Device = require('../models/device.model');
const Sensor = require('../models/sensor.model');
const Pump = require('../models/pump.model');
const DeviceLog = require('../models/devicelog.model');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB...');

    // Clear existing data (opsional, jika ingin reset data)
    await Device.deleteMany({});
    await Sensor.deleteMany({});
    await Pump.deleteMany({});
    await DeviceLog.deleteMany({});
    console.log('Existing data cleared.');

    // Seed Devices
    const devices = [
      { deviceId: 'ESP32-01', name: 'Pump1', type: 'ESP_PLC', location: 'Room 1', status: 'INACTIVE' },
      { deviceId: 'ESP32-02', name: 'Sensor1', type: 'ESP_WATERLEVEL', location: 'Room 2', status: 'ACTIVE' },
    ];

    const savedDevices = await Device.insertMany(devices);
    console.log(`Seeded ${savedDevices.length} devices.`);

    // Seed Sensors (misalnya terkait dengan device tertentu)
    const sensors = [
      { sensorId: 'SENSOR-001', name: 'Water Level Sensor', associatedDevice: savedDevices[1].deviceId, status: 'ON' },
    ];

    const savedSensors = await Sensor.insertMany(sensors);
    console.log(`Seeded ${savedSensors.length} sensors.`);

    // Seed Pumps (misalnya terkait dengan device tertentu)
    const pumps = [
      { pumpId: 'PUMP-001', name: 'Water Pump', associatedDevice: savedDevices[0].deviceId, relayPin: 1, status: 'OFF', controlMode: 'MANUAL', lastAction: 'TURN_OFF', lastUpdated: Date.now() },
    ];

    const savedPumps = await Pump.insertMany(pumps);
    console.log(`Seeded ${savedPumps.length} pumps.`);

    // Seed DeviceLogs
    const logs = [
      { deviceId: savedDevices[0].deviceId, action: 'TURN_ON', status: 'ON', timestamp: Date.now() },
      { deviceId: savedDevices[1].deviceId, action: 'TURN_OFF', status: 'OFF', timestamp: Date.now() },
      { deviceId: savedDevices[0].deviceId, action: 'TURN_OFF', status: 'OFF', timestamp: Date.now() },
      { deviceId: savedDevices[1].deviceId, action: 'TURN_ON', status: 'ON', timestamp: Date.now() },
    ];

    const savedLogs = await DeviceLog.insertMany(logs);
    console.log(`Seeded ${savedLogs.length} device logs.`);

    // Close connection
    mongoose.connection.close();
    console.log('Seeding complete, database connection closed.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seedDatabase();
