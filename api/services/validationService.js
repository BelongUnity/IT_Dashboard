const { 
    EQUIPMENT_CATEGORIES, 
    EQUIPMENT_STATUS, 
    ACCESSORY_TYPES,
    MESSAGES 
} = require('../utils/constants');
const { isValidEmail, isValidSerialNumber } = require('../utils/helpers');

/**
 * Çalışan verilerini validate et
 * @param {Object} employeeData - Çalışan verisi
 * @returns {Object} Validasyon sonucu
 */
function validateEmployee(employeeData) {
    const errors = [];
    
    // Zorunlu alanlar
    if (!employeeData.name || employeeData.name.trim() === '') {
        errors.push('Ad Soyad alanı zorunludur.');
    }
    
    // E-posta validasyonu
    if (employeeData.email && !isValidEmail(employeeData.email)) {
        errors.push('Geçerli bir e-posta adresi giriniz.');
    }
    
    // Telefon numarası formatı (basit kontrol)
    if (employeeData.mobile_phone && employeeData.mobile_phone.length < 10) {
        errors.push('Cep telefonu numarası en az 10 karakter olmalıdır.');
    }
    
    if (employeeData.desk_phone && employeeData.desk_phone.length < 3) {
        errors.push('Masa telefonu numarası en az 3 karakter olmalıdır.');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Donanım verilerini validate et
 * @param {Object} equipmentData - Donanım verisi
 * @returns {Object} Validasyon sonucu
 */
function validateEquipment(equipmentData) {
    const errors = [];
    
    // Zorunlu alanlar
    if (!equipmentData.category || !EQUIPMENT_CATEGORIES.includes(equipmentData.category)) {
        errors.push('Geçerli bir kategori seçiniz.');
    }
    
    // Seri numarası validasyonu
    if (equipmentData.serial_number && !isValidSerialNumber(equipmentData.serial_number)) {
        errors.push('Geçerli bir seri numarası giriniz.');
    }
    
    // Durum validasyonu
    if (equipmentData.status && !Object.values(EQUIPMENT_STATUS).includes(equipmentData.status)) {
        errors.push('Geçerli bir durum seçiniz.');
    }
    
    // 'Diğer' kategorisi için açıklama zorunlu
    if (equipmentData.category === 'Diğer' && (!equipmentData.description || equipmentData.description.trim() === '')) {
        errors.push('Diğer kategorisi için açıklama alanı zorunludur.');
    }
    
    // MAC adresi formatı (basit kontrol)
    if (equipmentData.wifi_mac && !isValidMacAddress(equipmentData.wifi_mac)) {
        errors.push('Geçerli bir WiFi MAC adresi giriniz.');
    }
    
    if (equipmentData.lan_mac && !isValidMacAddress(equipmentData.lan_mac)) {
        errors.push('Geçerli bir LAN MAC adresi giriniz.');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Aksesuar verilerini validate et
 * @param {Object} accessoryData - Aksesuar verisi
 * @param {string} equipmentCategory - Donanım kategorisi
 * @returns {Object} Validasyon sonucu
 */
function validateAccessory(accessoryData, equipmentCategory) {
    const errors = [];
    
    // Zorunlu alanlar
    if (!accessoryData.accessory_type || accessoryData.accessory_type.trim() === '') {
        errors.push('Aksesuar türü seçiniz.');
    }
    
    if (!accessoryData.accessory_name || accessoryData.accessory_name.trim() === '') {
        errors.push('Aksesuar adı giriniz.');
    }
    
    // Kategoriye uygun aksesuar türü kontrolü
    const validTypes = ACCESSORY_TYPES[equipmentCategory] || [];
    if (accessoryData.accessory_type && !validTypes.includes(accessoryData.accessory_type)) {
        errors.push('Bu kategori için geçerli bir aksesuar türü seçiniz.');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Zimmet verilerini validate et
 * @param {Object} assignmentData - Zimmet verisi
 * @returns {Object} Validasyon sonucu
 */
function validateAssignment(assignmentData) {
    const errors = [];
    
    // Zorunlu alanlar
    if (!assignmentData.employee_id || isNaN(assignmentData.employee_id)) {
        errors.push('Geçerli bir çalışan seçiniz.');
    }
    
    if (!assignmentData.equipment_id || isNaN(assignmentData.equipment_id)) {
        errors.push('Geçerli bir donanım seçiniz.');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * MAC adresi formatını kontrol et
 * @param {string} macAddress - MAC adresi
 * @returns {boolean} Geçerli mi
 */
function isValidMacAddress(macAddress) {
    if (!macAddress) return true; // Opsiyonel alan
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(macAddress);
}

/**
 * E-posta benzersizliğini kontrol et
 * @param {string} email - E-posta adresi
 * @param {number} excludeId - Hariç tutulacak ID (güncelleme için)
 * @returns {Promise<boolean>} Benzersiz mi
 */
function isEmailUnique(email, excludeId = null) {
    return new Promise((resolve, reject) => {
        if (!email) {
            resolve(true); // Boş e-posta benzersiz kabul edilir
            return;
        }
        
        const { db } = require('../utils/database');
        let sql = 'SELECT id FROM employees WHERE email = ? AND is_active = 1';
        let params = [email];
        
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!row); // Eğer kayıt yoksa benzersiz
            }
        });
    });
}

/**
 * Seri numarası benzersizliğini kontrol et
 * @param {string} serialNumber - Seri numarası
 * @param {number} excludeId - Hariç tutulacak ID (güncelleme için)
 * @returns {Promise<boolean>} Benzersiz mi
 */
function isSerialNumberUnique(serialNumber, excludeId = null) {
    return new Promise((resolve, reject) => {
        if (!serialNumber) {
            resolve(true); // Boş seri numarası benzersiz kabul edilir
            return;
        }
        
        const { db } = require('../utils/database');
        let sql = 'SELECT id FROM equipment WHERE serial_number = ? AND is_active = 1';
        let params = [serialNumber];
        
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!row); // Eğer kayıt yoksa benzersiz
            }
        });
    });
}

module.exports = {
    validateEmployee,
    validateEquipment,
    validateAccessory,
    validateAssignment,
    isValidMacAddress,
    isEmailUnique,
    isSerialNumberUnique
};