const Device = require('../models/device.model');

/*
    Register Device
    POST /api/devices
*/
exports.registerDevice = async (req, res) => {
    try {
        const device = new Device(req.body);
        await device.save();
        res.status(201).json({ message: 'Device registered successfully', data: device });
    } catch (error) {
        res.status(500).json({ message: 'Error registering device', error });
    }
};

/*
    Get All Device
    GET /api/devices
*/
exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find();
        res.status(200).json({ message: "Devices fetched successfully", data: devices });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching devices', error });
    }
};

/* 
    Get Device by ID
    GET /api/devices/:id
*/

exports.getDeviceById = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.status(200).json({ data: device });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device', error });
    }
};

/* 
    Update Device 
    PUT /api/devices/:id
*/
exports.updateDevice = async (req, res) => {
    try {
        const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.status(200).json({ message: 'Device updated successfully', data: device });
    } catch (error) {
        res.status(500).json({ message: 'Error updating device', error });
    }
};

/* 
    Delete Device
    DELETE /api/devices/:id    
*/
exports.deleteDevice = async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting device', error });
    }
};
