const mongoose = require('mongoose');
const PumpSchema = require('./pump.model');

const SystemStatusSchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: [true, 'System ID is required.'],
    unique: true
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  systemCondition: {
    type: String,
    required: true,
    enum: ['NORMAL 1', 'NORMAL 2', 'SIAGA', 'BANJIR', 'MANUAL_OVERRIDE', 'UNKNOWN']
  },
  tank: {
    tankId: {
      type: String,
      default: 'TK-001'
    },
    currentLevelCm: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    sensorStatus: {
      type: String,
      enum: ['WORKING', 'ERROR', 'UNKNOWN']
    }
  },
  pumps: [PumpSchema]
}, {
  versionKey: false
});

module.exports = mongoose.model('SystemStatus', SystemStatusSchema);