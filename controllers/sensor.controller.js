const mqtt = require('mqtt');
const Sensor = require('../models/sensor.model');
const DeviceLog = require('../models/devicelog.model');
require('dotenv').config();

// MQTT Client Configuration
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT;
const client = mqtt.connect(`mqtt://${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`);

client.on('connect', () => {
  console.log('Connected to MQTT Broker for Sensor at ' + MQTT_BROKER_URL + ':' + MQTT_BROKER_PORT);
});

async function sendControlCommand(deviceId, rangeMax, rangeMin) {
  try {
    const topic = `water/${deviceId}/control`;
    const message = JSON.stringify({ rangeMin, rangeMax });

    client.publish(topic, message, (err) => {
      if (err) {
        throw new Error('Failed to send control message');
      }
    });
  } catch (error) {
    throw new Error(`Failed to send control command via MQTT: ${error.message}`);
  }
}

exports.setRange = async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const { rangeMin, rangeMax } = req.body;

    const sensor = await Sensor.findOne ({ sensorId });
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    await sendControlCommand(sensor.associatedDevice, rangeMax, rangeMin);

    sensor.rangeMin = rangeMin;
    sensor.rangeMax = rangeMax;
    await sensor.save();

    await DeviceLog.create({
      deviceId: sensorId,
      action: 'SET_RANGE',
      status: `Range set to ${rangeMin} - ${rangeMax}`,
    });

    res.status(200).json({ message: 'Range set successfully', sensor });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLastReading = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { lastReading } = req.body;

    if (lastReading === undefined) {
      return res.status(400).json({ message: 'lastReading is required' });
    }

    const sensor = await Sensor.findOne({ sensorId });
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    // Update lastReading dan lastUpdated
    sensor.lastReading = lastReading;
    sensor.lastUpdated = Date.now();

    // Klasifikasi kondisi sensor berdasarkan rentang yang diberikan
    let condition = 'TIDAK VALID';
    if (lastReading >= 1 && lastReading <= 22.5) {
      condition = 'NORMAL';
    } else if (lastReading >= 22.6 && lastReading <= 40) {
      condition = 'SIAGA';
    } else if (lastReading >= 41 && lastReading <= 67.5) {
      condition = 'BAHAYA';
    }

    // Simpan kondisi sensor
    sensor.sensorCondition = condition;
    await sensor.save();

    // Log aksi
    await DeviceLog.create({
      deviceId: sensorId,
      action: 'UPDATE_LAST_READING',
      status: `Last reading updated to ${lastReading} with condition ${condition}`,
      timestamp: Date.now(),
    });

    res.status(200).json({
      message: `Last reading and condition for sensor ${sensorId} updated successfully`,
      sensor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil riwayat log sensor
exports.getSensorHistory = async (req, res) => {
  try {
    const sensorId = req.params.sensorId;

    // Ambil riwayat log dari DeviceLog
    const logs = await DeviceLog.find({ deviceId: sensorId }).sort({ timestamp: -1 });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No history found for this sensor' });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
