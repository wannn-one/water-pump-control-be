const LevelHistory = require('../models/levelHistory.model');
const { convertToCsv } = require('../utils/csvUtils');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

/**
 * @desc    Mengambil data histori pembacaan level air.
 * @route   GET /history/graph?limit=60
 * @access  Public
 */
const getHistoryData = async (req, res) => {
  try {
    // Ambil parameter 'limit' dari query, default-nya 60 jika tidak ada.
    const limit = parseInt(req.query.limit) || 60;

    // Cari data di database:
    // 1. sort({ timestamp: -1 }): Urutkan dari yang terbaru ke terlama.
    // 2. limit(limit): Ambil sejumlah data sesuai limit.
    const history = await LevelHistory.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    // Data yang didapat terurut dari baru ke lama. 
    // Untuk grafik, biasanya butuh urutan lama ke baru, jadi kita balik array-nya.
    const chronologicalHistory = history.reverse();

    res.status(200).json({
      success: true,
      count: chronologicalHistory.length,
      data: chronologicalHistory
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    [UNTUK TABEL] Mengambil data histori dengan pagination.
 * @route   GET /history/table?page=1&limit=5
 */
const getPaginatedHistory = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5; // Default 5 item per halaman
      const skip = (page - 1) * limit; // Kalkulasi data yang akan dilewati

      // Cari total dokumen untuk menghitung total halaman
      const total = await LevelHistory.countDocuments();

      // Cari data untuk halaman saat ini, diurutkan dari yang terbaru
      const results = await LevelHistory.find()
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit);

      res.status(200).json({
          success: true,
          count: results.length,
          pagination: {
              currentPage: page,
              totalPages: Math.ceil(total / limit),
              totalRecords: total
          },
          data: results
      });

  } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Mengambil data histori untuk diexport ke excel dalam format csv
 * @route   GET /history/download/csv
 */
const exportHistoryToExcel = async (req, res) => {
  try {
    // 1. Ambil semua data histori dari database, urutkan dari yang terlama
    const allHistory = await LevelHistory.find()
      .sort({ timestamp: 1 }); // Urutkan dari terlama ke terbaru untuk export

    // 2. Cek jika tidak ada data
    if (allHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada data histori untuk diekspor.'
      });
    }

    // 3. Buat nama file dengan timestamp saat ini
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const fileName = `level-history-${timestamp}.csv`;
    const filePath = path.join(__dirname, '..', 'temp', fileName);

    // 4. Pastikan direktori temp ada
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 5. Konversi data ke CSV
    await convertToCsv(allHistory, filePath);

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
    console.error('Error in exportHistoryToExcel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengekspor data ke CSV.', 
      error: error.message 
    });
  }
};

module.exports = {
  getHistoryData,
  getPaginatedHistory,
  exportHistoryToExcel
};