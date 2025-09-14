const express = require('express');
const router = express.Router();
const LogController = require('../controllers/logController');

// Sistem loglarını getir
router.get('/', LogController.getSystemLogs);

// Log istatistiklerini getir
router.get('/statistics', LogController.getLogStatistics);

// Logları dışa aktar
router.get('/export', LogController.exportLogs);

module.exports = router;