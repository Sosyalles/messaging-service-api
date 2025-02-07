# Mesajlaşma Servisi API

Real-time mesajlaşma servisi API'si, TypeScript, Express.js, PostgreSQL, Socket.IO ve RabbitMQ kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- ✨ Real-time mesajlaşma
- 🔐 User Management Service ile merkezi kimlik doğrulama
- 📝 Mesaj okuma/yazma durumu takibi
- 🔄 Mesaj geçmişi ve sohbet yönetimi
- 📦 RabbitMQ ile mesaj kuyruklama
- 📊 Kapsamlı loglama sistemi
- 📚 Swagger ile API dokümantasyonu

## 🛠️ Teknolojiler

- **Backend:** Node.js, Express.js, TypeScript
- **Veritabanı:** PostgreSQL, Sequelize ORM
- **Real-time:** Socket.IO
- **Message Queue:** RabbitMQ
- **Dokümantasyon:** Swagger/OpenAPI
- **Konteynerizasyon:** Docker, Docker Compose
- **Test:** Jest
- **Loglama:** Winston

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- PostgreSQL (v15 veya üzeri)
- RabbitMQ (v3.12 veya üzeri)
- Docker ve Docker Compose (opsiyonel)

## 🚀 Kurulum

### 1. Projeyi Klonlama

```bash
git clone https://github.com/kullaniciadi/messaging-service-api.git
cd messaging-service-api
```

### 2. Bağımlılıkları Yükleme

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlama

`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri ayarlayın:

```bash
cp .env.example .env
```

Önemli ortam değişkenleri:
- `PORT`: API port numarası
- `DB_HOST`: PostgreSQL sunucu adresi
- `DB_PORT`: PostgreSQL port numarası
- `DB_NAME`: Veritabanı adı
- `DB_USER`: Veritabanı kullanıcı adı
- `DB_PASSWORD`: Veritabanı şifresi
- `JWT_SECRET`: JWT token şifreleme anahtarı
- `RABBITMQ_URL`: RabbitMQ bağlantı URL'i

### 4. Veritabanı Kurulumu

```bash
# PostgreSQL'de veritabanını oluşturma
createdb messaging_db

# Migrasyon ve seed işlemlerini çalıştırma
npm run db:migrate
npm run db:seed
```

### 5. Uygulamayı Başlatma

#### Development Modunda
```bash
npm run dev
```

#### Production Modunda
```bash
npm run build
npm start
```

#### Docker ile
```bash
docker-compose up -d
```

## 📝 API Kullanımı

API dokümantasyonuna `http://localhost:3000/api-docs` adresinden erişebilirsiniz.

### Temel Endpoint'ler

1. **Mesaj Gönderme**
   ```http
   POST /api/messages/send
   ```

2. **Sohbet Mesajlarını Listeleme**
   ```http
   GET /api/messages/conversation/:receiverId
   ```

3. **Tüm Sohbetleri Listeleme**
   ```http
   GET /api/messages/conversations
   ```

4. **Mesaj Silme**
   ```http
   DELETE /api/messages/:messageId
   ```

5. **Okunmamış Mesajları Listeleme**
   ```http
   GET /api/messages/unread
   ```

6. **Mesajı Okundu Olarak İşaretleme**
   ```http
   PATCH /api/messages/:messageId/read
   ```

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Rate limiting
- CORS politikaları
- Request sanitization
- Güvenlik başlıkları

## 📊 Loglama

Loglar `logs` dizininde tutulur:
- `logs/error.log`: Hata logları
- `logs/combined.log`: Tüm loglar

## 🧪 Test

```bash
# Tüm testleri çalıştırma
npm test

# Test coverage raporu
npm run test:coverage
```

## 🐳 Docker

Docker ile çalıştırmak için:

```bash
# Servisleri başlatma
docker-compose up -d

# Logları görüntüleme
docker-compose logs -f

# Servisleri durdurma
docker-compose down
```

## 🔧 Sorun Giderme

1. **Veritabanı Bağlantı Hatası**
   - PostgreSQL servisinin çalıştığından emin olun
   - Veritabanı kimlik bilgilerini kontrol edin
   - Veritabanının oluşturulduğundan emin olun

2. **RabbitMQ Bağlantı Hatası**
   - RabbitMQ servisinin çalıştığından emin olun
   - Bağlantı URL'ini kontrol edin

3. **Port Çakışması**
   - Belirtilen portların kullanılabilir olduğundan emin olun
   - `.env` dosyasında port numaralarını değiştirin

## 📜 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- Proje Sorumlusu: [Ad Soyad](mailto:email@example.com)
- Proje Issues: [GitHub Issues](https://github.com/kullaniciadi/messaging-service-api/issues)

## 🙏 Teşekkürler

Bu projeye katkıda bulunan herkese teşekkürler! 