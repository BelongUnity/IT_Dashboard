const express = require('express');
const router = express.Router();
const HistoryController = require('../controllers/historyController');

// Sistem audit log'larını getir
router.get('/system', HistoryController.getSystemHistory);

// Belirli bir tablo için audit log'ları getir
router.get('/table/:table', HistoryController.getTableHistory);

// Tarih aralığına göre audit log'ları getir
router.get('/date-range', HistoryController.getHistoryByDateRange);

// İşlem türüne göre audit log'ları getir
router.get('/action/:action', HistoryController.getHistoryByAction);

// Donanım geçmişini getir
router.get('/equipment/:id', HistoryController.getEquipmentHistory);

// Çalışan geçmişini getir
router.get('/employee/:id', HistoryController.getEmployeeHistory);

// Audit log istatistiklerini getir
router.get('/stats/audit', HistoryController.getAuditStats);

// Tablo istatistiklerini getir
router.get('/stats/tables', HistoryController.getTableStats);

// Eski audit log'ları temizle
router.delete('/cleanup', HistoryController.cleanOldLogs);

module.exports = router;