const { formatError } = require('../utils/helpers');
const { MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * Hata yönetimi middleware'i
 */
function errorHandler(err, req, res, next) {
    console.error('Hata:', err);

    // SQLite hataları
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        if (err.message.includes('email')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.DUPLICATE_EMAIL));
        }
        if (err.message.includes('serial_number')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(MESSAGES.ERROR.DUPLICATE_SERIAL));
        }
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Benzersizlik kısıtlaması ihlali.'));
    }

    // JSON parse hataları
    if (err.type === 'entity.parse.failed') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Geçersiz JSON formatı.'));
    }

    // Syntax hataları
    if (err.type === 'entity.too.large') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('İstek boyutu çok büyük.'));
    }

    // Varsayılan hata
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatError(MESSAGES.ERROR.SERVER_ERROR));
}

/**
 * 404 hata middleware'i
 */
function notFoundHandler(req, res, next) {
    res.status(HTTP_STATUS.NOT_FOUND).json(formatError('Endpoint bulunamadı.'));
}

module.exports = {
    errorHandler,
    notFoundHandler
};