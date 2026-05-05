# Panduan Deploy OwoPay ke VPS (aaPanel + Ubuntu)

## 1. Persiapan Server (aaPanel)

### Install Requirement di aaPanel App Store
1. **Node.js version manager** → Install Node.js **20.x LTS**
2. **MySQL** → Install MySQL **8.0** atau **5.7**
3. **Nginx** → Sudah biasanya terinstall otomatis
4. **PM2 Manager** → Install dari aaPanel App Store (untuk manage Node.js process)

### Buat Database di aaPanel
1. Buka aaPanel → Database → Add Database
2. Database name: `owopay`
3. Username: `owopay_user` (atau root)
4. Password: buat password kuat, simpan
5. Grant all privileges ke database `owopay`

---

## 2. Clone Project ke Server

```bash
cd /www/wwwroot
git clone https://github.com/username/owopay.git owopay
cd owopay
```

---

## 3. Setup Backend

```bash
cd /www/wwwroot/owopay/backend

# Install dependencies
npm install

# Setup environment
nano .env
```

Isi `.env`:
```env
DATABASE_URL="mysql://owopay_user:PASSWORD_KAMU@localhost:3306/owopay"
JWT_SECRET="random-string-panjang-minimal-32-karakter"
PORT=3001
```

### Generate Prisma & Migrate
```bash
npx prisma generate
npx prisma migrate deploy
```

### Seed Data Awal
```bash
npx ts-node prisma/seed.ts
```

### Build & Jalankan dengan PM2
```bash
npm run build

# Jalankan dengan PM2
pm2 start dist/main.js --name owopay-api

# Save config PM2
pm2 save
pm2 startup
```

### Cek Backend Berjalan
```bash
curl http://localhost:3001/api/categories
```

---

## 4. Setup Frontend

```bash
cd /www/wwwroot/owopay/frontend

# Install dependencies
npm install

# Setup environment
nano .env.local
```

Isi `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.domainkamu.com/api
NEXT_PUBLIC_WS_URL=https://api.domainkamu.com
```

**Catatan**: Ganti `api.domainkamu.com` dengan subdomain atau path backend kamu.

### Build Frontend (Static Export)
```bash
npm run build
```

Hasil build ada di folder `frontend/dist/` atau `frontend/out/`.

---

## 5. Setup Nginx (aaPanel Website)

### Buat Site untuk Frontend
1. aaPanel → Website → Add Site
2. Domain: `domainkamu.com`
3. Root directory: `/www/wwwroot/owopay/frontend/dist` (atau `out`)
4. PHP version: Pure static

### Edit Nginx Config untuk Frontend
Klik site → Config files → Edit `nginx.conf`:

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

    # Gzip
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

### Buat Subdomain/Path untuk Backend (Reverse Proxy)
**Opsi A - Subdomain (Recommended):**
1. Add Site baru: `api.domainkamu.com`
2. Type: Reverse Proxy
3. Target URL: `http://localhost:3001`

**Opsi B - Path `/api/` (jika pakai 1 domain):**
Tambahkan di nginx config frontend:
```nginx
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

### Apply SSL
1. Website → domain → SSL → Let's Encrypt
2. Centang domain dan www subdomain
3. Apply

---

## 6. Setup Firewall (jika pakai Cloudflare/UFW)

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443

# Backend hanya boleh diakses via localhost/nginx (tidak expose langsung)
# Jika perlu expose direct (tidak direkomendasikan):
# ufw allow 3001

ufw enable
```

---

## 7. Setup Uploads Folder Permission

```bash
cd /www/wwwroot/owopay/backend
mkdir -p uploads
chmod 755 uploads
chown -R www:www uploads
```

---

## 8. Verifikasi Deployment

| Test | Command/URL |
|------|-------------|
| API Health | `curl https://api.domainkamu.com/api/categories` |
| Frontend | Buka `https://domainkamu.com` di browser |
| Upload | Coba upload bukti transfer di halaman deposit |
| WebSocket | Cek console browser untuk socket connection |

---

## 9. Update Project (Masa Depan)

### Update Backend
```bash
cd /www/wwwroot/owopay/backend

# Pull latest code
git pull origin main

# Install deps baru (jika ada)
npm install

# Migrate database (jika ada schema baru)
npx prisma migrate deploy
npx prisma generate

# Rebuild
npm run build

# Restart PM2
pm2 restart owopay-api

# Cek logs jika ada error
pm2 logs owopay-api
```

### Update Frontend
```bash
cd /www/wwwroot/owopay/frontend

# Pull latest code
git pull origin main

# Install deps baru
npm install

# Rebuild
npm run build

# Nginx reload (jika config berubah)
/etc/init.d/nginx reload
```

### Restart Semua Services
```bash
pm2 restart owopay-api
/etc/init.d/nginx reload
```

---

## 10. Troubleshooting

### Error: `Connection refused localhost:3001`
- Cek PM2: `pm2 status`
- Cek log: `pm2 logs owopay-api`
- Pastikan backend jalan: `curl http://localhost:3001/api/categories`

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

### Error: `NEXT_PUBLIC_API_URL` tidak terbaca
- Pastikan file `.env.local` di frontend sudah benar
- Rebuild frontend setelah ubah env: `npm run build`

### CORS Error di browser
- Pastikan backend `app.enableCors({ origin: '*' })` atau set origin spesifik domain kamu
- Jika pakai reverse proxy, CORS seharusnya tidak masalah karena same-origin

---

## 11. Backup (Opsional tapi Recommended)

### Backup Database (aaPanel)
1. aaPanel → Database → Backup → Add Backup Task
2. Atau manual: `mysqldump -u owopay_user -p owopay > backup.sql`

### Backup Uploads Folder
```bash
cd /www/wwwroot/owopay/backend
tar -czf uploads-backup-$(date +%F).tar.gz uploads/
```

### Auto Backup dengan Cron (aaPanel)
aaPanel → Cron → Add Task
- Type: Backup Database
- Database: owopay
- Frequency: Daily/Weekly
