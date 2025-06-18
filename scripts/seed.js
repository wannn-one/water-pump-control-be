const mongoose = require('mongoose');
const SystemStatus = require('../models/systemStatus.model'); 
const LevelHistory = require('../models/levelHistory.model');
require('dotenv').config();

async function seedDatabase() {
  try {
    const mongo_connection = await mongoose.connect(process.env.MONGODB_URL);

    if (!mongo_connection) {
      throw new Error('Failed to connect to MongoDB');
    }

    console.log('Connected to MongoDB', mongo_connection.connection.host);
    console.log('Database name:', mongo_connection.connection.name);

    await SystemStatus.deleteMany({});
    console.log('Old data in SystemStatus collection has been deleted.');

    await LevelHistory.deleteMany({});
    console.log('Old data in LevelHistory collection has been deleted.');

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

  } catch (err) {
    console.error('Error while seeding database:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database seeding completed, MongoDB connection closed.');
  }
}

seedDatabase();