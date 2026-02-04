#!/bin/bash

# Script untuk setup database Toko Bueh (SQLite Version)
# Jalankan dengan: bash setup-db.sh

echo "🚀 Setup Database Toko Bueh"
echo "================================"
echo ""

# Warna untuk output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Install dependencies
echo "1. Menginstall dependencies..."
cd backend && npm install
cd ../frontend && npm install
cd ..

# 2. Generate Prisma Client
echo ""
echo "2. Generate Prisma Client..."
cd backend
npx prisma generate
if [ $? -eq 0 ]; then
    print_success "Prisma Client berhasil di-generate"
else
    print_error "Gagal generate Prisma Client"
    exit 1
fi

# 3. Jalankan migrasi (SQLite akan otomatis membuat file db)
echo ""
echo "3. Menjalankan migrasi database..."
npx prisma migrate dev --name init
if [ $? -eq 0 ]; then
    print_success "Migrasi database berhasil"
else
    print_error "Gagal menjalankan migrasi"
    exit 1
fi

# 4. Seed database
echo ""
echo "4. Mengisi database dengan data contoh..."
npm run prisma:seed
if [ $? -eq 0 ]; then
    print_success "Database berhasil di-seed dengan data contoh"
else
    print_error "Gagal seeding database"
    exit 1
fi

echo ""
echo "================================"
print_success "Setup database selesai! 🎉"
echo ""
echo "Next steps:"
echo "  1. Jalankan backend: cd backend && npm run dev"
echo "  2. Jalankan frontend: cd frontend && npm run dev"
echo "  3. Buka browser: http://localhost:3000"
echo ""
