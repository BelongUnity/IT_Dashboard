# IT Envanter ve Zimmet Takip Sistemi

Modern, kullanıcı dostu ve kapsamlı IT ekipman yönetim sistemi.

## 🚀 Özellikler

### 📋 Çalışan Yönetimi
- Çalışan ekleme, düzenleme ve silme
- Departman ve pozisyon takibi
- İletişim bilgileri yönetimi
- Soft delete ile veri korunması

### 💻 Donanım Yönetimi
- **Desteklenen Kategoriler:**
  - Dizüstü Bilgisayar
  - Masaüstü Bilgisayar
  - Cep Telefonu
  - Masa Telefonu
  - Tablet
  - Monitör
  - Diğer

- **Dinamik Alanlar:**
  - Kategoriye göre özel bilgi alanları
  - MAC adresi, CPU, GPU, RAM, depolama bilgileri
  - Aksesuar yönetimi (maksimum 10 adet)
  - Seri numarası takibi

### 🤝 Zimmet Atama Sistemi
- Çalışan-donanım eşleştirme
- Atama ve iade işlemleri
- Zimmet geçmişi takibi
- Otomatik durum güncellemeleri

### 📊 Geçmiş ve Raporlama
- Sistem audit log'ları
- Donanım geçmişi
- Çalışan geçmişi
- Detaylı işlem kayıtları

### 🎨 Kullanıcı Arayüzü
- **Responsive Tasarım:** Mobil uyumlu
- **Tema Desteği:** Açık/koyu tema
- **Modern UI:** Bootstrap 5 + Font Awesome
- **Kullanıcı Dostu:** Sezgisel navigasyon

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Veritabanı
- **RESTful API** - API tasarımı

### Frontend
- **HTML5** - Semantik yapı
- **CSS3** - Modern stiller
- **JavaScript (ES6+)** - Vanilla JS
- **Bootstrap 5** - UI framework
- **Font Awesome** - İkonlar

## 📦 Kurulum

### Gereksinimler
- Node.js (v14.0.0 veya üzeri)
- npm (Node Package Manager)

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/BelongUnity/IT_Dashboard.git
cd IT_Dashboard
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Sunucuyu başlatın:**
```bash
npm start
```

4. **Tarayıcıda açın:**
```
http://localhost:3002
```

## 🔐 Güvenlik ve Erişim

### Admin Girişi
- **Kullanıcı Adı:** `admin`
- **Şifre:** `SarynPrime`
- **Oturum Süresi:** 10 dakika (inaktivite sonrası otomatik çıkış)

### Network Erişimi
- **Local:** `http://localhost:3002`
- **Network:** `http://[YOUR_IP]:3002`
- **Port:** 3002 (firewall'da otomatik açılır)

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

---

**Not:** Bu sistem development ortamı için tasarlanmıştır. Production kullanımı için ek güvenlik önlemleri alınmalıdır.