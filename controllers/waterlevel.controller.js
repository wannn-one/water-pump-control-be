const WaterLevel = require('../models/waterlevel.model');

/* 
    Log Water Level
    POST /api/waterlevel    
*/
exports.logWaterLevel = async (req, res) => {
    try {
        const { level, status } = req.body;
        const waterLevel = new WaterLevel({ level, status });
        await waterLevel.save();
        res.status(201).json({ message: 'Water level logged successfully', data: waterLevel });
    } catch (error) {
        res.status(500).json({ message: 'Error logging water level', error });
    }
};

/* 
    Get Water Levels
    GET /api/waterlevel    
*/
exports.getWaterLevels = async (req, res) => {
    try {
        const levels = await WaterLevel.find().sort({ timestamp: -1 }); // Semua data
        res.status(200).json({ data: levels });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching water levels', error });
    }
};

/* 
    Get Latest Water Level
    GET /api/waterlevel/latest
*/
exports.getLatestWaterLevel = async (req, res) => {
    try {
        const latestLevel = await WaterLevel.findOne().sort({ timestamp: -1 }); // Data terakhir
        if (!latestLevel) return res.status(404).json({ message: 'No water level found' });
        res.status(200).json({ data: latestLevel });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching latest water level', error });
    }
};
