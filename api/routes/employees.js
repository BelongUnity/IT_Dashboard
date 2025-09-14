const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');

// Tüm çalışanları getir
router.get('/', EmployeeController.getAll);

// ID'ye göre çalışan getir
router.get('/:id', EmployeeController.getById);

// Yeni çalışan oluştur
router.post('/', EmployeeController.create);

// Çalışan güncelle
router.put('/:id', EmployeeController.update);

// Çalışan sil
router.delete('/:id', EmployeeController.delete);

// Departman istatistiklerini getir
router.get('/stats/departments', EmployeeController.getDepartmentStats);

module.exports = router;