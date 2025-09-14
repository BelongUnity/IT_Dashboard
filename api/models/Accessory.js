const { db } = require('../utils/database');
const { createAuditLog } = require('../services/auditService');

class Accessory {
    /**
     * Donanımın aksesuarlarını getir
     * @param {number} equipmentId - Donanım ID'si
     * @returns {Promise<Array>} Aksesuar listesi
     */
    static async getByEquipment(equipmentId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM equipment_accessories 
                WHERE equipment_id = ?
                ORDER BY accessory_type, accessory_name
            `;
            
            db.all(sql, [equipmentId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * ID'ye göre aksesuar getir
     * @param {number} id - Aksesuar ID'si
     * @returns {Promise<Object|null>} Aksesuar bilgisi
     */
    static async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM equipment_accessories WHERE id = ?';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Yeni aksesuar ekle
     * @param {Object} accessoryData - Aksesuar verisi
     * @returns {Promise<Object>} Oluşturulan aksesuar
     */
    static async create(accessoryData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO equipment_accessories (equipment_id, accessory_type, accessory_name)
                VALUES (?, ?, ?)
            `;
            
            const params = [
                accessoryData.equipment_id,
                accessoryData.accessory_type,
                accessoryData.accessory_name
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Audit log oluştur
                    createAuditLog('equipment_accessories', this.lastID, 'INSERT', null, accessoryData);
                    
                    // Oluşturulan aksesuarı getir
                    Accessory.getById(this.lastID)
                        .then(accessory => resolve(accessory))
                        .catch(reject);
                }
            });
        });
    }

    /**
     * Aksesuar güncelle
     * @param {number} id - Aksesuar ID'si
     * @param {Object} accessoryData - Güncellenecek veri
     * @returns {Promise<Object>} Güncellenmiş aksesuar
     */
    static async update(id, accessoryData) {
        return new Promise((resolve, reject) => {
            // Önce mevcut veriyi al
            Accessory.getById(id)
                .then(oldAccessory => {
                    if (!oldAccessory) {
                        reject(new Error('Aksesuar bulunamadı'));
                        return;
                    }

                    const sql = `
                        UPDATE equipment_accessories 
                        SET accessory_type = ?, accessory_name = ?
                        WHERE id = ?
                    `;
                    
                    const params = [
                        accessoryData.accessory_type,
                        accessoryData.accessory_name,
                        id
                    ];
                    
                    db.run(sql, params, function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Aksesuar bulunamadı'));
                        } else {
                            // Audit log oluştur
                            createAuditLog('equipment_accessories', id, 'UPDATE', oldAccessory, accessoryData);
                            
                            // Güncellenmiş aksesuarı getir
                            Accessory.getById(id)
                                .then(accessory => resolve(accessory))
                                .catch(reject);
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Aksesuar sil
     * @param {number} id - Aksesuar ID'si
     * @returns {Promise<boolean>} Silme başarılı mı
     */
    static async delete(id) {
        return new Promise((resolve, reject) => {
            // Önce mevcut veriyi al
            Accessory.getById(id)
                .then(oldAccessory => {
                    if (!oldAccessory) {
                        reject(new Error('Aksesuar bulunamadı'));
                        return;
                    }

                    const sql = 'DELETE FROM equipment_accessories WHERE id = ?';
                    
                    db.run(sql, [id], function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Aksesuar bulunamadı'));
                        } else {
                            // Audit log oluştur
                            createAuditLog('equipment_accessories', id, 'DELETE', oldAccessory, null);
                            resolve(true);
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Donanımın tüm aksesuarlarını sil
     * @param {number} equipmentId - Donanım ID'si
     * @returns {Promise<number>} Silinen aksesuar sayısı
     */
    static async deleteByEquipment(equipmentId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM equipment_accessories WHERE equipment_id = ?';
            
            db.run(sql, [equipmentId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    /**
     * Toplu aksesuar ekle
     * @param {number} equipmentId - Donanım ID'si
     * @param {Array} accessories - Aksesuar listesi
     * @returns {Promise<Array>} Oluşturulan aksesuarlar
     */
    static async createBulk(equipmentId, accessories) {
        return new Promise((resolve, reject) => {
            if (!accessories || accessories.length === 0) {
                resolve([]);
                return;
            }

            // Önce mevcut aksesuarları sil
            Accessory.deleteByEquipment(equipmentId)
                .then(() => {
                    const createdAccessories = [];
                    let completed = 0;
                    let hasError = false;

                    accessories.forEach((accessory, index) => {
                        if (hasError) return;

                        const accessoryData = {
                            equipment_id: equipmentId,
                            accessory_type: accessory.accessory_type,
                            accessory_name: accessory.accessory_name
                        };

                        Accessory.create(accessoryData)
                            .then(createdAccessory => {
                                createdAccessories[index] = createdAccessory;
                                completed++;

                                if (completed === accessories.length) {
                                    resolve(createdAccessories);
                                }
                            })
                            .catch(err => {
                                hasError = true;
                                reject(err);
                            });
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Aksesuar türlerine göre istatistikleri getir
     * @returns {Promise<Array>} Aksesuar istatistikleri
     */
    static async getTypeStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    accessory_type,
                    COUNT(*) as count
                FROM equipment_accessories
                GROUP BY accessory_type
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

module.exports = Accessory;