# 🛒 Toko Budeh - Aplikasi Katering & Warung Digital (Full Stack)

Aplikasi e-commerce modern untuk usaha katering dan warung sembako. Mendukung sistem **Ready Stock** (Sembako) dan **Pre-Order** (Jajanan Pasar) dengan integrasi notifikasi WhatsApp otomatis via WAHA.

![Tech Stack](https://img.shields.io/badge/Stack-MERN%20Lite-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

## 🌟 Fitur Unggulan

### 🛍️ User / Pelanggan
- **Hybrid System**:
  - **Ready Stock**: Stok terbatas, tombol beli terkunci jika habis (Cocok untuk Sembako).
  - **Pre-Order (PO)**: Stok tak terbatas (Unlimited), ada tombol **+10 Pcs** untuk pesanan partai besar (Cocok untuk Jajanan Pasar).
- **Server-Side Ordering**: Isi form (Nama, Alamat, No HP) -> Data masuk database -> Tunggu konfirmasi (Tidak lempar ke WA).
- **Notifikasi WhatsApp**: Terima pesan otomatis saat pesanan masuk dan saat status diubah admin.

### 👮 Admin Dashboard (`/admin`)
- **Manajemen Produk**:
  - Tambah/Hapus Produk.
  - **Upload Gambar**: Gambar tersimpan di server lokal.
  - **Set Pre-Order**: Checkbox untuk aktifkan mode unlimited stok.
- **Manajemen Pesanan**:
  - Tab "Pesanan Masuk" Real-time.
  - Lihat detail pemesan & alamat.
  - **Ubah Status**: `PENDING` -> `PROCESSED` -> `COMPLETED` -> `CANCELLED`.
  - Tombol pintas chat WA manual.

### 🤖 Sistem Notifikasi (WAHA Integration)
- **Order Baru**: Pesan otomatis ke Admin & User.
- **Status Update**: Pesan otomatis ke User saat status pesanan berubah (misal: "Pesanan sedang diproses").

---

## �️ Teknologi yang Digunakan

### Frontend
- **React.js 18** + **Vite**
- **Tailwind CSS 3** (Styling Modern)
- **Lucide React** (Ikon)

### Backend
- **Node.js** + **Express.js**
- **Prisma ORM** + **SQLite** (mudah dideploy, file based DB)
- **Multer** (Upload File)
- **WAHA (WhatsApp HTTP API)** (Self-hosted WA Gateway)

---

## 🚀 Cara Instalasi & Menjalankan

### Persiapan (Prerequisites)
1.  **Node.js** (v18+)
2.  **WAHA** (Opsional, untuk fitur notifikasi WA).
    -   Cara pasang WAHA (via Docker):
        ```bash
        docker run -it -p 3000:3000 --name waha devlikeapro/waha
        ```
    -   *Catatan: Pastikan port WAHA (3000) tidak bentrok dengan Frontend. Disarankan jalankan Frontend di 5173 atau ubah port WAHA.*

### 1. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Setup Database (SQLite)
npx prisma migrate dev --name init

# Sesuaikan .env
cp .env.example .env
# Edit .env dan atur nomor WA Admin & URL WAHA
```

**Konfigurasi `.env` Backend:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="rahasia_super_aman"
ADMIN_PASSWORD="admin123"

# WAHA Config
WAHA_API_URL="http://localhost:3000"
WAHA_ADMIN_NUMBER="62812345678" # Nomor admin (format 62...)
```

**Jalankan Server:**
```bash
npm run dev
# Server running at http://localhost:5000
```

### 2. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Jalankan Frontend
npm run dev
# Frontend running at http://localhost:3000 (atau port lain jika bentrok)
```

---

## � Panduan Penggunaan

### 1. Login Admin
- Buka URL: `/admin` (misal `http://localhost:3000/admin`)
- Password Default: `admin123` (Bisa diubah di `.env` backend)

### 2. Menambah Produk
- Di Dashboard Admin, isi form tambah produk.
- Centang **"Set Pre-Order"** jika ingin stok tak terbatas (untuk katering).
- Upload gambar produk dari komputer Anda.

### 3. Mengelola Pesanan
- Klik tab **"Pesanan"** di Dashboard.
- Lihat pesanan masuk.
- Ubah dropdown status (misal ke `PROCESSED`).
- Pembeli akan otomatis menerima WA notifikasi (jika WAHA aktif).

---

## 🗄️ Database Schema (Prisma)

**Product**
- `id`: Int
- `nama`: String
- `stok`: Int
- `isUnlimited`: Boolean (Fitur Baru untuk PO)
- `imageUrl`: String (Path lokal)

**Order**
- `id`: Int
- `namaPelanggan`: String
- `noHp`: String
- `alamat`: String
- `status`: String (PENDING, PROCESSED, COMPLETED, CANCELLED)
- `items`: JSON

---

## 📝 Lisensi
Project ini dibuat untuk kebutuhan UMKM Digital. Silakan dikembangkan lebih lanjut!
