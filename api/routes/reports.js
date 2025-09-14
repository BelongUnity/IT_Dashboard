const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Raporlama endpoint'leri
router.get('/employees', reportController.getEmployeesReport);
router.get('/equipment', reportController.getEquipmentReport);
router.get('/assignments', reportController.getAssignmentsReport);

module.exports = router;