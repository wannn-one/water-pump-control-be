const PumpControl = require('../models/pumpcontrol.model');

/* 
    Get all pump data
    GET /api/pumpcontrol
*/
exports.getPumpData = async (req, res) => {
    try {
        const pumps = await PumpControl.find();
        res.status(200).json({ message: 'Pump data fetched successfully', data: pumps });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pump data', error });
    }
};

/* 
    Add Pump data
    POST /api/pumpcontrol/add
*/
exports.addPumpData = async (req, res) => {
    try {
        const pump = new PumpControl(req.body);
        await pump.save();
        res.status(201).json({ message: 'Pump data added successfully', data: pump });
    } catch (error) {
        res.status(500).json({ message: 'Error adding pump data', error });
    }
};


/* 
    Control Pump
    PUT /api/pumpcontrol/:id    
*/
exports.controlPump = async (req, res) => {
    try {
        const pump = await PumpControl.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!pump) return res.status(404).json({ message: 'Pump not found' });
        res.status(200).json({ message: 'Pump updated successfully', data: pump });
    } catch (error) {
        res.status(500).json({ message: 'Error updating pump', error });
    }
};

/* 
    Get Pump Status
    GET /api/pumpcontrol/status 
*/
exports.getPumpStatus = async (req, res) => {
    try {
        const lastStatus = await PumpControl.findOne().sort({ timestamp: -1 }); // Status terakhir
        if (!lastStatus) return res.status(404).json({ message: 'No pump status found' });
        res.status(200).json({ data: lastStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pump status', error });
    }
};

/* 
    Get Pump Logs 
    GET /api/pumpcontrol/logs
*/
exports.getPumpLogs = async (req, res) => {
    try {
        const logs = await PumpControl.find().sort({ timestamp: -1 }); // Semua riwayat
        res.status(200).json({ data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pump logs', error });
    }
};
