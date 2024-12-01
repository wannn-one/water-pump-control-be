const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String, // ID unik perangkat (misalnya MAC address atau ID custom)
    required: true,
    unique: true,
  },
  type: {
    type: String, // Jenis perangkat
    enum: ['ESP_WATERLEVEL', 'ESP_PLC'], // Jenis perangkat utama
    required: true,
  },
  location: {
    type: String, // Lokasi pemasangan perangkat
    default: 'Unknown',
  },
  status: {
    type: String, // Status perangkat: Active, Inactive, Maintenance
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], // Pilihan status perangkat
    default: 'Active',
  },
  lastOnline: {
    type: Date, // Waktu terakhir perangkat terhubung
    default: Date.now,
  },
});

module.exports = mongoose.model('Device', DeviceSchema);
