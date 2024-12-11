const mongoose = require('mongoose');

const SensorHistorySchema = new mongoose.Schema({
    sensorId: {
        type: String, // ID sensor yang terkait
        required: true,
    },
    reading: {
        type: Number, // Nilai pembacaan sensor
        required: true,
    },
    condition: {
        type: String, // Kondisi sensor (NORMAL, SIAGA, BAHAYA)
        enum: ['NORMAL', 'SIAGA', 'BAHAYA'],
        required: true,
    },
    lastUpdated: {
        type: Date, // Waktu pembacaan terakhir diperbarui
        default: Date.now,
    },
});

module.exports = mongoose.model('SensorHistory', SensorHistorySchema);