const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyası yolu
const dbPath = path.join(__dirname, '../../inventory.db');

// Veritabanı bağlantısı
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('SQLite veritabanına bağlandı.');
        initializeDatabase();
    }
});

// Veritabanı şemasını oluştur
function initializeDatabase() {
    // Employees tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            department TEXT,
            position TEXT,
            mobile_phone TEXT,
            desk_phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            is_active INTEGER DEFAULT 1
        )
    `, (err) => {
        if (err) console.error('Employees tablosu oluşturma hatası:', err.message);
    });

           // Equipment tablosu
           db.run(`
               CREATE TABLE IF NOT EXISTS equipment (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   category TEXT NOT NULL CHECK (category IN ('Dizüstü Bilgisayar', 'Masaüstü Bilgisayar', 'Cep Telefonu', 'Masa Telefonu', 'Tablet', 'Monitör', 'Diğer')),
                   serial_number TEXT,
                   brand TEXT,
                   model TEXT,
                   status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
                   description TEXT,
                   wifi_mac TEXT,
                   lan_mac TEXT,
                   cpu TEXT,
                   gpu TEXT,
                   ram TEXT,
                   storage TEXT,
                   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                   updated_at DATETIME,
                   is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1))
               )
           `, (err) => {
               if (err) console.error('Equipment tablosu oluşturma hatası:', err.message);
           });

    // Equipment accessories tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS equipment_accessories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id INTEGER NOT NULL,
            accessory_type TEXT NOT NULL,
            accessory_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (equipment_id) REFERENCES equipment (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Equipment accessories tablosu oluşturma hatası:', err.message);
    });

    // Assignments tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            equipment_id INTEGER NOT NULL,
            assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            returned_date DATETIME,
            notes TEXT,
            return_reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
            FOREIGN KEY (equipment_id) REFERENCES equipment (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Assignments tablosu oluşturma hatası:', err.message);
    });

    // Audit log tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            record_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            old_values TEXT,
            new_values TEXT,
            user_info TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Audit log tablosu oluşturma hatası:', err.message);
        // Tüm tablolar oluşturulduktan sonra indeksleri oluştur
        createIndexes();
    });
}

// Performans optimizasyonu için indeksler
function createIndexes() {
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email) WHERE is_active = 1',
        'CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department) WHERE is_active = 1',
        'CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category) WHERE is_active = 1',
        'CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status) WHERE is_active = 1',
        'CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number) WHERE is_active = 1',
        'CREATE INDEX IF NOT EXISTS idx_assignments_employee ON assignments(employee_id)',
        'CREATE INDEX IF NOT EXISTS idx_assignments_equipment ON assignments(equipment_id)',
        'CREATE INDEX IF NOT EXISTS idx_assignments_dates ON assignments(assigned_date, returned_date)',
        'CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id)',
        'CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_accessories_equipment ON equipment_accessories(equipment_id)'
    ];

    indexes.forEach(indexSQL => {
        db.run(indexSQL, (err) => {
            if (err) {
                console.error('İndeks oluşturma hatası:', err.message);
            }
        });
    });
}

// Veritabanı bağlantısını kapat
function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('Veritabanı kapatma hatası:', err.message);
        } else {
            console.log('Veritabanı bağlantısı kapatıldı.');
        }
    });
}

module.exports = {
    db,
    closeDatabase
};