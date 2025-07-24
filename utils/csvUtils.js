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

/**
 * Mengkonversi array data action logs ke format CSV
 * @param {Array} data - Array data action logs dari database
 * @param {String} filePath - Path file output CSV
 * @returns {Promise} - Promise yang mengembalikan path file CSV
 */
const convertActionLogsToCsv = async (data, filePath) => {
  try {
    // Definisikan header untuk file CSV Action Logs
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'formattedDate', title: 'Tanggal' },
        { id: 'formattedTime', title: 'Waktu' },
        { id: 'source', title: 'Sumber' },
        { id: 'actionType', title: 'Jenis Aksi' },
        { id: 'detailsText', title: 'Detail Aksi' },
        { id: 'pumpId', title: 'ID Pompa' },
        { id: 'pumpStatus', title: 'Status Pompa' },
        { id: 'systemMode', title: 'Mode Sistem' }
      ]
    });

    // Format data untuk CSV dengan parsing details object
    const formattedData = data.map(item => {
      // Parse details object berdasarkan actionType
      let detailsText = '';
      let pumpId = '';
      let pumpStatus = '';
      let systemMode = '';

      if (item.actionType === 'PUMP_STATUS_CHANGE' && item.details) {
        pumpId = item.details.pumpId || '';
        pumpStatus = item.details.status || '';
        detailsText = `Pompa ${pumpId} diubah ke ${pumpStatus}`;
      } else if (item.actionType === 'SYSTEM_MODE_CHANGE' && item.details) {
        systemMode = item.details.newMode || '';
        detailsText = `Mode sistem diubah ke ${systemMode}`;
      } else {
        detailsText = JSON.stringify(item.details || {});
      }

      return {
        timestamp: item.timestamp,
        formattedDate: moment(item.timestamp).format('DD/MM/YYYY'),
        formattedTime: moment(item.timestamp).format('HH:mm:ss'),
        source: item.source,
        actionType: item.actionType,
        detailsText: detailsText,
        pumpId: pumpId,
        pumpStatus: pumpStatus,
        systemMode: systemMode
      };
    });

    // Tulis data ke file CSV
    await csvWriter.writeRecords(formattedData);
    
    return filePath;
  } catch (error) {
    throw new Error(`Error converting action logs to CSV: ${error.message}`);
  }
};

module.exports = {
  convertToCsv,
  convertActionLogsToCsv
}; 