const LevelHistory = require('../models/levelHistory.model');

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


module.exports = {
  getHistoryData,
  getPaginatedHistory
};