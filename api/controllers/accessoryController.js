const Accessory = require('../models/Accessory');
const Equipment = require('../models/Equipment');
const { validateAccessory } = require('../services/validationService');
const { formatError, formatSuccess } = require('../utils/helpers');
const { MESSAGES, HTTP_STATUS } = require('../utils/constants');

class AccessoryController {
    /**
     * ID'ye göre aksesuar getir
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const accessory = await Accessory.getById(id);
            
            if (!accessory) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, accessory));
        } catch (error) {
            console.error('Aksesuar getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Aksesuar güncelle
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const accessoryData = req.body;
            
            // Önce aksesuarı getir
            const accessory = await Accessory.getById(id);
            if (!accessory) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            // Donanım bilgisini al
            const equipment = await Equipment.getById(accessory.equipment_id);
            if (!equipment) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            // Validasyon
            const validation = validateAccessory(accessoryData, equipment.category);
            if (!validation.isValid) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
            }
            
            const updatedAccessory = await Accessory.update(id, accessoryData);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.UPDATED, updatedAccessory));
        } catch (error) {
            console.error('Aksesuar güncelleme hatası:', error);
            if (error.message === 'Aksesuar bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Aksesuar sil
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await Accessory.delete(id);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.DELETED));
        } catch (error) {
            console.error('Aksesuar silme hatası:', error);
            if (error.message === 'Aksesuar bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Aksesuar türü istatistiklerini getir
     */
    static async getTypeStats(req, res) {
        try {
            const stats = await Accessory.getTypeStats();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, stats));
        } catch (error) {
            console.error('Aksesuar türü istatistikleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }
}

module.exports = AccessoryController;