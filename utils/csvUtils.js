const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');

/**
 * Mengkonversi array data histori level air ke format CSV
 * @param {Array} data - Array data histori dari database
 * @param {String} filePath - Path file output CSV
 * @returns {Promise} - Promise yang mengembalikan path file CSV
 */
const convertToCsv = async (data, filePath) => {
  try {
    // Definisikan header untuk file CSV
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'formattedDate', title: 'Tanggal' },
        { id: 'formattedTime', title: 'Waktu' },
        { id: 'level', title: 'Level (cm)' },
        { id: 'systemId', title: 'System ID' },
        { id: 'tankId', title: 'Tank ID' }
      ]
    });

    // Format data untuk CSV dengan menambahkan kolom tanggal dan waktu yang terformat
    const formattedData = data.map(item => ({
      timestamp: item.timestamp,
      formattedDate: moment(item.timestamp).format('DD/MM/YYYY'),
      formattedTime: moment(item.timestamp).format('HH:mm:ss'),
      level: item.level,
      systemId: item.systemId,
      tankId: item.tankId
    }));

    // Tulis data ke file CSV
    await csvWriter.writeRecords(formattedData);
    
    return filePath;
  } catch (error) {
    throw new Error(`Error converting to CSV: ${error.message}`);
  }
};

module.exports = {
  convertToCsv
}; 