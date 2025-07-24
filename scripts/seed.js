const mongoose = require('mongoose');
const SystemStatus = require('../models/systemStatus.model'); 
const LevelHistory = require('../models/levelHistory.model');
const ActionLog = require('../models/actionLog.model');
require('dotenv').config();

async function seedDatabase() {
  try {
    const mongo_connection = await mongoose.connect(process.env.MONGODB_URL);

    if (!mongo_connection) {
      throw new Error('Failed to connect to MongoDB');
    }

    console.log('Connected to MongoDB', mongo_connection.connection.host);
    console.log('Database name:', mongo_connection.connection.name);

    // Hapus data lama
    await SystemStatus.deleteMany({});
    console.log('Old data in SystemStatus collection has been deleted.');

    await LevelHistory.deleteMany({});
    console.log('Old data in LevelHistory collection has been deleted.');

    await ActionLog.deleteMany({});
    console.log('Old data in ActionLog collection has been deleted.');

    // Seed SystemStatus
    const initialStatus = {
      systemId: 'ESP_CONTROLLER',
      systemCondition: 'NORMAL 1',
      tank: {
        tankId: 'TK-001',
        currentLevelCm: 0,
        sensorStatus: 'WORKING'
      },
      pumps: [
        { pumpId: 'P-001', status: 'OFF' },
        { pumpId: 'P-002', status: 'OFF' },
        { pumpId: 'P-003', status: 'OFF' }
      ]
    };

    await SystemStatus.create(initialStatus);
    console.log('Seeded 1 SystemStatus document as initial state.');

    // Seed ActionLog dengan beberapa sample data
    const sampleActionLogs = [
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 jam yang lalu
        source: 'USER_DASHBOARD',
        actionType: 'SYSTEM_MODE_CHANGE',
        details: { newMode: 'MANUAL' }
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 jam yang lalu
        source: 'USER_DASHBOARD',
        actionType: 'PUMP_STATUS_CHANGE',
        details: { pumpId: 'P-001', status: 'ON' }
      },
      {
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 jam yang lalu
        source: 'USER_DASHBOARD',
        actionType: 'PUMP_STATUS_CHANGE',
        details: { pumpId: 'P-002', status: 'ON' }
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 menit yang lalu
        source: 'USER_DASHBOARD',
        actionType: 'SYSTEM_MODE_CHANGE',
        details: { newMode: 'AUTO' }
      },
      {
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 menit yang lalu
        source: 'SYSTEM_AUTO',
        actionType: 'PUMP_STATUS_CHANGE',
        details: { pumpId: 'P-001', status: 'OFF' }
      }
    ];

    await ActionLog.insertMany(sampleActionLogs);
    console.log(`Seeded ${sampleActionLogs.length} ActionLog documents as sample data.`);

  } catch (err) {
    console.error('Error while seeding database:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database seeding completed, MongoDB connection closed.');
  }
}

seedDatabase();