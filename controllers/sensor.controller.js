const mqtt = require('mqtt');
const Sensor = require('../models/sensor.model');
const DeviceLog = require('../models/devicelog.model');
const SensorHistory = require('../models/sensorhistory.model');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

// MQTT Client Configuration
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT;
const client = mqtt.connect(`mqtt://${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`);

// MQTT connection
client.on('connect', () => {
  console.log('Connected to MQTT Broker for Sensor at ' + MQTT_BROKER_URL + ':' + MQTT_BROKER_PORT);
});

// Fungsi untuk mengirimkan command kontrol ke perangkat via MQTT
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

// Fungsi untuk menyimpan perubahan ke history
async function storeHistory(sensorId, reading, condition) {
  try {
    await SensorHistory.create({ sensorId, reading, condition });
  } catch (error) {
    throw new Error(`Failed to store sensor history: ${error.message}`);
  }
}

// Fungsi untuk set range sensor
exports.setRange = async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const { rangeMin, rangeMax } = req.body;

    const sensor = await Sensor.findOne({ sensorId });
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

// Fungsi untuk update last reading sensor
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
    if (lastReading >= 1 && lastReading <= 15) {
      condition = 'NORMAL';
    } else if (lastReading >= 16 && lastReading <= 35) {
      condition = 'SIAGA';
    } else if (lastReading >= 36 && lastReading <= 55) {
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

    // Simpan riwayat sensor
    await storeHistory(sensorId, lastReading, condition);

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

// Fungsi untuk mengambil semua sensor
exports.getAllSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.status(200).json(sensors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil sensor berdasarkan ID
exports.getSensorById = async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const sensor = await Sensor.findOne({ sensorId });
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    
    res.status(200).json(sensor);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSensorsHistory = async (req, res) => {
  try {
    // Ambil parameter page dan limit dari query string
    const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
    // Konversi ke angka
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Hitung jumlah data yang dilewati (skip)
    const skip = (pageNumber - 1) * limitNumber;

    // Ambil data dari SensorHistory dengan pagination
    const histories = await SensorHistory.find( {sensorId: 'SENSOR-ESP32-05'} )
      .sort({ timestamp: -1 }) // Urutkan dari data terbaru
      .skip(skip) // Lewati data sebelumnya
      .limit(limitNumber); // Ambil sejumlah limit

    // Hitung total jumlah dokumen untuk menghitung total halaman
    const totalDocuments = await SensorHistory.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limitNumber);

    // Respon data dengan informasi pagination
    res.status(200).json({
      data: histories,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalDocuments,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.downloadAllSensorHistoriesAsCSV = async (req, res) => {
  try {
    // Ambil semua data history dari SensorHistory
    const histories = await SensorHistory.find();

    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: 'No sensor histories found' });
    }

    // Definisikan header CSV
    const csvWriter = createCsvWriter({
      path: 'sensor_histories.csv', // Nama file sementara
      header: [
        { id: 'sensorId', title: 'Sensor ID' },
        { id: 'reading', title: 'Reading' },
        { id: 'condition', title: 'Condition' },
        { id: 'lastUpdated', title: 'Last Updated' },
      ],
    });

    // Konversi data history ke format yang sesuai untuk CSV
    const data = histories.map(history => ({
      sensorId: history.sensorId,
      reading: history.reading,
      condition: history.condition,
      lastUpdated: history.lastUpdated ? history.lastUpdated.toISOString() : null,
    }));

    // Tulis data ke file CSV
    await csvWriter.writeRecords(data);

    // Kirim file CSV sebagai respons
    res.download('sensor_histories.csv', 'sensor_histories.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Failed to download CSV file' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
