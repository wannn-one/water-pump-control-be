const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String, // ID unik perangkat (misalnya MAC address atau ID custom)
    required: true,
    unique: true,
  },
  name: {
    type: String, // Nama perangkat (misalnya: "Sensor Air Utama")
    required: true,
  },
  type: {
    type: String, // Jenis perangkat (misalnya: "ESP32", "PLC", "Sensor")
    enum: ['ESP32', 'PLC', 'Sensor', 'Other'],
    default: 'Other',
  },
  location: {
    type: String, // Lokasi pemasangan perangkat
    default: 'Unknown',
  },
  status: {
    type: String, // Status perangkat: Active, Inactive, Maintenance
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active',
  },
  lastOnline: {
    type: Date, // Waktu terakhir perangkat terhubung
    default: Date.now,
  },
});

module.exports = mongoose.model('Device', DeviceSchema);