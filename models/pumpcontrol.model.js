const mongoose = require('mongoose');

const PumpControlSchema = new mongoose.Schema({
  pumpId: {
    type: String, // ID pompa (unik)
    required: true,
    unique: true,
  },
  status: {
    type: String, // Status pompa: ON atau OFF
    enum: ['ON', 'OFF'],
    default: 'OFF',
  },
  mode: {
    type: String, // Mode operasi: Automatic atau Manual
    enum: ['Automatic', 'Manual'],
    default: 'Automatic',
  },
  lastAction: {
    type: String, // Aksi terakhir: TURN_ON, TURN_OFF
    enum: ['TURN_ON', 'TURN_OFF'],
    default: 'TURN_OFF',
  },
  lastUpdated: {
    type: Date, // Waktu status terakhir diperbarui
    default: Date.now,
  },
});

module.exports = mongoose.model('PumpControl', PumpControlSchema);