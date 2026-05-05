# OwoPay - Digital Product Marketplace

Aplikasi website jual produk digital (pulsa, e-wallet, dll) dengan sistem manual berbasis transaksi saldo.

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
- JWT Auth
- Socket.io (WebSocket)

## Setup

### Backend

1. Install dependencies:
```bash
cd backend
npm install
```

2. Setup environment variables in `backend/.env`:
```
DATABASE_URL="mysql://user:password@localhost:3306/owopay"
JWT_SECRET="your-secret-key"
```

3. Generate Prisma client & run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start development server:
```bash
npm run start:dev
```

Backend akan berjalan di `http://localhost:3001`

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Setup environment variables in `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

3. Build dan jalankan:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

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
