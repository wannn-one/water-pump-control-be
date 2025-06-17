const express = require('express');
const router = express.Router();
const pumpController = require('../controllers/pump.controller');

router.get('/status', pumpController.getAllPumpsStatus);
router.patch('/:pumpId', pumpController.setPumpStatusViaMqtt);

module.exports = router;