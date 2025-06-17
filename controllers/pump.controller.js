const SystemStatus = require('../models/systemStatus.model');
const client = require('../config/mqtt');
require('dotenv').config();

const MQTT_COMMAND_TOPIC = 'pump/ESP_CONTROLLER/command';

client.on('connect', () => {
    console.log('Connected to MQTT Broker for Pump');
});

/**
 * @desc    Mengambil status dari semua pompa.
 * @route   GET /pump/status
 */
const getAllPumpsStatus = async (req, res) => {
    try {
        const system = await SystemStatus.findOne({ systemId: 'ESP_CONTROLLER' }, 'pumps');

        if (!system) {
            return res.status(404).json({ success: false, message: 'Pump data not found.' });
        }

        res.status(200).json({ success: true, data: system.pumps });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Mengirim perintah ON/OFF ke satu pompa via MQTT.
 * @route   PATCH /pump/:pumpId
 */
const setPumpStatusViaMqtt = async (req, res) => {
    try {
        const { pumpId } = req.params;
        const { status } = req.body; // status: 'ON' atau 'OFF'

        if (!['ON', 'OFF'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        // Buat payload perintah dalam format JSON
        const payload = JSON.stringify({
            command: 'set_pump',
            pumpId: pumpId,
            status: status,
        });

        // Publish pesan ke broker MQTT
        client.publish(MQTT_COMMAND_TOPIC, payload, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to send MQTT command.' });
            }

            res.status(202).json({
                success: true,
                message: `Command for pump ${pumpId} has been sent via MQTT.`
            });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAllPumpsStatus,
    setPumpStatusViaMqtt
};