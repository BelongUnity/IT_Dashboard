const { formatError } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Request body validasyonu middleware'i
 */
function validateRequestBody(requiredFields = []) {
    return (req, res, next) => {
        const errors = [];

        // Zorunlu alanları kontrol et
        requiredFields.forEach(field => {
            if (!req.body[field] || req.body[field].toString().trim() === '') {
                errors.push(`${field} alanı zorunludur.`);
            }
        });

        if (errors.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Validasyon hatası.', errors));
        }

        next();
    };
}

/**
 * ID parametresi validasyonu middleware'i
 */
function validateIdParam(req, res, next) {
    const { id } = req.params;
    
    if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Geçersiz ID parametresi.'));
    }

    req.params.id = parseInt(id);
    next();
}

/**
 * Query parametresi validasyonu middleware'i
 */
function validateQueryParams(allowedParams = []) {
    return (req, res, next) => {
        const queryKeys = Object.keys(req.query);
        const invalidParams = queryKeys.filter(key => !allowedParams.includes(key));

        if (invalidParams.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError(`Geçersiz query parametreleri: ${invalidParams.join(', ')}`));
        }

        next();
    };
}

/**
 * Content-Type kontrolü middleware'i
 */
function validateContentType(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        if (!req.is('application/json')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(formatError('Content-Type application/json olmalıdır.'));
        }
    }
    next();
}

module.exports = {
    validateRequestBody,
    validateIdParam,
    validateQueryParams,
    validateContentType
};