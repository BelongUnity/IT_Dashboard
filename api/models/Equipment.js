const { db } = require('../utils/database');
const { cleanEquipmentData } = require('../utils/helpers');
const { createAuditLog } = require('../services/auditService');

class Equipment {
    /**
     * Tüm aktif donanımları getir
     * @returns {Promise<Array>} Donanım listesi
     */
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM equipment 
                WHERE is_active = 1 
                ORDER BY category, brand, model
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const equipment = rows.map(cleanEquipmentData);
                    resolve(equipment);
                }
            });
        });
    }

    /**
     * ID'ye göre donanım getir
     * @param {number} id - Donanım ID'si
     * @returns {Promise<Object|null>} Donanım bilgisi
     */
    static async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM equipment WHERE id = ? AND is_active = 1';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? cleanEquipmentData(row) : null);
                }
            });
        });
    }

    /**
     * Seri numarasına göre donanım getir
     * @param {string} serialNumber - Seri numarası
     * @returns {Promise<Object|null>} Donanım bilgisi
     */
    static async getBySerialNumber(serialNumber) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM equipment WHERE serial_number = ? AND is_active = 1';
            
            db.get(sql, [serialNumber], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? cleanEquipmentData(row) : null);
                }
            });
        });
    }

    /**
     * Kategoriye göre donanımları getir
     * @param {string} category - Donanım kategorisi
     * @returns {Promise<Array>} Donanım listesi
     */
    static async getByCategory(category) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM equipment 
                WHERE category = ? AND is_active = 1 
                ORDER BY brand, model
            `;
            
            db.all(sql, [category], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const equipment = rows.map(cleanEquipmentData);
                    resolve(equipment);
                }
            });
        });
    }

    /**
     * Duruma göre donanımları getir
     * @param {string} status - Donanım durumu
     * @returns {Promise<Array>} Donanım listesi
     */
    static async getByStatus(status) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM equipment 
                WHERE status = ? AND is_active = 1 
                ORDER BY category, brand, model
            `;
            
            db.all(sql, [status], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const equipment = rows.map(cleanEquipmentData);
                    resolve(equipment);
                }
            });
        });
    }

    /**
     * Müsait donanımları getir
     * @returns {Promise<Array>} Müsait donanım listesi
     */
    static async getAvailable() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM equipment 
                WHERE status = 'available' AND is_active = 1 
                ORDER BY category, brand, model
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const equipment = rows.map(cleanEquipmentData);
                    resolve(equipment);
                }
            });
        });
    }

    /**
     * Yeni donanım oluştur
     * @param {Object} equipmentData - Donanım verisi
     * @returns {Promise<Object>} Oluşturulan donanım
     */
    static async create(equipmentData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO equipment (
                    category, serial_number, brand, model, status, description,
                    wifi_mac, lan_mac, cpu, gpu, ram, storage
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                equipmentData.category,
                equipmentData.serial_number || null,
                equipmentData.brand || null,
                equipmentData.model || null,
                equipmentData.status || 'available',
                equipmentData.description || null,
                equipmentData.wifi_mac || null,
                equipmentData.lan_mac || null,
                equipmentData.cpu || null,
                equipmentData.gpu || null,
                equipmentData.ram || null,
                equipmentData.storage || null
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Audit log oluştur
                    createAuditLog('equipment', this.lastID, 'INSERT', null, equipmentData);
                    
                    // Oluşturulan donanımı getir
                    Equipment.getById(this.lastID)
                        .then(equipment => resolve(equipment))
                        .catch(reject);
                }
            });
        });
    }

    /**
     * Donanım güncelle
     * @param {number} id - Donanım ID'si
     * @param {Object} equipmentData - Güncellenecek veri
     * @returns {Promise<Object>} Güncellenmiş donanım
     */
    static async update(id, equipmentData) {
        return new Promise((resolve, reject) => {
            // Önce mevcut veriyi al
            Equipment.getById(id)
                .then(oldEquipment => {
                    if (!oldEquipment) {
                        reject(new Error('Donanım bulunamadı'));
                        return;
                    }

                    const sql = `
                        UPDATE equipment 
                        SET category = ?, serial_number = ?, brand = ?, model = ?, 
                            status = ?, description = ?, wifi_mac = ?, lan_mac = ?, 
                            cpu = ?, gpu = ?, ram = ?, storage = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ? AND is_active = 1
                    `;
                    
                    const params = [
                        equipmentData.category,
                        equipmentData.serial_number || null,
                        equipmentData.brand || null,
                        equipmentData.model || null,
                        equipmentData.status || 'available',
                        equipmentData.description || null,
                        equipmentData.wifi_mac || null,
                        equipmentData.lan_mac || null,
                        equipmentData.cpu || null,
                        equipmentData.gpu || null,
                        equipmentData.ram || null,
                        equipmentData.storage || null,
                        id
                    ];
                    
                    db.run(sql, params, function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Donanım bulunamadı'));
                        } else {
                            // Audit log oluştur
                            createAuditLog('equipment', id, 'UPDATE', oldEquipment, equipmentData);
                            
                            // Güncellenmiş donanımı getir
                            Equipment.getById(id)
                                .then(equipment => resolve(equipment))
                                .catch(reject);
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Donanım sil (soft delete)
     * @param {number} id - Donanım ID'si
     * @returns {Promise<boolean>} Silme başarılı mı
     */
    static async delete(id) {
        return new Promise((resolve, reject) => {
            // Önce mevcut veriyi al
            Equipment.getById(id)
                .then(oldEquipment => {
                    if (!oldEquipment) {
                        reject(new Error('Donanım bulunamadı'));
                        return;
                    }

                    const sql = `
                        UPDATE equipment 
                        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    
                    db.run(sql, [id], function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Donanım bulunamadı'));
                        } else {
                            // Audit log oluştur
                            createAuditLog('equipment', id, 'DELETE', oldEquipment, null);
                            resolve(true);
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Donanım durumunu güncelle
     * @param {number} id - Donanım ID'si
     * @param {string} status - Yeni durum
     * @returns {Promise<Object>} Güncellenmiş donanım
     */
    static async updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE equipment 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND is_active = 1
            `;
            
            db.run(sql, [status, id], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Donanım bulunamadı'));
                } else {
                    // Güncellenmiş donanımı getir
                    Equipment.getById(id)
                        .then(equipment => resolve(equipment))
                        .catch(reject);
                }
            });
        });
    }

    /**
     * Kategorilere göre donanım sayılarını getir
     * @returns {Promise<Array>} Kategori istatistikleri
     */
    static async getCategoryStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT category, COUNT(*) as count
                FROM equipment 
                WHERE is_active = 1
                GROUP BY category
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
     * Durumlara göre donanım sayılarını getir
     * @returns {Promise<Array>} Durum istatistikleri
     */
    static async getStatusStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT status, COUNT(*) as count
                FROM equipment 
                WHERE is_active = 1
                GROUP BY status
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
}

module.exports = Equipment;