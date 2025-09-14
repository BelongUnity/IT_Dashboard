const { formatError } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');
const bcrypt = require('bcryptjs');

// Admin kullanıcı bilgileri
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 dakika

/**
 * Admin kimlik doğrulama middleware'i
 * Session tabanlı authentication sistemi
 */
function authenticate(req, res, next) {
    // Login sayfası, login API'si ve status endpoint'i için authentication'ı atla
    if (req.path === '/login' || req.path === '/api/auth/login' || req.path === '/api/auth/logout' || req.path === '/api/status') {
        return next();
    }
    
    // Session kontrolü
    if (!req.session || !req.session.isAuthenticated) {
        // API istekleri için JSON response
        if (req.path.startsWith('/api/')) {
            return res.status(401).json(formatError('Kimlik doğrulama gerekli. Lütfen giriş yapın.'));
        }
        // Web sayfası istekleri için login sayfasına yönlendir
        return res.redirect('/login');
    }
    
    // Session timeout kontrolü
    if (req.session.lastActivity && (Date.now() - req.session.lastActivity) > SESSION_TIMEOUT) {
        req.session.destroy();
        if (req.path.startsWith('/api/')) {
            return res.status(401).json(formatError('Oturum süresi doldu. Lütfen tekrar giriş yapın.'));
        }
        return res.redirect('/login');
    }
    
    // Son aktivite zamanını güncelle
    req.session.lastActivity = Date.now();
    next();
}

/**
 * Admin giriş işlemi
 */
async function loginAdmin(username, password) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return { success: true, message: 'Giriş başarılı' };
    }
    return { success: false, message: 'Kullanıcı adı veya şifre hatalı' };
}

/**
 * Admin çıkış işlemi
 */
function logoutAdmin(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy hatası:', err);
            return res.status(500).json(formatError('Çıkış işlemi sırasında hata oluştu.'));
        }
        res.json({ success: true, message: 'Başarıyla çıkış yapıldı' });
    });
}

/**
 * Rate limiting middleware'i (basit implementasyon)
 */
const requestCounts = new Map();

function rateLimit(windowMs = 60000, maxRequests = 100) {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Eski kayıtları temizle
        if (requestCounts.has(clientId)) {
            const requests = requestCounts.get(clientId).filter(time => time > windowStart);
            requestCounts.set(clientId, requests);
        } else {
            requestCounts.set(clientId, []);
        }
        
        const currentRequests = requestCounts.get(clientId);
        
        if (currentRequests.length >= maxRequests) {
            return res.status(429).json(formatError('Çok fazla istek. Lütfen daha sonra tekrar deneyin.'));
        }
        
        currentRequests.push(now);
        next();
    };
}

module.exports = {
    authenticate,
    rateLimit,
    loginAdmin,
    logoutAdmin
};