const mongoose = require('mongoose');

const PumpSchema = new mongoose.Schema({
  pumpId: {
    type: String, // ID unik untuk pompa
    required: true,
    unique: true,
  },
  associatedDevice: {
    type: String,
    ref: 'Device',
    required: true,
  },
  relayPin: {
    type: Number, // Pin relay di perangkat PLC yang mengontrol pompa ini
    default: null
  },
  status: {
    type: String, // Status pompa: ON atau OFF
    enum: ['ON', 'OFF'],
    default: 'OFF',
  },
  controlMode: {
    type: String, // Mode kontrol: Manual atau Automatic
    enum: ['MANUAL', 'AUTOMATIC'],
    default: 'MANUAL',
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

module.exports = mongoose.model('Pump', PumpSchema);