const { EQUIPMENT_STATUS_TR } = require('./constants');

/**
 * Tarih formatını düzenle
 * @param {Date} date - Formatlanacak tarih
 * @returns {string} Formatlanmış tarih
 */
function formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * E-posta formatını kontrol et
 * @param {string} email - Kontrol edilecek e-posta
 * @returns {boolean} Geçerli mi
 */
function isValidEmail(email) {
    if (!email) return true; // Opsiyonel alan
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Seri numarası formatını kontrol et
 * @param {string} serialNumber - Kontrol edilecek seri numarası
 * @returns {boolean} Geçerli mi
 */
function isValidSerialNumber(serialNumber) {
    if (!serialNumber) return true; // Opsiyonel alan
    return serialNumber.trim().length > 0;
}

/**
 * Donanım durumunu Türkçe'ye çevir
 * @param {string} status - İngilizce durum
 * @returns {string} Türkçe durum
 */
function translateStatus(status) {
    return EQUIPMENT_STATUS_TR[status] || status;
}

/**
 * Donanım bilgilerini temizle ve formatla
 * @param {Object} equipment - Donanım objesi
 * @returns {Object} Temizlenmiş donanım objesi
 */
function cleanEquipmentData(equipment) {
    const cleaned = { ...equipment };
    
    // Boş string'leri null'a çevir
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') {
            cleaned[key] = null;
        }
    });
    
    // Tarih formatlarını düzenle
    if (cleaned.created_at) {
        cleaned.created_at = formatDate(cleaned.created_at);
    }
    if (cleaned.updated_at) {
        cleaned.updated_at = formatDate(cleaned.updated_at);
    }
    
    // Durumu Türkçe'ye çevir
    if (cleaned.status) {
        cleaned.status_tr = translateStatus(cleaned.status);
    }
    
    return cleaned;
}

/**
 * Çalışan bilgilerini temizle ve formatla
 * @param {Object} employee - Çalışan objesi
 * @returns {Object} Temizlenmiş çalışan objesi
 */
function cleanEmployeeData(employee) {
    const cleaned = { ...employee };
    
    // Boş string'leri null'a çevir
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') {
            cleaned[key] = null;
        }
    });
    
    // Tarih formatlarını düzenle
    if (cleaned.created_at) {
        cleaned.created_at = formatDate(cleaned.created_at);
    }
    if (cleaned.updated_at) {
        cleaned.updated_at = formatDate(cleaned.updated_at);
    }
    
    return cleaned;
}

/**
 * Zimmet bilgilerini temizle ve formatla
 * @param {Object} assignment - Zimmet objesi
 * @returns {Object} Temizlenmiş zimmet objesi
 */
function cleanAssignmentData(assignment) {
    const cleaned = { ...assignment };
    
    // Boş string'leri null'a çevir
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === '') {
            cleaned[key] = null;
        }
    });
    
    // Tarih formatlarını düzenle
    if (cleaned.assigned_date) {
        cleaned.assigned_date = formatDate(cleaned.assigned_date);
    }
    if (cleaned.returned_date) {
        cleaned.returned_date = formatDate(cleaned.returned_date);
    }
    if (cleaned.created_at) {
        cleaned.created_at = formatDate(cleaned.created_at);
    }
    if (cleaned.updated_at) {
        cleaned.updated_at = formatDate(cleaned.updated_at);
    }
    
    return cleaned;
}

/**
 * SQL injection koruması için parametreleri temizle
 * @param {string} value - Temizlenecek değer
 * @returns {string} Temizlenmiş değer
 */
function sanitizeInput(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/['"\\]/g, '');
}

/**
 * Hata mesajını formatla
 * @param {string} message - Hata mesajı
 * @param {Object} details - Hata detayları
 * @returns {Object} Formatlanmış hata objesi
 */
function formatError(message, details = null) {
    return {
        error: true,
        message,
        details,
        timestamp: new Date().toISOString()
    };
}

/**
 * Başarı mesajını formatla
 * @param {string} message - Başarı mesajı
 * @param {Object} data - Döndürülecek veri
 * @returns {Object} Formatlanmış başarı objesi
 */
function formatSuccess(message, data = null) {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    formatDate,
    isValidEmail,
    isValidSerialNumber,
    translateStatus,
    cleanEquipmentData,
    cleanEmployeeData,
    cleanAssignmentData,
    sanitizeInput,
    formatError,
    formatSuccess
};