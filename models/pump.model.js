const mongoose = require('mongoose');

const PumpSchema = new mongoose.Schema({
    pumpId: {
        type: String,
        required: true,
        enum: ['P-001', 'P-002', 'P-003']
    },
    status: {
        type: String,
        required: true,
        enum: ['ON', 'OFF']
    }
}, { _id: false });

module.exports = PumpSchema;