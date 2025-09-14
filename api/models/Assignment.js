const { db } = require('../utils/database');
const { cleanAssignmentData } = require('../utils/helpers');
const { createAuditLog } = require('../services/auditService');

class Assignment {
    /**
     * Tüm zimmet atamalarını getir
     * @returns {Promise<Array>} Zimmet listesi
     */
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    a.*,
                    e.name as employee_name,
                    e.department as employee_department,
                    eq.category as equipment_category,
                    eq.brand as equipment_brand,
                    eq.model as equipment_model,
                    eq.serial_number as equipment_serial
                FROM assignments a
                LEFT JOIN employees e ON a.employee_id = e.id
                LEFT JOIN equipment eq ON a.equipment_id = eq.id
                ORDER BY a.assigned_date DESC
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const assignments = rows.map(cleanAssignmentData);
                    resolve(assignments);
                }
            });
        });
    }

    /**
     * ID'ye göre zimmet getir
     * @param {number} id - Zimmet ID'si
     * @returns {Promise<Object|null>} Zimmet bilgisi
     */
    static async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    a.*,
                    e.name as employee_name,
                    e.department as employee_department,
                    eq.category as equipment_category,
                    eq.brand as equipment_brand,
                    eq.model as equipment_model,
                    eq.serial_number as equipment_serial
                FROM assignments a
                LEFT JOIN employees e ON a.employee_id = e.id
                LEFT JOIN equipment eq ON a.equipment_id = eq.id
                WHERE a.id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? cleanAssignmentData(row) : null);
                }
            });
        });
    }

    /**
     * Aktif zimmetleri getir
     * @returns {Promise<Array>} Aktif zimmet listesi
     */
    static async getActive() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    a.*,
                    e.name as employee_name,
                    e.department as employee_department,
                    eq.category as equipment_category,
                    eq.brand as equipment_brand,
                    eq.model as equipment_model,
                    eq.serial_number as equipment_serial
                FROM assignments a
                LEFT JOIN employees e ON a.employee_id = e.id
                LEFT JOIN equipment eq ON a.equipment_id = eq.id
                WHERE a.returned_date IS NULL
                ORDER BY a.assigned_date DESC
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const assignments = rows.map(cleanAssignmentData);
                    resolve(assignments);
                }
            });
        });
    }

    /**
     * Çalışanın zimmetlerini getir
     * @param {number} employeeId - Çalışan ID'si
     * @returns {Promise<Array>} Zimmet listesi
     */
    static async getByEmployee(employeeId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    a.*,
                    e.name as employee_name,
                    e.department as employee_department,
                    eq.category as equipment_category,
                    eq.brand as equipment_brand,
                    eq.model as equipment_model,
                    eq.serial_number as equipment_serial
                FROM assignments a
                LEFT JOIN employees e ON a.employee_id = e.id
                LEFT JOIN equipment eq ON a.equipment_id = eq.id
                WHERE a.employee_id = ?
                ORDER BY a.assigned_date DESC
            `;
            
            db.all(sql, [employeeId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const assignments = rows.map(cleanAssignmentData);
                    resolve(assignments);
                }
            });
        });
    }

    /**
     * Donanımın zimmetlerini getir
     * @param {number} equipmentId - Donanım ID'si
     * @returns {Promise<Array>} Zimmet listesi
     */
    static async getByEquipment(equipmentId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    a.*,
                    e.name as employee_name,
                    e.department as employee_department,
                    eq.category as equipment_category,
                    eq.brand as equipment_brand,
                    eq.model as equipment_model,
                    eq.serial_number as equipment_serial
                FROM assignments a
                LEFT JOIN employees e ON a.employee_id = e.id
                LEFT JOIN equipment eq ON a.equipment_id = eq.id
                WHERE a.equipment_id = ?
                ORDER BY a.assigned_date DESC
            `;
            
            db.all(sql, [equipmentId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const assignments = rows.map(cleanAssignmentData);
                    resolve(assignments);
                }
            });
        });
    }

    /**
     * Yeni zimmet ata
     * @param {Object} assignmentData - Zimmet verisi
     * @returns {Promise<Object>} Oluşturulan zimmet
     */
    static async create(assignmentData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO assignments (employee_id, equipment_id, notes)
                VALUES (?, ?, ?)
            `;
            
            const params = [
                assignmentData.employee_id,
                assignmentData.equipment_id,
                assignmentData.notes || null
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Donanım durumunu 'assigned' olarak güncelle
                    const updateEquipmentSql = `
                        UPDATE equipment 
                        SET status = 'assigned', updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    
                    db.run(updateEquipmentSql, [assignmentData.equipment_id], (updateErr) => {
                        if (updateErr) {
                            console.error('Donanım durumu güncelleme hatası:', updateErr.message);
                        }
                        
                        // Audit log oluştur
                        createAuditLog('assignments', this.lastID, 'INSERT', null, assignmentData);
                        
                        // Oluşturulan zimmeti getir
                        Assignment.getById(this.lastID)
                            .then(assignment => resolve(assignment))
                            .catch(reject);
                    });
                }
            });
        });
    }

    /**
     * Zimmet iade et
     * @param {number} id - Zimmet ID'si
     * @param {string} returnReason - İade nedeni
     * @param {string} notes - Notlar
     * @returns {Promise<Object>} Güncellenmiş zimmet
     */
    static async return(id, returnReason, notes = null) {
        return new Promise((resolve, reject) => {
            // Önce mevcut zimmeti al
            Assignment.getById(id)
                .then(oldAssignment => {
                    if (!oldAssignment) {
                        reject(new Error('Zimmet bulunamadı'));
                        return;
                    }

                    if (oldAssignment.returned_date) {
                        reject(new Error('Bu zimmet zaten iade edilmiş'));
                        return;
                    }

                    const sql = `
                        UPDATE assignments 
                        SET returned_date = CURRENT_TIMESTAMP, return_reason = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    
                    db.run(sql, [returnReason, notes, id], function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Zimmet bulunamadı'));
                        } else {
                            // Donanım durumunu 'available' olarak güncelle
                            const updateEquipmentSql = `
                                UPDATE equipment 
                                SET status = 'available', updated_at = CURRENT_TIMESTAMP
                                WHERE id = ?
                            `;
                            
                            db.run(updateEquipmentSql, [oldAssignment.equipment_id], (updateErr) => {
                                if (updateErr) {
                                    console.error('Donanım durumu güncelleme hatası:', updateErr.message);
                                }
                                
                                // Audit log oluştur
                                const updateData = {
                                    returned_date: new Date().toISOString(),
                                    return_reason: returnReason,
                                    notes: notes
                                };
                                createAuditLog('assignments', id, 'UPDATE', oldAssignment, updateData);
                                
                                // Güncellenmiş zimmeti getir
                                Assignment.getById(id)
                                    .then(assignment => resolve(assignment))
                                    .catch(reject);
                            });
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Zimmet güncelle
     * @param {number} id - Zimmet ID'si
     * @param {Object} assignmentData - Güncellenecek veri
     * @returns {Promise<Object>} Güncellenmiş zimmet
     */
    static async update(id, assignmentData) {
        return new Promise((resolve, reject) => {
            // Önce mevcut veriyi al
            Assignment.getById(id)
                .then(oldAssignment => {
                    if (!oldAssignment) {
                        reject(new Error('Zimmet bulunamadı'));
                        return;
                    }

                    const sql = `
                        UPDATE assignments 
                        SET notes = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    
                    db.run(sql, [assignmentData.notes || null, id], function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Zimmet bulunamadı'));
                        } else {
                            // Audit log oluştur
                            createAuditLog('assignments', id, 'UPDATE', oldAssignment, assignmentData);
                            
                            // Güncellenmiş zimmeti getir
                            Assignment.getById(id)
                                .then(assignment => resolve(assignment))
                                .catch(reject);
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Zimmet istatistiklerini getir
     * @returns {Promise<Object>} İstatistikler
     */
    static async getStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_assignments,
                    COUNT(CASE WHEN returned_date IS NULL THEN 1 END) as active_assignments,
                    COUNT(CASE WHEN returned_date IS NOT NULL THEN 1 END) as returned_assignments
                FROM assignments
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
}

module.exports = Assignment;