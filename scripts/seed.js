const mongoose = require('mongoose');
const Device = require('../models/device.model');
const Sensor = require('../models/sensor.model');
const Pump = require('../models/pump.model');
const DeviceLog = require('../models/devicelog.model');
const SensorHistory = require('../models/sensorhistory.model');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Device.deleteMany({});
    await Sensor.deleteMany({});
    await Pump.deleteMany({});
    await DeviceLog.deleteMany({});
    await SensorHistory.deleteMany({});
    console.log('Existing data cleared.');

    // Seed Devices
    const devices = [
      { 
        deviceId: 'ESP32-01', 
        type: 'ESP_PLC', 
        location: 'P-001', 
        status: 'ACTIVE' 
      },
      { 
        deviceId: 'ESP32-02', 
        type: 'ESP_PLC', 
        location: 'P-002', 
        status: 'ACTIVE' 
      },
      {
        deviceId: 'ESP32-03',
        type: 'ESP_PLC',
        location: 'P-003',
        status: 'ACTIVE'
      },
      {
        deviceId: 'ESP32-04',
        type: 'ESP_PLC',
        location: 'P-004',
        status: 'ACTIVE'
      },
      {
        deviceId: 'ESP32-05',
        type: 'ESP_WATERLEVEL',
        location: 'TK-001',
        status: 'ACTIVE'
      },
    ];

    const savedDevices = await Device.insertMany(devices);
    console.log(`Seeded ${savedDevices.length} devices.`);

    // Seed Sensors
    const sensors = [
      { 
        sensorId: 'SENSOR-' + savedDevices[4].deviceId,
        associatedDevice: savedDevices[4].deviceId, 
        status: 'ON' 
      },
    ];

    const savedSensors = await Sensor.insertMany(sensors);
    console.log(`Seeded ${savedSensors.length} sensors.`);

    // Seed Pumps 
    const pumps = [
      { 
        pumpId: 'PUMP-' + savedDevices[0].deviceId, 
        associatedDevice: savedDevices[0].deviceId, 
        relayPin: 1, 
        status: 'OFF', 
        controlMode: 'MANUAL', 
        lastAction: 'TURN_OFF', 
        lastUpdated: Date.now() 
      },
      { 
        pumpId: 'PUMP-' + savedDevices[1].deviceId, 
        associatedDevice: savedDevices[1].deviceId, 
        relayPin: 2, 
        status: 'OFF', 
        controlMode: 'MANUAL', 
        lastAction: 'TURN_OFF', 
        lastUpdated: Date.now() 
      },
      {
        pumpId: 'PUMP-' + savedDevices[2].deviceId,
        associatedDevice: savedDevices[2].deviceId,
        relayPin: 3,
        status: 'OFF',
        controlMode: 'MANUAL',
        lastAction: 'TURN_OFF',
        lastUpdated: Date.now()
      },
      {
        pumpId: 'PUMP-' + savedDevices[3].deviceId,
        associatedDevice: savedDevices[3].deviceId,
        relayPin: 4,
        status: 'OFF',
        controlMode: 'MANUAL',
        lastAction: 'TURN_OFF',
        lastUpdated: Date.now()
      }
    ];

    const savedPumps = await Pump.insertMany(pumps);
    console.log(`Seeded ${savedPumps.length} pumps.`);

    // Seed DeviceLogs
    const logs = [
      { 
        deviceId: savedDevices[0].deviceId, 
        action: 'TURN_ON', 
        status: 'ON', 
        timestamp: Date.now() 
      },
      { 
        deviceId: savedDevices[1].deviceId, 
        action: 'TURN_OFF', 
        status: 'OFF', 
        timestamp: Date.now() 
      },
      { 
        deviceId: savedDevices[0].deviceId, 
        action: 'TURN_OFF', 
        status: 'OFF', 
        timestamp: Date.now() 
      },
      { 
        deviceId: savedDevices[1].deviceId, 
        action: 'TURN_ON', 
        status: 'ON', 
        timestamp: Date.now() 
      },
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
