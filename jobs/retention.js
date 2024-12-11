const cron = require('node-cron');
const moment = require('moment');
const SensorHistory = require('../models/sensorhistory.model');

// Fungsi untuk auto-retensi data lebih dari 3 hari
async function autoRetention() {
  try {
    const threeDaysAgo = moment().subtract(3, 'days').toDate();

    // Menghapus riwayat sensor yang lebih dari 3 hari
    await SensorHistory.deleteMany({
      timestamp: { $lt: threeDaysAgo }
    });

    console.log('Old sensor history data removed.');
  } catch (error) {
    console.error('Error during retention: ', error.message);
  }
}

// Menjadwalkan retensi otomatis setiap hari pada jam 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Running retention process...');
  await autoRetention();
});
