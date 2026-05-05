# OwoPay - Digital Product Marketplace

Aplikasi website jual produk digital (pulsa, e-wallet, voucher game, dll) dengan sistem manual berbasis transaksi saldo. Panel admin lengkap + website frontend modern.

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Socket.io Client (WebSocket)

### Backend
- NestJS 11
- Prisma ORM
- MySQL
- JWT Auth + PIN 6 digit
- Socket.io (WebSocket)

---

## Setup Lokal (Development)

### 1. Clone Repo
```bash
git clone https://github.com/lexazor/owopay.git
cd owopay
```

### 2. Backend
```bash
cd backend
npm install
```

Buat file `backend/.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/owopay"
JWT_SECRET="your-secret-key-minimal-32-karakter"
PORT=3001
```

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
Backend berjalan di `http://localhost:3001`

### 3. Frontend
```bash
cd frontend
npm install
```

Buat file `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

```bash
npm run dev
```
Frontend berjalan di `http://localhost:3000`

---

# Panduan Deploy ke VPS (aaPanel + Ubuntu) - Untuk Pemula

> Panduan ini dibuat step-by-step sangat detail agar pemula pun bisa mengikuti.

## Daftar Isi
1. [Persiapan Server](#1-persiapan-server-aapanel)
2. [Install Otomatis dengan Script](#2-cara-cepat-install-otomatis-dengan-script)
3. [Install Manual (Step-by-Step)](#3-install-manual-step-by-step)
4. [Setup Nginx](#4-setup-nginx-aapanel)
5. [Setup SSL (HTTPS)](#5-setup-ssl-https)
6. [Firewall & Keamanan](#6-firewall--keamanan)
7. [Update Project](#7-update-project-masa-depan)
8. [Troubleshooting](#8-troubleshooting)
9. [Backup](#9-backup)

---

## 1. Persiapan Server (aaPanel)

### A. Install Requirement di aaPanel App Store
1. Login ke aaPanel Anda
2. Buka menu **App Store**
3. Install satu per satu:
   - **Node.js version manager** → Install Node.js **20.x LTS**
   - **MySQL** → Install MySQL **8.0** atau **5.7**
   - **Nginx** → Biasanya sudah terinstall otomatis saat install aaPanel
   - **PM2 Manager** → Install dari App Store (untuk menjalankan backend)

### B. Buat Database di aaPanel
1. aaPanel → **Database** → **Add Database**
2. Isi form berikut:
   - Database name: `owopay`
   - Username: `owopay_user`
   - Password: buat password yang kuat (contoh: `OwoPay2025!Secure`)
   - Access: `localhost`
3. Klik **Submit**
4. **Simpan** username dan password database ini! Nanti dimasukkan saat install.

---

## 2. Cara Cepat: Install Otomatis dengan Script

> Cara ini **paling mudah** dan **direkomendasikan** untuk pemula.

### A. Upload Script ke Server
1. Buka **Terminal** di aaPanel, atau login SSH ke VPS Anda
2. Masuk sebagai root:
```bash
sudo su
```

### B. Download & Jalankan Script
```bash
cd /root
curl -O https://raw.githubusercontent.com/lexazor/owopay/main/install.sh
bash install.sh
```

Atau jika sudah clone manual:
```bash
cd /www/wwwroot/owopay
bash install.sh
```

### C. Ikuti Wizard
Script akan menanyakan beberapa hal:
- Nama Database → isi `owopay`
- Username Database → isi `owopay_user`
- Password Database → paste password yang tadi dibuat
- JWT Secret → biarkan default (auto-generate)
- Port Backend → biarkan `3001`
- Domain Frontend → isi domain Anda, contoh: `owopay.com`
- Domain Backend → biarkan default `api.owopay.com`
- Aktifkan SSL? → ketik `y`

Script akan otomatis:
- Clone repo dari GitHub
- Install dependency backend & frontend
- Generate Prisma & build backend
- Build frontend
- Jalankan backend dengan PM2
- Buat file environment (.env)

Setelah selesai, lanjut ke [Step 4 Setup Nginx](#4-setup-nginx-aapanel).

---

## 3. Install Manual (Step-by-Step)

> Jika ingin memahami prosesnya secara detail, ikuti panduan manual ini.

### Step 1: Clone Project
```bash
cd /www/wwwroot
git clone https://github.com/lexazor/owopay.git owopay
cd owopay
```

### Step 2: Setup Backend
```bash
cd /www/wwwroot/owopay/backend

# Install dependencies
npm install

# Buat file environment
nano .env
```

Isi file `.env`:
```env
DATABASE_URL="mysql://owopay_user:PASSWORD_KAMU@localhost:3306/owopay"
JWT_SECRET="random-string-panjang-minimal-32-karakter"
PORT=3001
```

**Ganti** `PASSWORD_KAMU` dengan password database yang tadi dibuat.

Tekan `CTRL + X`, lalu `Y`, lalu `Enter` untuk menyimpan.

#### Generate Prisma & Migrate Database
```bash
npx prisma generate
npx prisma migrate deploy
```

#### Seed Data Awal (kategori, provider, dll)
```bash
npx ts-node prisma/seed.ts
```

#### Build & Jalankan Backend dengan PM2
```bash
npm run build

# Jalankan dengan PM2
pm2 start dist/src/main.js --name owopay-api

# Simpan config PM2 (agar auto-start saat reboot)
pm2 save
pm2 startup
```

#### Cek Backend Berjalan
```bash
curl http://localhost:3001/api/categories
```
Jika muncul JSON array, berarti backend sudah jalan.

### Step 3: Setup Frontend
```bash
cd /www/wwwroot/owopay/frontend

# Install dependencies
npm install

# Buat file environment
nano .env.local
```

Isi file `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.domainkamu.com/api
NEXT_PUBLIC_WS_URL=https://api.domainkamu.com
```

**Ganti** `api.domainkamu.com` dengan domain backend Anda.

Tekan `CTRL + X`, lalu `Y`, lalu `Enter` untuk menyimpan.

#### Build Frontend (Static Export)
```bash
npm run build
```

Hasil build akan ada di folder:
```
/www/wwwroot/owopay/frontend/dist/
```

> Catatan: Next.js static export menghasilkan file HTML/CSS/JS statis di folder `dist/`. Folder ini yang akan disajikan oleh Nginx.

---

## 4. Setup Nginx (aaPanel)

### A. Buat Site untuk Frontend
1. Buka aaPanel → **Website** → **Add Site**
2. Isi form:
   - Domain: `domainkamu.com` (ganti dengan domain Anda)
   - Root directory: `/www/wwwroot/owopay/frontend/dist`
   - PHP version: **Pure static**
3. Klik **Submit**

### B. Edit Nginx Config untuk Frontend (2 Opsi)

Anda punya **2 pilihan** untuk mengatur Nginx:

#### Opsi 1: Edit File Config Nginx Langsung (Direkomendasikan)

1. aaPanel → **Website** → Klik nama domain → **Config files**
2. Edit file `nginx.conf`, ganti seluruh isinya dengan:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name domainkamu.com;
    index index.html index.htm;
    root /www/wwwroot/owopay/frontend/dist;

    # SSL (jika sudah apply SSL di aaPanel)
    ssl_certificate /www/server/panel/vhost/cert/domainkamu.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/domainkamu.com/privkey.pem;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js static export fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Ganti** `domainkamu.com` dengan domain Anda.

3. Klik **Save**
4. Klik **Reload** Nginx

#### Opsi 2: Gunakan Reverse Proxy (seperti setup Backend)

Jika Anda ingin mengatur frontend juga sebagai reverse proxy (misal untuk kebutuhan khusus), caranya:

1. aaPanel → **Website** → **Add Site**
2. Pilih tab **Reverse Proxy**
3. Target URL: `http://localhost:3000` (jika Next.js dev server jalan)
   
   Atau jika menggunakan static export, lebih baik gunakan **Opsi 1** di atas.

> **Saran**: Untuk production dengan static export, gunakan **Opsi 1** (direct root folder). Reverse Proxy lebih cocok untuk backend.

### C. Buat Subdomain/Path untuk Backend (Reverse Proxy)

#### Opsi A - Subdomain (Paling Direkomendasikan)

1. aaPanel → **Website** → **Add Site**
2. Pilih tab **Reverse Proxy**
3. Isi:
   - Domain: `api.domainkamu.com`
   - Target URL: `http://localhost:3001`
   - Send Domain: centang / aktifkan
4. Klik **Submit**

#### Opsi B - Path `/api/` (jika pakai 1 domain saja)

Jika tidak mau pakai subdomain, tambahkan ini di config nginx frontend (Opsi 1 di atas), di dalam block `server { ... }`:

```nginx
# API Proxy
location /api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Uploads Proxy
location /uploads/ {
    proxy_pass http://localhost:3001/uploads/;
}

# WebSocket support
location /socket.io/ {
    proxy_pass http://localhost:3001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

> Catatan: Jika pakai Opsi B, ubah juga `NEXT_PUBLIC_API_URL` di frontend menjadi `https://domainkamu.com/api` (tanpa subdomain).

---

## 5. Setup SSL (HTTPS)

Agar website bisa diakses dengan `https://`, Anda perlu install SSL:

### Untuk Domain Frontend
1. aaPanel → **Website** → Klik domain frontend → **SSL**
2. Pilih tab **Let's Encrypt**
3. Centang domain utama dan www subdomain (jika ada)
4. Klik **Apply**
5. Tunggu sampai selesai (biasa 1-2 menit)

### Untuk Subdomain Backend
1. Ulangi langkah yang sama untuk `api.domainkamu.com`
2. aaPanel → **Website** → Klik domain backend → **SSL** → **Let's Encrypt**
3. Apply

> **Penting**: SSL wajib diinstall agar tidak ada masalah CORS/Mixed Content saat frontend mengakses backend.

---

## 6. Firewall & Keamanan

### Jika Menggunakan UFW (Ubuntu Firewall)
```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443

# Backend tidak perlu expose langsung ke internet
# Backend hanya boleh diakses via localhost/nginx

# Aktifkan firewall
ufw enable
```

### Setup Permission Folder Uploads
```bash
cd /www/wwwroot/owopay/backend
mkdir -p uploads
chmod 755 uploads
chown -R www:www uploads
```

---

## 7. Update Project (Masa Depan)

Ketika ada update kode dari GitHub, ikuti langkah ini:

### Update Backend
```bash
cd /www/wwwroot/owopay/backend

# Ambil kode terbaru
git pull origin main

# Install dependency baru (jika ada)
npm install

# Migrate database (jika ada perubahan schema)
npx prisma migrate deploy
npx prisma generate

# Build ulang
npm run build

# Restart PM2
pm2 restart owopay-api

# Cek logs jika ada error
pm2 logs owopay-api
```

### Update Frontend
```bash
cd /www/wwwroot/owopay/frontend

# Ambil kode terbaru
git pull origin main

# Install dependency baru (jika ada)
npm install

# Build ulang
npm run build

# Reload Nginx (jika config berubah)
/etc/init.d/nginx reload
```

### Restart Semua Services
```bash
pm2 restart owopay-api
/etc/init.d/nginx reload
```

---

## 8. Troubleshooting

### Error: `Connection refused localhost:3001`
- Cek status PM2: `pm2 status`
- Cek log backend: `pm2 logs owopay-api`
- Pastikan backend jalan: `curl http://localhost:3001/api/categories`
- Jika belum jalan, start ulang: `pm2 start owopay-api`

### Error: `EACCES: permission denied, open 'uploads/...'`
```bash
chown -R www:www /www/wwwroot/owopay/backend/uploads
chmod 755 /www/wwwroot/owopay/backend/uploads
```

### Error: `Cannot find module '@prisma/client'`
```bash
cd /www/wwwroot/owopay/backend
npx prisma generate
npm run build
pm2 restart owopay-api
```

### Error: `NEXT_PUBLIC_API_URL` tidak terbaca / API tidak terhubung
- Pastikan file `.env.local` di frontend sudah benar
- Rebuild frontend setelah ubah env: `npm run build`
- Pastikan URL-nya pakai `https://` jika SSL sudah aktif

### Error: CORS di browser console
- Pastikan backend `app.enableCors({ origin: '*' })` atau set origin spesifik domain Anda
- Jika pakai reverse proxy subdomain, CORS seharusnya tidak masalah karena same-origin

### Halaman frontend blank / putih
- Cek Nginx error log: `/www/wwwlogs/domainkamu.com.error.log`
- Pastikan folder root benar: `/www/wwwroot/owopay/frontend/dist`
- Pastikan sudah build frontend: `cd frontend && npm run build`

### Database connection error
- Pastikan MySQL sudah jalan: `systemctl status mysql`
- Cek password di `.env` backend sudah benar
- Pastikan user database punya akses dari `localhost`

---

## 9. Backup

### Backup Database (Manual)
```bash
mysqldump -u owopay_user -p owopay > backup-$(date +%F).sql
```

### Backup Uploads Folder
```bash
cd /www/wwwroot/owopay/backend
tar -czf uploads-backup-$(date +%F).tar.gz uploads/
```

### Auto Backup dengan Cron (aaPanel)
1. aaPanel → **Cron** → **Add Task**
2. Pilih:
   - Type: Backup Database
   - Database: owopay
   - Frequency: Daily (setiap hari) atau Weekly (mingguan)
3. Klik **Submit**

---

## Verifikasi Deployment

Setelah semua langkah selesai, cek dengan tabel berikut:

| Test | Cara Cek |
|------|----------|
| API Health | Buka browser: `https://api.domainkamu.com/api/categories` |
| Frontend | Buka browser: `https://domainkamu.com` |
| Upload | Coba upload bukti transfer di halaman deposit |
| WebSocket | Buka console browser (F12 → Console), cek socket connection |
| SSL | Kunci hijau di address bar browser |

---

## Struktur Aplikasi

### User Routes
- `/login` - Login user
- `/register` - Registrasi user
- `/setup-pin` - Setup PIN 6 digit
- `/dashboard` - Dashboard user dengan saldo dan kategori
- `/deposit` - Deposit saldo
- `/layanan/[kategori]` - Pilih provider
- `/layanan/[kategori]/[provider]` - Pilih produk
- `/layanan/checkout` - Checkout produk
- `/riwayat` - Riwayat transaksi
- `/profil` - Profil user

### Admin Routes
- `/admin/dashboard` - Dashboard admin
- `/admin/kategori` - Manajemen kategori
- `/admin/provider` - Manajemen provider
- `/admin/produk` - Manajemen produk
- `/admin/metode-pembayaran` - Manajemen metode pembayaran
- `/admin/deposit` - Manajemen deposit
- `/admin/transaksi` - Manajemen transaksi
- `/admin/users` - Manajemen user

## Fitur

- Autentikasi dengan JWT + PIN 6 digit
- Transaksi saldo untuk pembelian produk digital
- Sistem deposit manual dengan upload bukti transfer
- Panel admin lengkap (CRUD kategori, provider, produk, metode pembayaran)
- Real-time notification via WebSocket
- Responsive mobile-first design
- Animasi Framer Motion di seluruh aplikasi

---

## Butuh Bantuan?

Jika mengalami kendala saat deploy, cek:
1. Log backend: `pm2 logs owopay-api`
2. Log Nginx: `/www/wwwlogs/domainkamu.com.error.log`
3. Pastikan semua requirement terinstall dengan benar

Repo: https://github.com/lexazor/owopay.git
