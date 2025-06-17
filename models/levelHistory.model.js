const mongoose = require('mongoose');

const LevelHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  level: {
    type: Number,
    required: [true, 'Level reading in cm is required.']
  },
  systemId: {
    type: String,
    required: true,
    index: true
  },
  tankId: {
    type: String,
    required: true,
    default: 'TK-001'
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'systemId',
    granularity: 'seconds'
  },
  versionKey: false,
  timestamps: false
});

module.exports = mongoose.model('LevelHistory', LevelHistorySchema);