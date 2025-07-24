const ActionLog = require('../models/actionLog.model');
const { convertActionLogsToCsv } = require('../utils/csvUtils');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

/**
 * @desc    Mengambil data log aksi kontrol dengan sistem halaman (pagination).
 * @route   GET /logs/actions?page=1&limit=10
 * @access  Public
 */
const getPaginatedActionLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Default 10 item per halaman
        const skip = (page - 1) * limit;

        // Menghitung total dokumen untuk informasi halaman
        const total = await ActionLog.countDocuments();

        // Mengambil data log untuk halaman saat ini, diurutkan dari yang terbaru
        const logs = await ActionLog.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        res.status(200).json({
            success: true,
            count: logs.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total
            },
            data: logs
        });

    } catch (error) {
        console.error("Error saat mengambil log aksi:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Mengunduh seluruh data log aksi kontrol sebagai file CSV.
 * @route   GET /logs/actions/download/csv
 * @access  Public
 */
const exportActionLogsToCsv = async (req, res) => {
    try {
        // 1. Ambil semua data action logs dari database, urutkan dari yang terlama
        const allActionLogs = await ActionLog.find()
            .sort({ timestamp: 1 }); // Urutkan dari terlama ke terbaru untuk export

        // 2. Cek jika tidak ada data
        if (allActionLogs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tidak ada data log aksi untuk diekspor.'
            });
        }

        // 3. Buat nama file dengan timestamp saat ini
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        const fileName = `action-logs-${timestamp}.csv`;
        const filePath = path.join(__dirname, '..', 'temp', fileName);

        // 4. Pastikan direktori temp ada
        const tempDir = path.dirname(filePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 5. Konversi data ke CSV
        await convertActionLogsToCsv(allActionLogs, filePath);

        // 6. Set header untuk download file
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // 7. Stream file ke response
        const fileStream = fs.createReadStream(filePath);
        
        fileStream.pipe(res);

        // 8. Hapus file temporary setelah selesai dikirim
        fileStream.on('end', () => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting temporary file:', err);
                } else {
                    console.log(`Temporary file ${fileName} deleted successfully`);
                }
            });
        });

    } catch (error) {
        console.error('Error in exportActionLogsToCsv:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengekspor data log aksi ke CSV.', 
            error: error.message 
        });
    }
};

module.exports = {
    getPaginatedActionLogs,
    exportActionLogsToCsv
};