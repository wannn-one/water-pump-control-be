const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/device', require('./routes/device.route'));
app.use('/api/pumpcontrol', require('./routes/pumpcontrol.route'));
app.use('/api/waterlevel', require('./routes/waterlevel.route'));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to IoT API' });
});

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});