const express = require('express');
const router = express.Router();
const systemStatusController = require('../controllers/systemStatus.controller');

router.route('/status')
    .get(systemStatusController.getCurrentStatus)
    .post(systemStatusController.updateStatusFromDevice);

router.route('/mode')
    .post(systemStatusController.setSystemModeViaMqtt);



module.exports = router;