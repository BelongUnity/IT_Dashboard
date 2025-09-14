const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

// Sistem saatini Türkiye saatine ayarla
process.env.TZ = 'Europe/Istanbul';

// Timezone ayarını doğrula
console.log('🕐 Sistem saati ayarlanıyor...');
console.log('📅 Timezone:', process.env.TZ);
console.log('⏰ Şu anki saat:', new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }));

// Veritabanı bağlantısını başlat
require('./api/utils/database');

// Middleware'leri import et
const { errorHandler, notFoundHandler } = require('./api/middleware/errorHandler');
const { validateContentType } = require('./api/middleware/validation');
const { rateLimit, authenticate } = require('./api/middleware/auth');
const { ipLogger } = require('./api/middleware/ipLogger');

// Route'ları import et
const authRoutes = require('./api/routes/auth');
const reportRoutes = require('./api/routes/reports');
const employeeRoutes = require('./api/routes/employees');
const equipmentRoutes = require('./api/routes/equipment');
const assignmentRoutes = require('./api/routes/assignments');
const historyRoutes = require('./api/routes/history');
const accessoryRoutes = require('./api/routes/accessories');
const logRoutes = require('./api/routes/logs');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware'leri uygula
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));

// Session konfigürasyonu
app.use(session({
    secret: 'IT_Dashboard_Secret_Key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // HTTP için false, HTTPS için true
        maxAge: 10 * 60 * 1000, // 10 dakika
        httpOnly: true
    }
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(validateContentType);

// Rate limiting
app.use(rateLimit(60000, 1000)); // 1 dakikada 1000 istek

// IP logging middleware
app.use(ipLogger);

// Auth routes (authentication'dan önce)
app.use('/api/auth', authRoutes);

// API durumu endpoint'i (authentication'dan önce)
app.get('/api/status', (req, res) => {
    const now = new Date();
    res.json({
        status: 'OK',
        message: 'IT Envanter ve Zimmet Takip Sistemi API',
        version: '2.0.0',
        timestamp: now.toISOString(),
        localTime: now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        timezone: process.env.TZ || 'Europe/Istanbul',
        uptime: process.uptime()
    });
});

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware - tüm route'ları koru
app.use(authenticate);

// API route'ları
app.use('/api/reports', reportRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/logs', logRoutes);

// Login sayfası route'u
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ana sayfa route'u
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Sunucuyu başlat - tüm network interface'lerinde erişilebilir
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 IT Envanter ve Zimmet Takip Sistemi sunucusu ${PORT} portunda çalışıyor`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🌐 Network Access: http://[YOUR_IP]:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`📋 Durum: http://localhost:${PORT}/api/status`);
    console.log(`🔒 Güvenlik: Admin kimlik doğrulama aktif`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
    const { closeDatabase } = require('./api/utils/database');
    closeDatabase();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT sinyali alındı. Sunucu kapatılıyor...');
    const { closeDatabase } = require('./api/utils/database');
    closeDatabase();
    process.exit(0);
});

module.exports = app;