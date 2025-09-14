@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   IT Envanter ve Zimmet Takip Sistemi
echo ========================================
echo.
echo [1/5] Sistem durumu kontrol ediliyor...

REM Node.js kontrolü
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js bulunamadı! Lütfen Node.js yükleyin.
    echo    İndirme linki: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js bulundu

REM NPM paketlerini kontrol et
if not exist "node_modules" (
    echo [2/5] NPM paketleri yükleniyor...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ NPM paketleri yüklenemedi!
        pause
        exit /b 1
    )
    echo ✅ NPM paketleri yüklendi
) else (
    echo ✅ NPM paketleri mevcut
)

echo [3/5] Veritabanı yedekleme kontrol ediliyor...
if exist "inventory.db" (
    echo ✅ Veritabanı mevcut
) else (
    echo ℹ️  Veritabanı ilk çalıştırmada oluşturulacak
)

echo [4/5] Firewall ayarları kontrol ediliyor...
REM Firewall kuralı ekle (yönetici yetkisi gerekli)
netsh advfirewall firewall show rule name="IT Dashboard Port 3002" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Firewall kuralı ekleniyor (yönetici yetkisi gerekli)...
    netsh advfirewall firewall add rule name="IT Dashboard Port 3002" dir=in action=allow protocol=TCP localport=3002 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Firewall kuralı eklendi
    ) else (
        echo ⚠️  Firewall kuralı eklenemedi (yönetici yetkisi gerekli olabilir)
    )
) else (
    echo ✅ Firewall kuralı mevcut
)

echo [5/5] Sunucu başlatılıyor...
echo.
echo 🚀 IT Envanter ve Zimmet Takip Sistemi başlatılıyor...
echo.
echo 📊 Dashboard: http://localhost:3002
echo 🌐 Network Access: http://[YOUR_IP]:3002
echo 🔗 API: http://localhost:3002/api
echo 📋 Durum: http://localhost:3002/api/status
echo.
echo ⚠️  Sunucuyu durdurmak için Ctrl+C tuşlarına basın
echo.

REM Sunucuyu başlat
node server.js

REM Sunucu kapandığında
if %errorlevel% neq 0 (
    echo.
    echo ❌ Sunucu beklenmedik şekilde kapandı!
    echo    Hata kodu: %errorlevel%
) else (
    echo.
    echo ✅ Sunucu normal şekilde kapatıldı
)

echo.
echo Sistem kapatılıyor...
pause