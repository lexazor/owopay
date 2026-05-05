# PowerShell setup script for OwoPay
# Run this after cloning the repo

Write-Host "Setting up OwoPay..."

# Backend setup
Write-Host "Installing backend dependencies..."
cd backend
npm install

Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "Running database migrations..."
npx prisma migrate dev --name init

Write-Host "Seeding database..."
npx ts-node prisma/seed.ts

cd ..

# Frontend setup
Write-Host "Installing frontend dependencies..."
cd frontend
npm install

cd ..

Write-Host "Setup complete!"
Write-Host "Run ./start-dev.ps1 to start both servers."
