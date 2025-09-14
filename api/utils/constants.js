// Donanım kategorileri
const EQUIPMENT_CATEGORIES = [
    'Dizüstü Bilgisayar',
    'Masaüstü Bilgisayar',
    'Cep Telefonu',
    'Masa Telefonu',
    'Tablet',
    'Monitör',
    'Diğer'
];

// Donanım durumları
const EQUIPMENT_STATUS = {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned'
};

// Türkçe durum isimleri
const EQUIPMENT_STATUS_TR = {
    available: 'Boşta',
    assigned: 'Atanmış'
};

// Aksesuar türleri (kategoriye göre)
const ACCESSORY_TYPES = {
    'Dizüstü Bilgisayar': [
        'Kablolu Klavye',
        'Kablosuz Klavye',
        'Kablolu Fare',
        'Kablosuz Fare',
        'Monitör',
        'Hoparlör',
        'Webcam',
        'USB Hub',
        'Adaptör',
        'Diğer'
    ],
    'Masaüstü Bilgisayar': [
        'Kablolu Klavye',
        'Kablosuz Klavye',
        'Kablolu Fare',
        'Kablosuz Fare',
        'Monitör',
        'Hoparlör',
        'Webcam',
        'USB Hub',
        'Adaptör',
        'Diğer'
    ],
    'Cep Telefonu': [
        'Şarj Aleti',
        'Kablo',
        'Koruyucu Cam',
        'Kılıf',
        'Kulaklık',
        'Diğer'
    ],
    'Masa Telefonu': [
        'Şarj Aleti',
        'Kablo',
        'Koruyucu Cam',
        'Kılıf',
        'Kulaklık',
        'Diğer'
    ],
    'Tablet': [
        'Şarj Aleti',
        'Kablo',
        'Koruyucu Cam',
        'Kılıf',
        'Klavyeli Kılıf',
        'Kalem',
        'Diğer'
    ],
    'Monitör': [],
    'Diğer': []
};

// API yanıt mesajları
const MESSAGES = {
    SUCCESS: {
        CREATED: 'Kayıt başarıyla oluşturuldu.',
        UPDATED: 'Kayıt başarıyla güncellendi.',
        DELETED: 'Kayıt başarıyla silindi.',
        RETRIEVED: 'Veriler başarıyla getirildi.'
    },
    ERROR: {
        NOT_FOUND: 'Kayıt bulunamadı.',
        VALIDATION_ERROR: 'Validasyon hatası.',
        SERVER_ERROR: 'Sunucu hatası.',
        DUPLICATE_EMAIL: 'Bu e-posta adresi zaten kullanılıyor.',
        DUPLICATE_SERIAL: 'Bu seri numarası zaten kullanılıyor.',
        INVALID_CATEGORY: 'Geçersiz kategori.',
        INVALID_STATUS: 'Geçersiz durum.',
        EQUIPMENT_IN_USE: 'Bu donanım şu anda kullanımda.',
        EMPLOYEE_NOT_ACTIVE: 'Bu çalışan aktif değil.',
        EQUIPMENT_NOT_AVAILABLE: 'Bu donanım müsait değil.'
    }
};

// HTTP durum kodları
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

module.exports = {
    EQUIPMENT_CATEGORIES,
    EQUIPMENT_STATUS,
    EQUIPMENT_STATUS_TR,
    ACCESSORY_TYPES,
    MESSAGES,
    HTTP_STATUS
};