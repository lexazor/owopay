#!/bin/bash

# =============================================================================
# OwoPay - Auto Install Script untuk VPS (aaPanel / Ubuntu)
# GitHub: https://github.com/lexazor/owopay.git
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_DIR="/www/wwwroot/owopay"
REPO_URL="https://github.com/lexazor/owopay.git"

echo -e "${CYAN}"
echo "  ____  _    ____        __  ____"
echo " / __ \| |  / / /  ____ _/ /_/ __ \____ _"
echo "/ /_/ /| | / / /  / __ \`/ __/ /_/ / __ \`/"
echo "\__, / | |/ / /___/ /_/ / /_/ ____/ /_/ /"
echo "/____/  |___/_____/\__,_/\__/_/    \__,_/"
echo -e "${NC}"
echo -e "${GREEN}Auto Installer untuk VPS (aaPanel + Ubuntu)${NC}"
echo "=========================================="

# =============================================================================
# Cek Root
# =============================================================================
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR]${NC} Script harus dijalankan sebagai root atau dengan sudo."
  echo "Contoh: sudo bash install.sh"
  exit 1
fi

# =============================================================================
# Fungsi Helper
# =============================================================================
ask() {
  local prompt="$1"
  local default="$2"
  local input
  read -p "$prompt [$default]: " input
  echo "${input:-$default}"
}

ask_required() {
  local prompt="$1"
  local input
  while true; do
    read -p "$prompt: " input
    if [ -n "$input" ]; then
      echo "$input"
      break
    else
      echo -e "${RED}Input tidak boleh kosong!${NC}"
    fi
  done
}

ask_password() {
  local prompt="$1"
  local input
  while true; do
    read -s -p "$prompt: " input
    echo ""
    if [ -n "$input" ]; then
      echo "$input"
      break
    else
      echo -e "${RED}Password tidak boleh kosong!${NC}"
    fi
  done
}

run_step() {
  local msg="$1"
  local cmd="$2"
  echo -e "${BLUE}[STEP]${NC} $msg ..."
  if eval "$cmd"; then
    echo -e "${GREEN}[OK]${NC} $msg selesai."
  else
    echo -e "${RED}[FAIL]${NC} $msg gagal!"
    exit 1
  fi
}

# =============================================================================
# Input dari User
# =============================================================================
echo ""
echo -e "${YELLOW}=== Konfigurasi Database ===${NC}"
DB_NAME=$(ask "Nama Database" "owopay")
DB_USER=$(ask "Username Database" "owopay_user")
DB_PASS=$(ask_password "Password Database")
echo ""

JWT_SECRET=$(ask "JWT Secret" "$(openssl rand -hex 32)")
API_PORT=$(ask "Port Backend" "3001")

echo ""
echo -e "${YELLOW}=== Konfigurasi Domain ===${NC}"
FRONTEND_DOMAIN=$(ask_required "Domain Frontend (contoh: owopay.com)")
API_DOMAIN=$(ask "Domain Backend (contoh: api.owopay.com)" "api.$FRONTEND_DOMAIN")
USE_SSL=$(ask "Aktifkan SSL? (y/n)" "y")

echo ""
echo -e "${YELLOW}=== Ringkasan Konfigurasi ===${NC}"
echo "Database     : $DB_NAME"
echo "DB User      : $DB_USER"
echo "DB Password  : ********"
echo "JWT Secret   : ${JWT_SECRET:0:10}..."
echo "Backend Port : $API_PORT"
echo "Frontend URL : https://$FRONTEND_DOMAIN"
echo "Backend URL  : https://$API_DOMAIN"
echo ""

CONFIRM=$(ask "Lanjutkan install? (y/n)" "y")
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo -e "${RED}Install dibatalkan.${NC}"
  exit 0
fi

# =============================================================================
# Step 1: Install Dependencies (jika belum ada)
# =============================================================================
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  STEP 1: Cek & Install Dependencies${NC}"
echo -e "${CYAN}========================================${NC}"

# Cek Node.js
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}[INFO]${NC} Node.js belum terinstall. Menginstall Node.js 20.x ..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}[WARN]${NC} Node.js versi $(node -v) terdeteksi. Direkomendasikan Node.js 20+."
    echo "Lanjutkan? (y/n)"
    read -r cont
    if [ "$cont" != "y" ]; then exit 1; fi
  fi
  echo -e "${GREEN}[OK]${NC} Node.js $(node -v) sudah terinstall."
fi

# Cek PM2
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}[INFO]${NC} PM2 belum terinstall. Menginstall PM2 ..."
  npm install -g pm2
else
  echo -e "${GREEN}[OK]${NC} PM2 sudah terinstall."
fi

# Cek Git
if ! command -v git &> /dev/null; then
  echo -e "${YELLOW}[INFO]${NC} Git belum terinstall. Menginstall Git ..."
  apt-get update && apt-get install -y git
else
  echo -e "${GREEN}[OK]${NC} Git sudah terinstall."
fi

# =============================================================================
# Step 2: Clone Repository
# =============================================================================
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  STEP 2: Clone Repository${NC}"
echo -e "${CYAN}========================================${NC}"

if [ -d "$PROJECT_DIR" ]; then
  echo -e "${YELLOW}[WARN]${NC} Folder $PROJECT_DIR sudah ada."
  BACKUP_DIR="${PROJECT_DIR}-backup-$(date +%Y%m%d%H%M%S)"
  mv "$PROJECT_DIR" "$BACKUP_DIR"
  echo -e "${YELLOW}[INFO]${NC} Folder lama dipindahkan ke: $BACKUP_DIR"
