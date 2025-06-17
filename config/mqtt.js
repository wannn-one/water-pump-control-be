const mqtt = require('mqtt');
require('dotenv').config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT;
const client = mqtt.connect(`mqtt://${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`);

client.on('connect', () => {
    console.log(`Connected to MQTT broker at ${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`);
});

client.on('error', (err) => {
    console.error('MQTT connection error:', err);
});

module.exports = client;