const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const baseUrl = '/api';

app.use(`${baseUrl}/device`, require('./routes/device.route'));
app.use(`${baseUrl}/pumpcontrol`, require('./routes/pump.route'));
app.use(`${baseUrl}/waterlevel`, require('./routes/sensor.route'));

app.get(baseUrl, (req, res) => {
    res.json({ message: 'Welcome to Pump Monitoring API' })
});

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});