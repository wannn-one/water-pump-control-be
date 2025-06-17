const SystemStatus = require('../models/systemStatus.model');
const LevelHistory = require('../models/levelHistory.model');
const client = require('../config/mqtt');

const MQTT_COMMAND_TOPIC = 'system/ESP_CONTROLLER/command';

client.on('connect', () => {
    console.log('Connected to MQTT Broker for System');
});

/**
 * @desc    Mengambil status sistem terkini untuk ditampilkan di dasbor.
 * @route   GET /system/status
 * @access  Public
 */
const getCurrentStatus = async (req, res) => {
  try {
    // 1. Cari satu dokumen di koleksi SystemStatus berdasarkan ID uniknya.
    // Kita asumsikan hanya ada satu dokumen yang dikelola oleh ESP utama.
    const currentStatus = await SystemStatus.findOne({ systemId: 'ESP_CONTROLLER' });

    // 2. Jika dokumen tidak ditemukan (misalnya, database kosong), kirim error 404.
    if (!currentStatus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data status sistem tidak ditemukan. Harap jalankan seeder atau tunggu laporan pertama dari ESP.' 
      });
    }

    // 3. Jika dokumen ditemukan, kirim seluruh datanya sebagai response.
    res.status(200).json({
      success: true,
      data: currentStatus
    });

  } catch (error) {
    // Tangani jika ada error pada server atau database
    console.error('Error di getCurrentStatus:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
* @desc    Mengirim perintah untuk mengubah mode sistem (AUTO/MANUAL) via MQTT.
* @route   POST /system/mode
* @access  Private (seharusnya hanya bisa diakses oleh device ESP)
*/
const setSystemModeViaMqtt = async (req, res) => {
    try {
        const { mode } = req.body; // mode: 'AUTO' atau 'MANUAL'

        if (!['AUTO', 'MANUAL'].includes(mode)) {
            return res.status(400).json({ success: false, message: 'Invalid mode. Use "AUTO" or "MANUAL".' });
        }

        const payload = JSON.stringify({
            command: 'set_mode',
            mode: mode
        });

        client.publish(MQTT_COMMAND_TOPIC, payload, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to send MQTT command.' });
            }
            res.status(202).json({ success: true, message: `Command mode ${mode} has been sent.` });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    [UNTUK ESP] Memperbarui atau membuat status sistem dari data yang dikirim device.
 * @route   POST /system/status
 * @access  Private (seharusnya hanya bisa diakses oleh device ESP)
 */
const updateStatusFromDevice = async (req, res) => {
    try {
        // 1. Ambil seluruh data JSON dari body request yang dikirim ESP
        const systemData = req.body;

        // Cek jika body kosong
        if (Object.keys(systemData).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body tidak boleh kosong.' });
        }

        // 2. Cari dokumen berdasarkan systemId dan perbarui dengan data baru
        // Opsi `{ new: true, upsert: true }` sangat penting di sini.
        const updatedStatus = await SystemStatus.findOneAndUpdate(
            { systemId: 'ESP_CONTROLLER' }, // Filter: cari dokumen ini
            systemData,                         // Data baru untuk di-update
            {
                new: true,           // Kembalikan dokumen yang sudah ter-update
                upsert: true,        // Jika dokumen tidak ada, buat dokumen baru
                runValidators: true  // Jalankan validasi schema (misal: enum)
            }
        );

        if (updatedStatus && updatedStatus.tank && updatedStatus.tank.currentLevelCm !== undefined) {
            await LevelHistory.create({
                timestamp: updatedStatus.lastUpdate, // Gunakan waktu update yang sama
                level: updatedStatus.tank.currentLevelCm,
                systemId: updatedStatus.systemId
            });
        }

        // 3. Kirim response berhasil
        res.status(200).json({
            success: true,
            message: 'Status sistem berhasil diperbarui dari device.',
            data: updatedStatus
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getCurrentStatus,
    setSystemModeViaMqtt,
    updateStatusFromDevice
}