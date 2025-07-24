// File: models/ActionLog.model.js
const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  source: { // Siapa/apa yang melakukan aksi
    type: String,
    required: true,
    enum: ['USER_DASHBOARD', 'SYSTEM_AUTO'] 
  },
  actionType: { // Jenis aksi yang dilakukan
    type: String,
    required: true,
    enum: ['PUMP_STATUS_CHANGE', 'SYSTEM_MODE_CHANGE']
  },
  details: { // Detail dari aksi tersebut
    type: Object,
    required: true
  }
}, { versionKey: false });

module.exports = mongoose.model('ActionLog', ActionLogSchema);