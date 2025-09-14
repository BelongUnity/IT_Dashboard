const AuditLog = require('../models/AuditLog');
const Assignment = require('../models/Assignment');
const { formatError, formatSuccess } = require('../utils/helpers');
const { MESSAGES, HTTP_STATUS } = require('../utils/constants');

class HistoryController {
    /**
     * Sistem audit log'larını getir
     */
    static async getSystemHistory(req, res) {
        try {
            const { limit = 100 } = req.query;
            const logs = await AuditLog.getAll(parseInt(limit));
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, logs));
        } catch (error) {
            console.error('Sistem geçmişi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Belirli bir tablo için audit log'ları getir
     */
    static async getTableHistory(req, res) {
        try {
            const { table } = req.params;
            const { recordId } = req.query;
            
            let logs;
            if (recordId) {
                logs = await AuditLog.getByRecord(table, recordId);
            } else {
                logs = await AuditLog.getByTable(table);
            }
            
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, logs));
        } catch (error) {
            console.error('Tablo geçmişi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Tarih aralığına göre audit log'ları getir
     */
    static async getHistoryByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.VALIDATION_ERROR, ['Başlangıç ve bitiş tarihleri gerekli.']));
            }
            
            const logs = await AuditLog.getByDateRange(startDate, endDate);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, logs));
        } catch (error) {
            console.error('Tarih aralığı geçmişi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * İşlem türüne göre audit log'ları getir
     */
    static async getHistoryByAction(req, res) {
        try {
            const { action } = req.params;
            const logs = await AuditLog.getByAction(action);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, logs));
        } catch (error) {
            console.error('İşlem türü geçmişi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Donanım geçmişini getir
     */
    static async getEquipmentHistory(req, res) {
        try {
            const { id } = req.params;
            const assignments = await Assignment.getByEquipment(id);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, assignments));
        } catch (error) {
            console.error('Donanım geçmişi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Çalışan geçmişini getir
     */
    static async getEmployeeHistory(req, res) {
        try {
            const { id } = req.params;
            const assignments = await Assignment.getByEmployee(id);
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, assignments));
        } catch (error) {
            console.error('Çalışan geçmişi getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Audit log istatistiklerini getir
     */
    static async getAuditStats(req, res) {
        try {
            const stats = await AuditLog.getStats();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, stats));
        } catch (error) {
            console.error('Audit istatistikleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Tablo istatistiklerini getir
     */
    static async getTableStats(req, res) {
        try {
            const stats = await AuditLog.getTableStats();
            res.status(HTTP_STATUS.OK).json(formatSuccess(MESSAGES.SUCCESS.RETRIEVED, stats));
        } catch (error) {
            console.error('Tablo istatistikleri getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Eski audit log'ları temizle
     */
    static async cleanOldLogs(req, res) {
        try {
            const { daysToKeep = 365 } = req.body;
            const deletedCount = await AuditLog.cleanOldLogs(daysToKeep);
            res.status(HTTP_STATUS.OK).json(formatSuccess(`${deletedCount} adet eski log kaydı temizlendi.`));
        } catch (error) {
            console.error('Eski log temizleme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }
}

module.exports = HistoryController;