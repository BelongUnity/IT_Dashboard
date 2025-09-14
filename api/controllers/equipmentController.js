const Equipment = require('../models/Equipment');
const Accessory = require('../models/Accessory');
const { validateEquipment, validateAccessory, isSerialNumberUnique } = require('../services/validationService');
const { formatError, formatSuccess } = require('../utils/helpers');
const { MESSAGES, HTTP_STATUS } = require('../utils/constants');

class EquipmentController {
    /**
     * Tüm donanımları getir
     */
    static async getAll(req, res) {
        try {
            const equipment = await Equipment.getAll();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, equipment));
        } catch (error) {
            console.error('Donanım listesi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * ID'ye göre donanım getir
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const equipment = await Equipment.getById(id);
            
            if (!equipment) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, equipment));
        } catch (error) {
            console.error('Donanım getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Kategoriye göre donanımları getir
     */
    static async getByCategory(req, res) {
        try {
            const { category } = req.params;
            const equipment = await Equipment.getByCategory(category);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, equipment));
        } catch (error) {
            console.error('Kategori donanımları getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Duruma göre donanımları getir
     */
    static async getByStatus(req, res) {
        try {
            const { status } = req.params;
            const equipment = await Equipment.getByStatus(status);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, equipment));
        } catch (error) {
            console.error('Durum donanımları getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Müsait donanımları getir
     */
    static async getAvailable(req, res) {
        try {
            const equipment = await Equipment.getAvailable();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, equipment));
        } catch (error) {
            console.error('Müsait donanımlar getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Yeni donanım oluştur
     */
    static async create(req, res) {
        try {
            const equipmentData = req.body;
            
            // Detaylı log
            console.log(`[${new Date().toISOString()}] DONANIM EKLEME İSTEĞİ:`);
            console.log('  - IP:', req.realIP || req.ip || req.connection.remoteAddress);
            console.log('  - User-Agent:', req.get('User-Agent'));
            console.log('  - Gelen veri:', JSON.stringify(equipmentData, null, 2));
            
            // Validasyon
            const validation = validateEquipment(equipmentData);
            if (!validation.isValid) {
                console.log('  ❌ VALİDASYON HATALARI:', validation.errors);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
            }
            
            // Seri numarası kontrolü - uyarı ver ama engelleme
            if (equipmentData.serial_number) {
                const existingEquipment = await Equipment.getBySerialNumber(equipmentData.serial_number);
                if (existingEquipment) {
                    console.log('  ⚠️ UYARI: AYNI SERİ NUMARALI DONANIM MEVCUT!');
                    console.log('  - Mevcut donanım ID:', existingEquipment.id);
                    console.log('  - Mevcut donanım:', existingEquipment.category, existingEquipment.brand, existingEquipment.model);
                    console.log('  - Yeni donanım:', equipmentData.category, equipmentData.brand, equipmentData.model);
                    console.log('  - Seri numarası:', equipmentData.serial_number);
                    console.log('  - Bu durum loglanmıştır ve donanım kaydedilecektir.');
                }
            }
            
            const equipment = await Equipment.create(equipmentData);
            console.log('  ✅ DONANIM BAŞARIYLA OLUŞTURULDU - ID:', equipment.id);
            console.log('  - Kategori:', equipment.category);
            console.log('  - Marka/Model:', equipment.brand, equipment.model);
            console.log('  - Seri No:', equipment.serial_number);
            
            // Eğer aynı seri numarası varsa uyarı mesajı ekle
            let message = MESSAGES.SUCCESS.CREATED;
            if (equipmentData.serial_number) {
                const existingEquipment = await Equipment.getBySerialNumber(equipmentData.serial_number);
                if (existingEquipment && existingEquipment.id !== equipment.id) {
                    message = `Donanım başarıyla oluşturuldu. UYARI: Bu seri numarası (${equipmentData.serial_number}) başka bir donanımda da kullanılıyor!`;
                }
            }
            
            res.status(HTTP_STATUS.CREATED).json(formatSuccess(message, equipment));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ DONANIM OLUŞTURMA HATASI:`, error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Donanım güncelle
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const equipmentData = req.body;
            
            // Validasyon
            const validation = validateEquipment(equipmentData);
            if (!validation.isValid) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
            }
            
            // Seri numarası benzersizlik kontrolü
            if (equipmentData.serial_number) {
                const isUnique = await isSerialNumberUnique(equipmentData.serial_number, id);
                if (!isUnique) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.DUPLICATE_SERIAL));
                }
            }
            
            // Donanımı güncelle
            const equipment = await Equipment.update(id, equipmentData);
            
            // Aksesuarları işle (eğer gönderilmişse)
            if (equipmentData.accessories && Array.isArray(equipmentData.accessories)) {
                // Önce mevcut aksesuarları sil
                await Accessory.deleteByEquipment(id);
                
                // Yeni aksesuarları ekle
                if (equipmentData.accessories.length > 0) {
                    await Accessory.createBulk(id, equipmentData.accessories);
                }
            }
            
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.UPDATED, equipment));
        } catch (error) {
            console.error('Donanım güncelleme hatası:', error);
            if (error.message === 'Donanım bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Donanım sil
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            // Detaylı log
            console.log(`[${new Date().toISOString()}] DONANIM SİLME İSTEĞİ:`);
            console.log('  - IP:', req.realIP || req.ip || req.connection.remoteAddress);
            console.log('  - User-Agent:', req.get('User-Agent'));
            console.log('  - Donanım ID:', id);
            
            // Önce donanımın var olup olmadığını kontrol et
            const equipment = await Equipment.getById(id);
            if (!equipment) {
                console.log('  ❌ DONANIM BULUNAMADI - ID:', id);
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            // Donanımın aktif zimmeti var mı kontrol et
            const Assignment = require('../models/Assignment');
            const activeAssignments = await Assignment.getByEquipment(id);
            const hasActiveAssignment = activeAssignments.some(assignment => !assignment.returned_date);
            
            if (hasActiveAssignment) {
                console.log('  ❌ DONANIM SİLİNEMEZ - AKTİF ZİMMET VAR');
                console.log('  - Donanım:', equipment.category, equipment.brand, equipment.model);
                console.log('  - Aktif zimmet sayısı:', activeAssignments.filter(a => !a.returned_date).length);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Bu donanım aktif zimmet altında olduğu için silinemez. Önce zimmeti iade edin.'));
            }
            
            await Equipment.delete(id);
            console.log('  ✅ DONANIM BAŞARIYLA SİLİNDİ - ID:', id);
            console.log('  - Donanım:', equipment.category, equipment.brand, equipment.model);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.DELETED));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ DONANIM SİLME HATASI:`, error);
            if (error.message === 'Donanım bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Donanım durumunu güncelle
     */
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const equipment = await Equipment.updateStatus(id, status);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.UPDATED, equipment));
        } catch (error) {
            console.error('Donanım durumu güncelleme hatası:', error);
            if (error.message === 'Donanım bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Donanım aksesuarlarını getir
     */
    static async getAccessories(req, res) {
        try {
            const { id } = req.params;
            const accessories = await Accessory.getByEquipment(id);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, accessories));
        } catch (error) {
            console.error('Donanım aksesuarları getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Donanıma aksesuar ekle
     */
    static async addAccessory(req, res) {
        try {
            const { id } = req.params;
            const accessoryData = { ...req.body, equipment_id: id };
            
            // Donanımın var olup olmadığını kontrol et
            const equipment = await Equipment.getById(id);
            if (!equipment) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            // Validasyon
            const validation = validateAccessory(accessoryData, equipment.category);
            if (!validation.isValid) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
            }
            
            const accessory = await Accessory.create(accessoryData);
            res.status(HTTP_STATUS.CREATED).json(formatSuccess(MESSAGES.SUCCESS.CREATED, accessory));
        } catch (error) {
            console.error('Aksesuar ekleme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Toplu aksesuar ekle
     */
    static async addAccessoriesBulk(req, res) {
        try {
            const { id } = req.params;
            const { accessories } = req.body;
            
            // Donanımın var olup olmadığını kontrol et
            const equipment = await Equipment.getById(id);
            if (!equipment) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            // Her aksesuarı validate et
            for (const accessory of accessories) {
                const validation = validateAccessory(accessory, equipment.category);
                if (!validation.isValid) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
                }
            }
            
            const createdAccessories = await Accessory.createBulk(id, accessories);
            res.status(HTTP_STATUS.CREATED).json(formatSuccess(MESSAGES.SUCCESS.CREATED, createdAccessories));
        } catch (error) {
            console.error('Toplu aksesuar ekleme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Kategori istatistiklerini getir
     */
    static async getCategoryStats(req, res) {
        try {
            const stats = await Equipment.getCategoryStats();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, stats));
        } catch (error) {
            console.error('Kategori istatistikleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Durum istatistiklerini getir
     */
    static async getStatusStats(req, res) {
        try {
            const stats = await Equipment.getStatusStats();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, stats));
        } catch (error) {
            console.error('Durum istatistikleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }
}

module.exports = EquipmentController;