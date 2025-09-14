# IT Envanter ve Zimmet Takip Sistemi - Product Requirements Document (PRD)

## 📋 Proje Özeti

**Proje Adı:** IT Envanter ve Zimmet Takip Sistemi  
**Versiyon:** 2.0  
**Hedef Kitle:** IT Yöneticileri, İnsan Kaynakları, Muhasebe  
**Proje Tipi:** Web Tabanlı Envanter Yönetim Sistemi  

## 🎯 Proje Amacı

Kurumsal IT ekipmanlarının (bilgisayar, telefon, tablet vb.) envanterini tutmak, çalışanlara zimmet atamalarını yönetmek ve tüm işlemlerin geçmişini takip etmek için kapsamlı bir web uygulaması geliştirmek.

## 🚀 Temel Özellikler

### 1. Çalışan Yönetimi
- **Çalışan Ekleme/Düzenleme/Silme**
  - Ad Soyad (zorunlu)
  - E-posta adresi (opsiyonel, unique kontrolü)
  - Departman
  - Pozisyon
  - Cep telefonu
  - Masa telefonu
  - Oluşturulma/güncellenme tarihleri
  - Soft delete (is_active flag)

### 2. Donanım Yönetimi
- **Donanım Kategorileri:**
  - Dizüstü Bilgisayar
  - Masaüstü Bilgisayar
  - Cep Telefonu
  - Masa Telefonu
  - Tablet
  - Monitör
  - Diğer (açıklama alanı ile)

- **Temel Bilgiler (Tüm Kategoriler):**
  - Kategori (zorunlu)
  - Seri numarası (opsiyonel, unique kontrolü)
  - Marka
  - Model
  - Durum (Boşta, Sahipli, Arızalı, Eski)
  - Oluşturulma/güncellenme tarihleri
  - Soft delete (is_active flag)

- **Dinamik Alanlar (Kategoriye Göre):**
  - **Bilgisayarlar (Dizüstü/Masaüstü):**
    - WiFi MAC adresi
    - LAN MAC adresi
    - CPU bilgisi
    - GPU bilgisi
    - RAM bilgisi
    - Depolama bilgisi
    - Aksesuarlar (dinamik liste, max 10)
      - Kablolu Klavye
      - Kablosuz Klavye
      - Kablolu Fare
      - Kablosuz Fare
      - Monitör
      - Hoparlör
      - Webcam
      - USB Hub
      - Adaptör
      - Diğer

  - **Telefonlar (Cep/Masa):**
    - WiFi MAC adresi (sadece cep telefonu)
    - Aksesuarlar (dinamik liste, max 10)
      - Şarj Aleti
      - Kablo
      - Koruyucu Cam
      - Kılıf
      - Kulaklık
      - Diğer

  - **Tablet:**
    - WiFi MAC adresi
    - Aksesuarlar (dinamik liste, max 10)
      - Şarj Aleti
      - Kablo
      - Koruyucu Cam
      - Kılıf
      - Klavyeli Kılıf
      - Kalem
      - Diğer

  - **Monitör:**
    - Sadece temel bilgiler (seri no, marka, model)

  - **Diğer:**
    - Açıklama alanı (zorunlu)
    - Sadece temel bilgiler (seri no, marka, model)

### 3. Zimmet Atama Sistemi
- **Zimmet Atama:**
  - Çalışan seçimi (aktif çalışanlar)
  - Donanım seçimi (boşta olan donanımlar)
  - Atama tarihi (otomatik)
  - Notlar (opsiyonel)

- **Zimmet İade:**
  - İade tarihi (otomatik)
  - İade nedeni
  - Notlar

- **Zimmet Durumu:**
  - Aktif zimmetler
  - İade edilmiş zimmetler
  - Zimmet geçmişi

### 4. Geçmiş ve Raporlama
- **Donanım Geçmişi:**
  - Belirli bir donanımın tüm zimmet kayıtları
  - Çalışan bilgileri
  - Atama/iade tarihleri
  - Notlar

- **Çalışan Geçmişi:**
  - Belirli bir çalışanın tüm zimmet kayıtları
  - Donanım bilgileri
  - Atama/iade tarihleri
  - Notlar

- **Sistem Geçmişi (Audit Log):**
  - Tüm CRUD işlemleri
  - Hangi tabloda ne değişti
  - Eski ve yeni değerler
  - İşlem tarihi
  - İşlem türü (Eklendi, Güncellendi, Silindi)

### 5. Kullanıcı Arayüzü
- **Responsive Tasarım:**
  - Bootstrap 5 framework
  - Mobil uyumlu
  - Modern ve temiz arayüz

- **Tema Desteği:**
  - Açık tema (varsayılan)
  - Koyu tema
  - Tema tercihi localStorage'da saklanır

- **Tab Yapısı:**
  - Çalışanlar
  - Donanımlar
  - Zimmet Atamaları
  - Geçmiş

- **Dinamik Formlar:**
  - Kategori seçimine göre alanların gösterilmesi/gizlenmesi
  - Aksesuar ekleme/çıkarma (max 10)
  - Form validasyonu

## 🛠️ Teknik Gereksinimler

### Backend
- **Platform:** Node.js
- **Framework:** Express.js
- **Veritabanı:** SQLite
- **Port:** 3002
- **Modüler Yapı:**
  - `server.js` - Ana sunucu
  - `api/` - Backend API
    - `routes/` - API route'ları
      - `employees.js` - Çalışan işlemleri
      - `equipment.js` - Donanım işlemleri
      - `assignments.js` - Zimmet işlemleri
      - `history.js` - Geçmiş işlemleri
    - `controllers/` - İş mantığı
      - `employeeController.js` - Çalışan iş mantığı
      - `equipmentController.js` - Donanım iş mantığı
      - `assignmentController.js` - Zimmet iş mantığı
      - `historyController.js` - Geçmiş iş mantığı
    - `models/` - Veri modelleri
      - `Employee.js` - Çalışan modeli
      - `Equipment.js` - Donanım modeli
      - `Assignment.js` - Zimmet modeli
      - `AuditLog.js` - Audit log modeli
    - `services/` - Servis katmanı
      - `databaseService.js` - Veritabanı işlemleri
      - `auditService.js` - Audit log servisi
      - `validationService.js` - Validasyon servisi
    - `utils/` - Yardımcı fonksiyonlar
      - `database.js` - Veritabanı bağlantısı ve şema
      - `constants.js` - Sabitler
      - `helpers.js` - Yardımcı fonksiyonlar
    - `middleware/` - Middleware'ler
      - `auth.js` - Kimlik doğrulama
      - `validation.js` - Validasyon middleware
      - `errorHandler.js` - Hata yönetimi

### Frontend
- **HTML5** - Semantik yapı
- **CSS3** - Özel stiller + Bootstrap 5
- **JavaScript (Vanilla)** - ES6+ özellikleri
- **Font Awesome** - İkonlar
- **Responsive Design** - Mobil uyumlu

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 2024  
**Hazırlayan:** AI Assistant  
**Onaylayan:** IT Manager