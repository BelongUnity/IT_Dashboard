const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/assignmentController');

// Tüm zimmet atamalarını getir
router.get('/', AssignmentController.getAll);

// ID'ye göre zimmet getir
router.get('/:id', AssignmentController.getById);

// Aktif zimmetleri getir
router.get('/active/list', AssignmentController.getActive);

// Çalışanın zimmetlerini getir
router.get('/employee/:id', AssignmentController.getByEmployee);

// Donanımın zimmetlerini getir
router.get('/equipment/:id', AssignmentController.getByEquipment);

// Yeni zimmet ata
router.post('/', AssignmentController.create);

// Zimmet iade et
router.post('/:id/return', AssignmentController.return);

// Zimmet güncelle
router.put('/:id', AssignmentController.update);

// Zimmet istatistiklerini getir
router.get('/stats/overview', AssignmentController.getStats);

module.exports = router;