const Employee = require('../models/Employee');
const { validateEmployee, isEmailUnique } = require('../services/validationService');
const { formatError, formatSuccess } = require('../utils/helpers');
const { MESSAGES, HTTP_STATUS } = require('../utils/constants');

class EmployeeController {
    /**
     * Tüm çalışanları getir
     */
    static async getAll(req, res) {
        try {
            const employees = await Employee.getAll();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, employees));
        } catch (error) {
            console.error('Çalışan listesi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * ID'ye göre çalışan getir
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const employee = await Employee.getById(id);
            
            if (!employee) {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, employee));
        } catch (error) {
            console.error('Çalışan getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Yeni çalışan oluştur
     */
    static async create(req, res) {
        try {
            const employeeData = req.body;
            
            // Detaylı log
            console.log(`[${new Date().toISOString()}] ÇALIŞAN EKLEME İSTEĞİ:`);
            console.log('  - IP:', req.realIP || req.ip || req.connection.remoteAddress);
            console.log('  - User-Agent:', req.get('User-Agent'));
            console.log('  - Gelen veri:', JSON.stringify(employeeData, null, 2));
            
            // Validasyon
            const validation = validateEmployee(employeeData);
            if (!validation.isValid) {
                console.log('  ❌ VALİDASYON HATALARI:', validation.errors);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
            }
            
            // E-posta benzersizlik kontrolü
            if (employeeData.email) {
                const isUnique = await isEmailUnique(employeeData.email);
                if (!isUnique) {
                    console.log('  ❌ E-POSTA ZATEN KULLANILIYOR:', employeeData.email);
                    return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.DUPLICATE_EMAIL));
                }
            }
            
            const employee = await Employee.create(employeeData);
            console.log('  ✅ ÇALIŞAN BAŞARIYLA OLUŞTURULDU - ID:', employee.id);
            res.status(HTTP_STATUS.CREATED).json(formatSuccess(MESSAGES.SUCCESS.CREATED, employee));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ ÇALIŞAN OLUŞTURMA HATASI:`, error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Çalışan güncelle
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const employeeData = req.body;
            
            // Validasyon
            const validation = validateEmployee(employeeData);
            if (!validation.isValid) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, validation.errors));
            }
            
            // E-posta benzersizlik kontrolü
            if (employeeData.email) {
                const isUnique = await isEmailUnique(employeeData.email, id);
                if (!isUnique) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.DUPLICATE_EMAIL));
                }
            }
            
            const employee = await Employee.update(id, employeeData);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.UPDATED, employee));
        } catch (error) {
            console.error('Çalışan güncelleme hatası:', error);
            if (error.message === 'Çalışan bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Çalışan sil
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            // Detaylı log
            console.log(`[${new Date().toISOString()}] ÇALIŞAN SİLME İSTEĞİ:`);
            console.log('  - IP:', req.realIP || req.ip || req.connection.remoteAddress);
            console.log('  - User-Agent:', req.get('User-Agent'));
            console.log('  - Çalışan ID:', id);
            
            // Önce çalışanın var olup olmadığını kontrol et
            const employee = await Employee.getById(id);
            if (!employee) {
                console.log('  ❌ ÇALIŞAN BULUNAMADI - ID:', id);
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            
            // Çalışanın aktif zimmeti var mı kontrol et
            const Assignment = require('../models/Assignment');
            const activeAssignments = await Assignment.getByEmployee(id);
            const hasActiveAssignment = activeAssignments.some(assignment => !assignment.returned_date);
            
            if (hasActiveAssignment) {
                console.log('  ❌ ÇALIŞAN SİLİNEMEZ - AKTİF ZİMMET VAR');
                console.log('  - Çalışan:', employee.name);
                console.log('  - Aktif zimmet sayısı:', activeAssignments.filter(a => !a.returned_date).length);
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Bu çalışanın aktif zimmeti olduğu için silinemez. Önce zimmetleri iade edin.'));
            }
            
            await Employee.delete(id);
            console.log('  ✅ ÇALIŞAN BAŞARIYLA SİLİNDİ - ID:', id);
            console.log('  - Çalışan:', employee.name);
            console.log('  - Departman:', employee.department);
            console.log('  - Pozisyon:', employee.position);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.DELETED));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ ÇALIŞAN SİLME HATASI:`, error);
            if (error.message === 'Çalışan bulunamadı') {
                return res.status(HTTP_STATUS.NOT_FOUND).json(formatError(MESSAGES.ERROR.NOT_FOUND));
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Departman istatistiklerini getir
     */
    static async getDepartmentStats(req, res) {
        try {
            const stats = await Employee.getDepartmentStats();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, stats));
        } catch (error) {
            console.error('Departman istatistikleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }
}

module.exports = EmployeeController;