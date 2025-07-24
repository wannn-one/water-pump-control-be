const express = require('express');
const mongoose = require('mongoose');
const corsConfig = require('./config/cors');
require('dotenv').config();

const app = express();

app.use(corsConfig);
app.use(express.json());

const baseUrl = '/';

app.use(`${baseUrl}system`, require('./routes/systemStatus.route'));
app.use(`${baseUrl}pump`, require('./routes/pump.route'));
app.use(`${baseUrl}history`, require('./routes/levelHistory.route'));
app.use(`${baseUrl}logs`, require('./routes/actionLog.route'));

app.get(baseUrl, (req, res) => {
    res.json({ message: 'Welcome to watermonitor.site API' })
});

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});