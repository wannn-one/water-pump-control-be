const mongoose = require('mongoose');

const DeviceLogSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    ref: 'Device',
    required: true,
  },
  action: {
    type: String, // Tindakan yang dilakukan (misalnya: "Pump ON", "Sensor OFF", dsb.)
    required: true,
  },
  details: {
    type: Object, // Detail tambahan tentang tindakan (misalnya, ID pompa atau sensor)
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now, // Waktu tindakan dilakukan
  },
});

module.exports = mongoose.model('DeviceLog', DeviceLogSchema);
