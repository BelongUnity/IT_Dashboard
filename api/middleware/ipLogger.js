/**
 * IP adresi ve kullanıcı bilgilerini loglama middleware'i
 */
function ipLogger(req, res, next) {
    // Gerçek IP adresini al
    const getRealIP = (req) => {
        return req.headers['x-forwarded-for'] ||
               req.headers['x-real-ip'] ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               req.ip ||
               '127.0.0.1';
    };

    // IPv6 localhost'u IPv4'e çevir
    const normalizeIP = (ip) => {
        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
            return '127.0.0.1';
        }
        if (ip && ip.startsWith('::ffff:')) {
            return ip.substring(7);
        }
        return ip;
    };

    // IP adresini normalize et
    const realIP = normalizeIP(getRealIP(req));
    
    // req objesine ekle
    req.realIP = realIP;
    
    // Kullanıcı bilgilerini hazırla
    req.userInfo = {
        ip: realIP,
        userAgent: req.get('User-Agent') || 'Unknown',
        timestamp: new Date().toISOString(),
        host: req.get('Host') || 'Unknown'
    };

    next();
}

module.exports = { ipLogger };