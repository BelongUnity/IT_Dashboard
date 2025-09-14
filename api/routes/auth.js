const express = require('express');
const router = express.Router();
const { loginAdmin, logoutAdmin } = require('../middleware/auth');
const { formatError } = require('../utils/helpers');

/**
 * Admin giriş endpoint'i
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json(formatError('Kullanıcı adı ve şifre gerekli.'));
        }
        
        const result = await loginAdmin(username, password);
        
        if (result.success) {
            // Session oluştur
            req.session.isAuthenticated = true;
            req.session.username = username;
            req.session.lastActivity = Date.now();
            
            res.json({
                success: true,
                message: result.message,
                username: username
            });
        } else {
            res.status(401).json(formatError(result.message));
        }
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json(formatError('Giriş işlemi sırasında hata oluştu.'));
    }
});

/**
 * Admin çıkış endpoint'i
 */
router.post('/logout', (req, res) => {
    logoutAdmin(req, res);
});

/**
 * Session durumu kontrolü
 */
router.get('/status', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.json({
            authenticated: true,
            username: req.session.username,
            lastActivity: req.session.lastActivity
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

module.exports = router;