const Assignment = require('../models/Assignment');
const Employee = require('../models/Employee');
const Equipment = require('../models/Equipment');
const { validateAssignment } = require('../services/validationService');
const { formatError, formatSuccess } = require('../utils/helpers');
const { MESSAGES, HTTP_STATUS } = require('../utils/constants');

class AssignmentController {
    /**
     * Tüm zimmet atamalarını getir
     */
    static async getAll(req, res) {
        try {
            const assignments = await Assignment.getAll();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, assignments));
        } catch (error) {
            console.error('Zimmet listesi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * ID'ye göre zimmet getir
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const assignment = await Assignment.getById(id);
            
            if (!assignment) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, assignment));
        } catch (error) {
            console.error('Zimmet getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Aktif zimmetleri getir
     */
    static async getActive(req, res) {
        try {
            const assignments = await Assignment.getActive();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, assignments));
        } catch (error) {
            console.error('Aktif zimmetler getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Çalışanın zimmetlerini getir
     */
    static async getByEmployee(req, res) {
        try {
            const { id } = req.params;
            const assignments = await Assignment.getByEmployee(id);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, assignments));
        } catch (error) {
            console.error('Çalışan zimmetleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Donanımın zimmetlerini getir
     */
    static async getByEquipment(req, res) {
        try {
            const { id } = req.params;
            const assignments = await Assignment.getByEquipment(id);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, assignments));
        } catch (error) {
            console.error('Donanım zimmetleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Yeni zimmet ata
     */
    static async create(req, res) {
        try {
            const assignmentData = req.body;
            
            // Detaylı log
            console.log(`[${new Date().toISOString()}] ZİMMET ATAMA İSTEĞİ:`);
            console.log('  - IP:', req.realIP || req.ip || req.connection.remoteAddress);
            console.log('  - User-Agent:', req.get('User-Agent'));
            console.log('  - Gelen veri:', JSON.stringify(assignmentData, null, 2));
            
            // Validasyon
            const validation = validateAssignment(assignmentData);
            if (!validation.isValid) {
                console.log('  ❌ VALİDASYON HATALARI:', validation.errors);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
            }
            
            // Çalışanın var olup olmadığını kontrol et
            const employee = await Employee.getById(assignmentData.employee_id);
            if (!employee) {
                console.log('  ❌ ÇALIŞAN BULUNAMADI - ID:', assignmentData.employee_id);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.EMPLOYEE_NOT_ACTIVE));
            }
            
            // Donanımın var olup olmadığını ve müsait olup olmadığını kontrol et
            const equipment = await Equipment.getById(assignmentData.equipment_id);
            if (!equipment) {
                console.log('  ❌ DONANIM BULUNAMADI - ID:', assignmentData.equipment_id);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            if (equipment.status !== 'available') {
                console.log('  ❌ DONANIM MÜSAİT DEĞİL - Durum:', equipment.status);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.EQUIPMENT_NOT_AVAILABLE));
            }
            
            // Donanımın aktif zimmeti var mı kontrol et
            const activeAssignments = await Assignment.getByEquipment(assignmentData.equipment_id);
            const hasActiveAssignment = activeAssignments.some(assignment => !assignment.returned_date);
            
            if (hasActiveAssignment) {
                console.log('  ❌ DONANIM ZATEN ATANMIŞ - Aktif zimmet mevcut');
                console.log('  - Donanım:', equipment.category, equipment.brand, equipment.model);
                console.log('  - Aktif zimmet sayısı:', activeAssignments.filter(a => !a.returned_date).length);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Bu donanım zaten başka bir çalışana atanmış. Önce mevcut zimmeti iade edin.'));
            }
            
            const assignment = await Assignment.create(assignmentData);
            console.log('  ✅ ZİMMET BAŞARIYLA ATANDI - ID:', assignment.id);
            console.log('  - Çalışan:', employee.name);
            console.log('  - Donanım:', equipment.category, equipment.brand, equipment.model);
            res.status(HTTP_STATUS.CREATED).json(formatSuccess(MESSAGES.SUCCESS.CREATED, assignment));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ ZİMMET OLUŞTURMA HATASI:`, error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Zimmet iade et
     */
    static async return(req, res) {
        try {
            const { id } = req.params;
            const { return_reason, notes } = req.body;
            
            // Detaylı log
            console.log(`[${new Date().toISOString()}] ZİMMET İADE İSTEĞİ:`);
            console.log('  - IP:', req.realIP || req.ip || req.connection.remoteAddress);
            console.log('  - User-Agent:', req.get('User-Agent'));
            console.log('  - Zimmet ID:', id);
            console.log('  - İade nedeni:', return_reason);
            console.log('  - Notlar:', notes);
            
            if (!return_reason || return_reason.trim() === '') {
                console.log('  ❌ İADE NEDENİ EKSİK');
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, ['İade nedeni zorunludur.']));
            }
            
            const assignment = await Assignment.return(id, return_reason, notes);
            console.log('  ✅ ZİMMET BAŞARIYLA İADE EDİLDİ - ID:', id);
            console.log('  - Çalışan:', assignment.employee_name);
            console.log('  - Donanım:', assignment.equipment_category, assignment.equipment_brand, assignment.equipment_model);
            console.log('  - İade nedeni:', return_reason);
            res.status(HTTP_STATUS.OK).json(formatSuccess('Zimmet başarıyla iade edildi.', assignment));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ ZİMMET İADE HATASI:`, error);
            if (error.message === 'Zimmet bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            if (error.message === 'Bu zimmet zaten iade edilmiş') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Bu zimmet zaten iade edilmiş.'));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Zimmet güncelle
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const assignmentData = req.body;
            
            const assignment = await Assignment.update(id, assignmentData);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.UPDATED, assignment));
        } catch (error) {
            console.error('Zimmet güncelleme hatası:', error);
            if (error.message === 'Zimmet bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Zimmet istatistiklerini getir
     */
    static async getStats(req, res) {
        try {
            const stats = await Assignment.getStats();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, stats));
        } catch (error) {
            console.error('Zimmet istatistikleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }
}

module.exports = AssignmentController;