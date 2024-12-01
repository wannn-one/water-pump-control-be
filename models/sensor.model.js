const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  sensorId: {
    type: String, // ID unik untuk sensor
    required: true,
    unique: true,
  },
  associatedDevice: {
    type: String,
    ref: 'Device',
    required: true,
  },
  rangeMin: {
    type: Number, // Rentang minimal pembacaan sensor (cm)
    default: 1,
  },
  rangeMax: {
    type: Number, // Rentang maksimal pembacaan sensor (cm)
    default: 67.5,
  },
  sensorType: {
    type: String, // Jenis sensor yang digunakan
    default: 'Ultrasonic',
  },
  lastReading: {
    type: Number, // Nilai terakhir yang dibaca oleh sensor
    default: null,
  },
  sensorCondition: {
    type: String, // Kondisi sensor (NORMAL, SIAGA, BAHAYA)
    enum: ['NORMAL', 'SIAGA', 'BAHAYA'], 
    default: 'NORMAL',
  },
  lastUpdated: {
    type: Date, // Waktu pembacaan terakhir diperbarui
    default: Date.now,
  },
});

module.exports = mongoose.model('Sensor', SensorSchema);
