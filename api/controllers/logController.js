const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const { formatSuccess, formatError } = require('../utils/helpers');
const { db } = require('../utils/database');

class LogController {
    /**
     * Sistem loglarını getir
     */
    static async getSystemLogs(req, res) {
        try {
            const { 
                type = 'all', 
                date = 'all', 
                page = 1, 
                limit = 50,
                status = 'all'
            } = req.query;

            // Tarih filtresi
            let dateFilter = '';
            if (date !== 'all') {
                const now = new Date();
                let startDate;
                
                switch (date) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }
                
                if (startDate) {
                    dateFilter = `AND created_at >= '${startDate.toISOString()}'`;
                }
            }

            // Tip filtresi
            let typeFilter = '';
            if (type !== 'all') {
                const typeMap = {
                    'employees': 'employees',
                    'equipment': 'equipment',
                    'assignments': 'assignments',
                    'security': 'security',
                    'errors': 'errors'
                };
                
                if (typeMap[type]) {
                    typeFilter = `AND table_name = '${typeMap[type]}'`;
                }
            }

            // Durum filtresi
            let statusFilter = '';
            if (status !== 'all') {
                const statusMap = {
                    'success': 'SUCCESS',
                    'warning': 'WARNING', 
                    'error': 'ERROR'
                };
                
                if (statusMap[status]) {
                    statusFilter = `AND action LIKE '%${statusMap[status]}%'`;
                }
            }

            // Toplam kayıt sayısı
            const countSql = `
                SELECT COUNT(*) as total 
                FROM audit_log 
                WHERE 1=1 ${dateFilter} ${typeFilter} ${statusFilter}
            `;
            
            const totalResult = await new Promise((resolve, reject) => {
                db.get(countSql, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            // Sayfalama
            const offset = (page - 1) * limit;
            const sql = `
                SELECT * FROM audit_log 
                WHERE 1=1 ${dateFilter} ${typeFilter} ${statusFilter}
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `;

            const logs = await new Promise((resolve, reject) => {
                db.all(sql, [limit, offset], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // İstatistikler
            const statsSql = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN action LIKE '%SUCCESS%' THEN 1 ELSE 0 END) as success,
                    SUM(CASE WHEN action LIKE '%WARNING%' THEN 1 ELSE 0 END) as warning,
                    SUM(CASE WHEN action LIKE '%ERROR%' THEN 1 ELSE 0 END) as error
                FROM audit_log 
                WHERE 1=1 ${dateFilter} ${typeFilter}
            `;

            const stats = await new Promise((resolve, reject) => {
                db.get(statsSql, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            // Logları formatla
            const formattedLogs = logs.map(log => ({
                id: log.id,
                timestamp: log.created_at,
                type: log.table_name,
                action: log.action,
                recordId: log.record_id,
                userInfo: LogController.safeJsonParse(log.user_info),
                oldValues: LogController.safeJsonParse(log.old_values),
                newValues: LogController.safeJsonParse(log.new_values),
                details: LogController.formatLogDetails(log)
            }));

            res.status(HTTP_STATUS.OK).json(formatSuccess('Loglar başarıyla getirildi', {
                logs: formattedLogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalResult.total / limit),
                    totalRecords: totalResult.total,
                    limit: parseInt(limit)
                },
                statistics: {
                    total: stats.total || 0,
                    success: stats.success || 0,
                    warning: stats.warning || 0,
                    error: stats.error || 0
                }
            }));

        } catch (error) {
            console.error('Log getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Güvenli JSON parse
     */
    static safeJsonParse(jsonString) {
        if (!jsonString) return null;
        
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            // JSON değilse string olarak döndür
            return { raw: jsonString };
        }
    }

    /**
     * Log detaylarını formatla
     */
    static formatLogDetails(log) {
        const details = [];
        
        if (log.old_values) {
            const oldValues = LogController.safeJsonParse(log.old_values);
            if (oldValues && typeof oldValues === 'object') {
                details.push(`Eski Değerler: ${JSON.stringify(oldValues, null, 2)}`);
            } else {
                details.push(`Eski Değerler: ${log.old_values}`);
            }
        }
        
        if (log.new_values) {
            const newValues = LogController.safeJsonParse(log.new_values);
            if (newValues && typeof newValues === 'object') {
                details.push(`Yeni Değerler: ${JSON.stringify(newValues, null, 2)}`);
            } else {
                details.push(`Yeni Değerler: ${log.new_values}`);
            }
        }
        
        if (log.user_info) {
            const userInfo = LogController.safeJsonParse(log.user_info);
            if (userInfo && typeof userInfo === 'object') {
                details.push(`Kullanıcı Bilgisi: ${JSON.stringify(userInfo, null, 2)}`);
            } else {
                details.push(`Kullanıcı Bilgisi: ${log.user_info}`);
            }
        }
        
        return details.join('\n\n');
    }

    /**
     * Log istatistiklerini getir
     */
    static async getLogStatistics(req, res) {
        try {
            const { period = 'week' } = req.query;
            
            let dateFilter = '';
            const now = new Date();
            let startDate;
            
            switch (period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
            }
            
            if (startDate) {
                dateFilter = `WHERE created_at >= '${startDate.toISOString()}'`;
            }

            const sql = `
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as total,
                    SUM(CASE WHEN action LIKE '%SUCCESS%' THEN 1 ELSE 0 END) as success,
                    SUM(CASE WHEN action LIKE '%WARNING%' THEN 1 ELSE 0 END) as warning,
                    SUM(CASE WHEN action LIKE '%ERROR%' THEN 1 ELSE 0 END) as error
                FROM audit_log 
                ${dateFilter}
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            `;

            const stats = await new Promise((resolve, reject) => {
                db.all(sql, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            res.status(HTTP_STATUS.OK).json(formatSuccess('İstatistikler başarıyla getirildi', stats));

        } catch (error) {
            console.error('İstatistik getirme hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }

    /**
     * Logları dışa aktar
     */
    static async exportLogs(req, res) {
        try {
            const { type = 'all', date = 'all', format = 'json' } = req.query;

            // Filtreleri uygula (getSystemLogs ile aynı mantık)
            let dateFilter = '';
            if (date !== 'all') {
                const now = new Date();
                let startDate;
                
                switch (date) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }
                
                if (startDate) {
                    dateFilter = `AND created_at >= '${startDate.toISOString()}'`;
                }
            }

            let typeFilter = '';
            if (type !== 'all') {
                const typeMap = {
                    'employees': 'employees',
                    'equipment': 'equipment',
                    'assignments': 'assignments',
                    'security': 'security',
                    'errors': 'errors'
                };
                
                if (typeMap[type]) {
                    typeFilter = `AND table_name = '${typeMap[type]}'`;
                }
            }

            const sql = `
                SELECT * FROM audit_log 
                WHERE 1=1 ${dateFilter} ${typeFilter}
                ORDER BY created_at DESC
            `;

            const logs = await new Promise((resolve, reject) => {
                db.all(sql, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            if (format === 'csv') {
                // CSV formatında dışa aktar
                const csvHeader = 'Tarih,İşlem Türü,İşlem,Kayıt ID,Kullanıcı Bilgisi,Eski Değerler,Yeni Değerler\n';
            const csvData = logs.map(log => {
                const userInfo = LogController.safeJsonParse(log.user_info) || {};
                const ip = userInfo.ip || '';
                const userAgent = userInfo.userAgent || '';
                
                return [
                    log.created_at,
                    log.table_name,
                    log.action,
                    log.record_id,
                    `IP: ${ip}, User-Agent: ${userAgent}`,
                    log.old_values || '',
                    log.new_values || ''
                ].map(field => `"${field}"`).join(',');
            }).join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`);
                res.send(csvHeader + csvData);
            } else {
                // JSON formatında dışa aktar
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.json"`);
                res.json(logs);
            }

        } catch (error) {
            console.error('Log dışa aktarma hatası:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
        }
    }
}

module.exports = LogController;