fi

run_step "Clone repo dari GitHub" "git clone $REPO_URL $PROJECT_DIR"
cd "$PROJECT_DIR"

# =============================================================================
# Step 3: Setup Backend
# =============================================================================
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  STEP 3: Setup Backend${NC}"
echo -e "${CYAN}========================================${NC}"

cd "$PROJECT_DIR/backend"

run_step "Install backend dependencies" "npm install"

# Buat file .env backend
cat > .env <<EOF
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"
JWT_SECRET="${JWT_SECRET}"
PORT=${API_PORT}
EOF

echo -e "${GREEN}[OK]${NC} File .env backend dibuat."

run_step "Generate Prisma Client" "npx prisma generate"

# Cek apakah database sudah ada / bisa connect
if npx prisma migrate deploy 2>/dev/null; then
  echo -e "${GREEN}[OK]${NC} Database migration berhasil."
else
  echo -e "${YELLOW}[WARN]${NC} Migrate deploy gagal. Kemungkinan database belum dibuat."
  echo -e "${YELLOW}[INFO]${NC} Silakan buat database manual di aaPanel/PhpMyAdmin, lalu jalankan:"
  echo "  cd $PROJECT_DIR/backend && npx prisma migrate deploy"
fi

run_step "Build backend" "npm run build"

run_step "Setup folder uploads" "mkdir -p uploads && chmod 755 uploads"

# =============================================================================
# Step 4: Jalankan Backend dengan PM2
# =============================================================================
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  STEP 4: Jalankan Backend (PM2)${NC}"
echo -e "${CYAN}========================================${NC}"

# Hapus instance lama jika ada
pm2 delete owopay-api 2>/dev/null || true

run_step "Start backend dengan PM2" "pm2 start dist/main.js --name owopay-api"
run_step "Save PM2 config" "pm2 save"

# Setup PM2 startup (auto-start saat reboot)
pm2 startup 2>/dev/null || true

# =============================================================================
# Step 5: Setup Frontend
# =============================================================================
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  STEP 5: Setup Frontend${NC}"
echo -e "${CYAN}========================================${NC}"

cd "$PROJECT_DIR/frontend"

run_step "Install frontend dependencies" "npm install"

# Buat file .env.local frontend
if [ "$USE_SSL" = "y" ] || [ "$USE_SSL" = "Y" ]; then
  PROTOCOL="https"
else
  PROTOCOL="http"
fi

cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=${PROTOCOL}://${API_DOMAIN}/api
NEXT_PUBLIC_WS_URL=${PROTOCOL}://${API_DOMAIN}
EOF

echo -e "${GREEN}[OK]${NC} File .env.local frontend dibuat."

run_step "Build frontend (static export)" "npm run build"

# Cek hasil build
if [ -d "$PROJECT_DIR/frontend/dist" ]; then
  BUILD_DIR="dist"
elif [ -d "$PROJECT_DIR/frontend/out" ]; then
  BUILD_DIR="out"
  # Buat symlink ke dist jika diminta
  ln -sf "$PROJECT_DIR/frontend/out" "$PROJECT_DIR/frontend/dist"
  echo -e "${YELLOW}[INFO]${NC} Hasil build di 'out/'. Membuat symlink ke 'dist/' ..."
else
  BUILD_DIR="dist"
  echo -e "${YELLOW}[WARN]${NC} Folder build tidak ditemukan di 'dist/' atau 'out/'."
fi

# Pastikan folder dist ada
echo -e "${GREEN}[OK]${NC} Frontend build selesai. Lokasi: $PROJECT_DIR/frontend/$BUILD_DIR"

# =============================================================================
# Step 6: Selesai - Print Ringkasan
# =============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  INSTALLASI SELESAI!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}--- Lokasi Project ---${NC}"
echo "Project    : $PROJECT_DIR"
echo "Backend    : $PROJECT_DIR/backend"
echo "Frontend   : $PROJECT_DIR/frontend"
echo "Build Dir  : $PROJECT_DIR/frontend/$BUILD_DIR"
echo ""
echo -e "${CYAN}--- Status Service ---${NC}"
pm2 list | grep owopay-api || true
echo ""
echo -e "${CYAN}--- Langkah Selanjutnya (Nginx) ---${NC}"
echo "1. Buka aaPanel / panel server Anda"
echo "2. Buat Website baru:"
echo "   - Domain: $FRONTEND_DOMAIN"
echo "   - Root  : $PROJECT_DIR/frontend/$BUILD_DIR"
echo "   - PHP   : Pure Static"
echo ""
echo "3. Buat Reverse Proxy untuk Backend:"
echo "   - Domain: $API_DOMAIN"
echo "   - Target: http://localhost:$API_PORT"
echo ""
echo "4. Apply SSL (Let's Encrypt) untuk kedua domain"
echo ""
echo -e "${CYAN}--- Perintah Berguna ---${NC}"
echo "Cek status backend : pm2 status"
echo "Lihat log backend  : pm2 logs owopay-api"
echo "Restart backend    : pm2 restart owopay-api"
echo "Stop backend       : pm2 stop owopay-api"
echo "Rebuild frontend   : cd $PROJECT_DIR/frontend && npm run build"
echo ""
echo -e "${GREEN}Selamat! OwoPay sudah siap di-deploy.${NC}"
