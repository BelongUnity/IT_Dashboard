const express = require('express');
const router = express.Router();
const AccessoryController = require('../controllers/accessoryController');

// ID'ye göre aksesuar getir
router.get('/:id', AccessoryController.getById);

// Aksesuar güncelle
router.put('/:id', AccessoryController.update);

// Aksesuar sil
router.delete('/:id', AccessoryController.delete);

// Aksesuar türü istatistiklerini getir
router.get('/stats/types', AccessoryController.getTypeStats);

module.exports = router;