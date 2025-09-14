const { db } = require('../utils/database');
const { formatDate } = require('../utils/helpers');

class AuditLog {
    /**
     * Tüm audit log'ları getir
     * @param {number} limit - Maksimum kayıt sayısı
     * @returns {Promise<Array>} Audit log listesi
     */
    static async getAll(limit = 100) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM audit_log 
                ORDER BY created_at DESC 
                LIMIT ?
            `;
            
            db.all(sql, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const logs = rows.map(log => ({
                        ...log,
                        created_at: formatDate(log.created_at),
                        old_values: log.old_values ? JSON.parse(log.old_values) : null,
                        new_values: log.new_values ? JSON.parse(log.new_values) : null
                    }));
                    resolve(logs);
                }
            });
        });
    }

    /**
     * Belirli bir tablo için audit log'ları getir
     * @param {string} tableName - Tablo adı
     * @param {number} recordId - Kayıt ID'si (opsiyonel)
     * @returns {Promise<Array>} Audit log listesi
     */
    static async getByTable(tableName, recordId = null) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM audit_log WHERE table_name = ?';
            let params = [tableName];
            
            if (recordId) {
                sql += ' AND record_id = ?';
                params.push(recordId);
            }
            
            sql += ' ORDER BY created_at DESC';
            
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const logs = rows.map(log => ({
                        ...log,
                        created_at: formatDate(log.created_at),
                        old_values: log.old_values ? JSON.parse(log.old_values) : null,
                        new_values: log.new_values ? JSON.parse(log.new_values) : null
                    }));
                    resolve(logs);
                }
            });
        });
    }

    /**
     * Belirli bir kayıt için audit log'ları getir
     * @param {string} tableName - Tablo adı
     * @param {number} recordId - Kayıt ID'si
     * @returns {Promise<Array>} Audit log listesi
     */
    static async getByRecord(tableName, recordId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM audit_log 
                WHERE table_name = ? AND record_id = ?
                ORDER BY created_at DESC
            `;
            
            db.all(sql, [tableName, recordId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const logs = rows.map(log => ({
                        ...log,
                        created_at: formatDate(log.created_at),
                        old_values: log.old_values ? JSON.parse(log.old_values) : null,
                        new_values: log.new_values ? JSON.parse(log.new_values) : null
                    }));
                    resolve(logs);
                }
            });
        });
    }

    /**
     * Tarih aralığına göre audit log'ları getir
     * @param {string} startDate - Başlangıç tarihi (YYYY-MM-DD)
     * @param {string} endDate - Bitiş tarihi (YYYY-MM-DD)
     * @returns {Promise<Array>} Audit log listesi
     */
    static async getByDateRange(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM audit_log 
                WHERE DATE(created_at) BETWEEN ? AND ?
                ORDER BY created_at DESC
            `;
            
            db.all(sql, [startDate, endDate], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const logs = rows.map(log => ({
                        ...log,
                        created_at: formatDate(log.created_at),
                        old_values: log.old_values ? JSON.parse(log.old_values) : null,
                        new_values: log.new_values ? JSON.parse(log.new_values) : null
                    }));
                    resolve(logs);
                }
            });
        });
    }

    /**
     * İşlem türüne göre audit log'ları getir
     * @param {string} action - İşlem türü (INSERT, UPDATE, DELETE)
     * @returns {Promise<Array>} Audit log listesi
     */
    static async getByAction(action) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM audit_log 
                WHERE action = ?
                ORDER BY created_at DESC
            `;
            
            db.all(sql, [action], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const logs = rows.map(log => ({
                        ...log,
                        created_at: formatDate(log.created_at),
                        old_values: log.old_values ? JSON.parse(log.old_values) : null,
                        new_values: log.new_values ? JSON.parse(log.new_values) : null
                    }));
                    resolve(logs);
                }
            });
        });
    }

    /**
     * Audit log istatistiklerini getir
     * @returns {Promise<Object>} İstatistikler
     */
    static async getStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_logs,
                    COUNT(CASE WHEN action = 'INSERT' THEN 1 END) as insert_count,
                    COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as update_count,
                    COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as delete_count,
                    COUNT(DISTINCT table_name) as table_count
                FROM audit_log
            `;
            
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Tablolara göre audit log sayılarını getir
     * @returns {Promise<Array>} Tablo istatistikleri
     */
    static async getTableStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    table_name,
                    COUNT(*) as count,
                    COUNT(CASE WHEN action = 'INSERT' THEN 1 END) as insert_count,
                    COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as update_count,
                    COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as delete_count
                FROM audit_log
                GROUP BY table_name
                ORDER BY count DESC
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Eski audit log'ları temizle
     * @param {number} daysToKeep - Kaç günlük kayıt tutulacak
     * @returns {Promise<number>} Silinen kayıt sayısı
     */
    static async cleanOldLogs(daysToKeep = 365) {
        return new Promise((resolve, reject) => {
            const sql = `
                DELETE FROM audit_log 
                WHERE created_at < datetime('now', '-${daysToKeep} days')
            `;
            
            db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }
}

module.exports = AuditLog;