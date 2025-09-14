const express = require('express');
const router = express.Router();
const EquipmentController = require('../controllers/equipmentController');

// Tüm donanımları getir
router.get('/', EquipmentController.getAll);

// ID'ye göre donanım getir
router.get('/:id', EquipmentController.getById);

// Kategoriye göre donanımları getir
router.get('/category/:category', EquipmentController.getByCategory);

// Duruma göre donanımları getir
router.get('/status/:status', EquipmentController.getByStatus);

// Müsait donanımları getir
router.get('/available/list', EquipmentController.getAvailable);

// Yeni donanım oluştur
router.post('/', EquipmentController.create);

// Donanım güncelle
router.put('/:id', EquipmentController.update);

// Donanım sil
router.delete('/:id', EquipmentController.delete);

// Donanım durumunu güncelle
router.patch('/:id/status', EquipmentController.updateStatus);

// Donanım aksesuarlarını getir
router.get('/:id/accessories', EquipmentController.getAccessories);

// Donanıma aksesuar ekle
router.post('/:id/accessories', EquipmentController.addAccessory);

// Toplu aksesuar ekle
router.post('/:id/accessories/bulk', EquipmentController.addAccessoriesBulk);

// Kategori istatistiklerini getir
router.get('/stats/categories', EquipmentController.getCategoryStats);

// Durum istatistiklerini getir
router.get('/stats/statuses', EquipmentController.getStatusStats);

module.exports = router;