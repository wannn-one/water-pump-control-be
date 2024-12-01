const mqtt = require('mqtt');
const Pump = require('../models/pump.model');
const DeviceLog = require('../models/devicelog.model');
require('dotenv').config();

// MQTT Client Configuration
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT;
const client = mqtt.connect(`mqtt://${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`);

client.on('connect', () => {
  console.log('Connected to MQTT Broker for Pump at ' + MQTT_BROKER_URL + ':' + MQTT_BROKER_PORT);
});

// Fungsi untuk mengirim perintah ke ESP32 menggunakan MQTT
async function sendControlCommand(deviceId, action) {
  try {
    const topic = `water/${deviceId}/control`;  // Setiap ESP32 bisa menggunakan topic berbeda berdasarkan deviceId
    const message = JSON.stringify({ action });

    // Mengirim pesan ke broker MQTT
    client.publish(topic, message, (err) => {
      if (err) {
        throw new Error('Failed to send control message');
      }
    });
  } catch (error) {
    throw new Error(`Failed to send control command via MQTT: ${error.message}`);
  }
}

// Fungsi untuk menyalakan/mematikan pompa
exports.togglePump = async (req, res) => {
  try {
    const { action } = req.body;
    const pumpId = req.params.pumpId;
    
    if (!['ON', 'OFF'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "ON" or "OFF"' });
    }

    const pump = await Pump.findOne({ pumpId });
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }

    // Kirim perintah ke ESP32 menggunakan MQTT
    await sendControlCommand(pump.associatedDevice, action);

    // Update status pompa di database
    pump.status = action;
    pump.lastAction = action === 'ON' ? 'TURN_ON' : 'TURN_OFF';
    pump.lastUpdated = Date.now();
    await pump.save();

    // Log aksi yang dilakukan
    await DeviceLog.create({
      deviceId: pumpId,
      action: pump.lastAction,
      status: pump.status,
      timestamp: pump.lastUpdated
    });

    res.status(200).json({ message: `Pump ${action} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengubah mode pompa (Manual / Automatic)
exports.setPumpMode = async (req, res) => {
  try {
    const { mode } = req.body;  // mode: 'Manual' or 'Automatic'
    const pumpId = req.params.pumpId;

    if (!['MANUAL', 'AUTOMATIC'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode. Use "MANUAL" or "AUTOMATIC"' });
    }

    const pump = await Pump.findOne({ pumpId });
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }

    // Kirim perintah ke ESP32 menggunakan MQTT
    await sendControlCommand(pump.associatedDevice, mode);

    pump.controlMode = mode;
    pump.lastUpdated = Date.now();
    await pump.save();

    await DeviceLog.create({
      deviceId: pumpId,
      action: 'SET_MODE_TO_' + mode,
      status: pump.status,
      timestamp: pump.lastUpdated
    });

    res.status(200).json({ message: `Pump mode set to ${mode} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil riwayat log pompa
exports.getPumpHistory = async (req, res) => {
  try {
    const pumpId = req.params.pumpId;

    // Ambil riwayat log dari DeviceLog
    const logs = await DeviceLog.find({ deviceId: pumpId }).sort({ timestamp: -1 });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No history found for this pump' });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPumps = async (req, res) => {
  try {
    const pumps = await Pump.find();
    res.status(200).json(pumps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getPumpById = async (req, res) => {
  try {
    const pumpId = req.params.pumpId;
    const pump = await Pump.findOne({ pumpId });
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }
    res.status(200).json(pump);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.setRelayPin = async (req, res) => {
  try {
    const { relayPin } = req.body;
    const pumpId = req.params.pumpId;

    const pump = await Pump.findOne({
      pumpId
    });

    if (!pump) {
      return res.status(404).json({
        message: 'Pump not found'
      });
    }

    pump.relayPin = relayPin;
    await pump.save();

    res.status(200).json({ message: `Edited relay pin to ${relayPin} for pump ${pumpId}` });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}