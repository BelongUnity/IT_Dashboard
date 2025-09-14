const { db } = require('../utils/database');

/**
 * Audit log kaydı oluştur
 * @param {string} tableName - Tablo adı
 * @param {number} recordId - Kayıt ID'si
 * @param {string} action - İşlem türü (INSERT, UPDATE, DELETE)
 * @param {Object} oldValues - Eski değerler
 * @param {Object} newValues - Yeni değerler
 * @param {string} userInfo - Kullanıcı bilgisi
 */
function createAuditLog(tableName, recordId, action, oldValues = null, newValues = null, userInfo = 'System') {
    const sql = `
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_info)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const oldValuesStr = oldValues ? JSON.stringify(oldValues) : null;
    const newValuesStr = newValues ? JSON.stringify(newValues) : null;
    
    db.run(sql, [tableName, recordId, action, oldValuesStr, newValuesStr, userInfo], function(err) {
        if (err) {
            console.error('Audit log oluşturma hatası:', err.message);
        }
    });
}

/**
 * Belirli bir tablo için audit log'ları getir
 * @param {string} tableName - Tablo adı
 * @param {number} recordId - Kayıt ID'si (opsiyonel)
 * @returns {Promise<Array>} Audit log listesi
 */
function getAuditLogs(tableName, recordId = null) {
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
                // JSON string'leri parse et
                const logs = rows.map(row => ({
                    ...row,
                    old_values: row.old_values ? JSON.parse(row.old_values) : null,
                    new_values: row.new_values ? JSON.parse(row.new_values) : null
                }));
                resolve(logs);
            }
        });
    });
}

/**
 * Sistem audit log'larını getir
 * @param {number} limit - Maksimum kayıt sayısı
 * @returns {Promise<Array>} Audit log listesi
 */
function getSystemAuditLogs(limit = 100) {
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
                // JSON string'leri parse et
                const logs = rows.map(row => ({
                    ...row,
                    old_values: row.old_values ? JSON.parse(row.old_values) : null,
                    new_values: row.new_values ? JSON.parse(row.new_values) : null
                }));
                resolve(logs);
            }
        });
    });
}

/**
 * Audit log'ları temizle (eski kayıtları sil)
 * @param {number} daysToKeep - Kaç günlük kayıt tutulacak
 */
function cleanOldAuditLogs(daysToKeep = 365) {
    const sql = `
        DELETE FROM audit_log 
        WHERE created_at < datetime('now', '-${daysToKeep} days')
    `;
    
    db.run(sql, function(err) {
        if (err) {
            console.error('Eski audit log temizleme hatası:', err.message);
        } else {
            console.log(`${this.changes} adet eski audit log kaydı silindi.`);
        }
    });
}

module.exports = {
    createAuditLog,
    getAuditLogs,
    getSystemAuditLogs,
    cleanOldAuditLogs
};