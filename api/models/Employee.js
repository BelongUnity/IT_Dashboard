const { db } = require('../utils/database');
const { cleanEmployeeData } = require('../utils/helpers');
const { createAuditLog } = require('../services/auditService');

class Employee {
    /**
     * Tüm aktif çalışanları getir
     * @returns {Promise<Array>} Çalışan listesi
     */
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM employees 
                WHERE is_active = 1 
                ORDER BY name ASC
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const employees = rows.map(cleanEmployeeData);
                    resolve(employees);
                }
            });
        });
    }

    /**
     * ID'ye göre çalışan getir
     * @param {number} id - Çalışan ID'si
     * @returns {Promise<Object|null>} Çalışan bilgisi
     */
    static async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM employees WHERE id = ? AND is_active = 1';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? cleanEmployeeData(row) : null);
                }
            });
        });
    }

    /**
     * E-posta ile çalışan getir
     * @param {string} email - E-posta adresi
     * @returns {Promise<Object|null>} Çalışan bilgisi
     */
    static async getByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM employees WHERE email = ? AND is_active = 1';
            
            db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? cleanEmployeeData(row) : null);
                }
            });
        });
    }

    /**
     * Yeni çalışan oluştur
     * @param {Object} employeeData - Çalışan verisi
     * @returns {Promise<Object>} Oluşturulan çalışan
     */
    static async create(employeeData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO employees (name, email, department, position, mobile_phone, desk_phone)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                employeeData.name,
                employeeData.email || null,
                employeeData.department || null,
                employeeData.position || null,
                employeeData.mobile_phone || null,
                employeeData.desk_phone || null
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Audit log oluştur
                    createAuditLog('employees', this.lastID, 'INSERT', null, employeeData);
                    
                    // Oluşturulan çalışanı getir
                    Employee.getById(this.lastID)
                        .then(employee => resolve(employee))
                        .catch(reject);
                }
            });
        });
    }

    /**
     * Çalışan güncelle
     * @param {number} id - Çalışan ID'si
     * @param {Object} employeeData - Güncellenecek veri
     * @returns {Promise<Object>} Güncellenmiş çalışan
     */
    static async update(id, employeeData) {
        return new Promise((resolve, reject) => {
            // Önce mevcut veriyi al
            Employee.getById(id)
                .then(oldEmployee => {
                    if (!oldEmployee) {
                        reject(new Error('Çalışan bulunamadı'));
                        return;
                    }

                    const sql = `
                        UPDATE employees 
                        SET name = ?, email = ?, department = ?, position = ?, 
                            mobile_phone = ?, desk_phone = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ? AND is_active = 1
                    `;
                    
                    const params = [
                        employeeData.name,
                        employeeData.email || null,
                        employeeData.department || null,
                        employeeData.position || null,
                        employeeData.mobile_phone || null,
                        employeeData.desk_phone || null,
                        id
                    ];
                    
                    db.run(sql, params, function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Çalışan bulunamadı'));
                        } else {
                            // Audit log oluştur
                            createAuditLog('employees', id, 'UPDATE', oldEmployee, employeeData);
                            
                            // Güncellenmiş çalışanı getir
                            Employee.getById(id)
                                .then(employee => resolve(employee))
                                .catch(reject);
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Çalışan sil (soft delete)
     * @param {number} id - Çalışan ID'si
     * @returns {Promise<boolean>} Silme başarılı mı
     */
    static async delete(id) {
        return new Promise((resolve, reject) => {
            // Önce mevcut veriyi al
            Employee.getById(id)
                .then(oldEmployee => {
                    if (!oldEmployee) {
                        reject(new Error('Çalışan bulunamadı'));
                        return;
                    }

                    const sql = `
                        UPDATE employees 
                        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    
                    db.run(sql, [id], function(err) {
                        if (err) {
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Çalışan bulunamadı'));
                        } else {
                            // Audit log oluştur
                            createAuditLog('employees', id, 'DELETE', oldEmployee, null);
                            resolve(true);
                        }
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Departmanlara göre çalışan sayılarını getir
     * @returns {Promise<Array>} Departman istatistikleri
     */
    static async getDepartmentStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT department, COUNT(*) as count
                FROM employees 
                WHERE is_active = 1 AND department IS NOT NULL
                GROUP BY department
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

module.exports = Employee;