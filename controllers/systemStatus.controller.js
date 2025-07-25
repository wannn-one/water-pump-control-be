const SystemStatus = require('../models/systemStatus.model');
const LevelHistory = require('../models/levelHistory.model');
const client = require('../config/mqtt');
const ActionLog = require('../models/actionLog.model');

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

        // 2. Ambil status lama untuk perbandingan
        const oldStatus = await SystemStatus.findOne({ systemId: 'ESP_CONTROLLER' });

        // 3. Cari dokumen berdasarkan systemId dan perbarui dengan data baru
        const updatePayload = {
            $set: {
                ...systemData, // Ambil semua data dari ESP (systemCondition, tank, pumps)
                lastUpdate: new Date() // TINDAS field lastUpdate dengan waktu server saat ini
            }
        };

        const updatedStatus = await SystemStatus.findOneAndUpdate(
            { systemId: 'ESP_CONTROLLER' }, // Filter
            updatePayload,                      // Gunakan payload yang sudah diperbarui
            { new: true, upsert: true, runValidators: true } // Opsi
        );

        // 4. Log perubahan mode sistem jika ada
        if (oldStatus && systemData.mode && oldStatus.mode !== systemData.mode) {
            await ActionLog.create({
                source: 'SYSTEM_AUTO', // Atau 'USER_DASHBOARD' jika dari dashboard
                actionType: 'SYSTEM_MODE_CHANGE',
                details: { 
                    oldMode: oldStatus.mode,
                    newMode: systemData.mode 
                }
            });
        }

        // 5. Log perubahan status pompa jika ada
        if (oldStatus && systemData.pumps && oldStatus.pumps) {
            for (const newPump of systemData.pumps) {
                const oldPump = oldStatus.pumps.find(p => p.pumpId === newPump.pumpId);
                if (oldPump && oldPump.status !== newPump.status) {
                    await ActionLog.create({
                        source: 'SYSTEM_AUTO',
                        actionType: 'PUMP_STATUS_CHANGE',
                        details: { 
                            pumpId: newPump.pumpId,
                            oldStatus: oldPump.status,
                            status: newPump.status 
                        }
                    });
                }
            }
        }

        // 6. Simpan level history
        if (updatedStatus && updatedStatus.tank && updatedStatus.tank.currentLevelCm !== undefined) {
            await LevelHistory.create({
                timestamp: updatedStatus.lastUpdate, 
                level: updatedStatus.tank.currentLevelCm,
                systemId: updatedStatus.systemId,
                tankId: updatedStatus.tank.tankId
            });
        }

        // 7. Kirim response berhasil
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
