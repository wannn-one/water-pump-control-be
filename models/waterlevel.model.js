const mongoose = require('mongoose');

const WaterLevelSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['NORMAL', 'SIAGA', 'BANJIR', 'INVALID_DATA']   
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    rawAnalogValue: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('WaterLevel', WaterLevelSchema);