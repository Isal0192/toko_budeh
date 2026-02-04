# 🛠️ Dokumentasi Teknis Backend Toko Budeh

Dokumen ini berisi detail teknis mengenai arsitektur backend, skema database, dan spesifikasi API yang digunakan dalam aplikasi Toko Budeh.

---

## 🏗️ Arsitektur Sistem

Backend dibangun menggunakan stack teknologi berikut:
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **ORM**: Prisma
- **Auth**: JWT (JSON Web Token)
- **File Upload**: Multer (Local Storage)
- **Notification**: WAHA (WhatsApp HTTP API)

### Struktur Folder Backend
```
backend/
├── prisma/
│   ├── schema.prisma      # Definisi Database Schema
│   ├── dev.db             # File Database SQLite
│   └── migrations/        # Riwayat perubahan database
├── public/
│   └── uploads/           # Penyimpanan gambar produk
├── src/
│   ├── routes/
│   │   └── api.js         # Semua logic endpoint API ada di sini
│   └── server.js          # Entry point server & konfigurasi middleware
├── .env                   # Environment variables (SANGAT PENTING)
└── package.json
```

---

## 🗄️ Database Schema (ERD)

Relasi antar tabel menggunakan Prisma ORM.

### 1. `Product` (Produk)
Menyimpan data barang jualan.
- **id**: `Int` (PK)
- **nama**: `String`
- **harga**: `Int`
- **stok**: `Int`
- **isUnlimited**: `Boolean` (True = Pre-Order/Katering, Stok tak terbatas)
- **imageUrl**: `String` (URL path ke file)
- **mitraId**: `Int?` (FK ke Mitra. Null = Produk Toko Sendiri)

### 2. `Order` (Pesanan)
Menyimpan transaksi pembelian.
- **id**: `Int` (PK)
- **namaPelanggan**: `String`
- **noHp**: `String` (Untuk notifikasi WA)
- **alamat**: `String`
- **items**: `String` (JSON String berisi array detail belanja)
- **total**: `Int`
- **status**: `String` (Default: `PENDING`)
  - Enum: `PENDING`, `PROCESSED`, `COMPLETED`, `CANCELLED`
- **createdAt**: `DateTime`

### 3. `Mitra` (Partner)
Menyimpan data pemilik produk titipan (Konsinyasi).
- **id**: `Int` (PK)
- **nama**: `String`
- **noHp**: `String`
- **persenBagi**: `Int` (Contoh: 90 berarti mitra dapat 90% hasil penjualan)
- **products**: `Product[]` (One-to-Many)

---

## 🔌 API Endpoints Reference

Base URL: `http://localhost:5000/api`

### 🔐 Authentication

#### Login Admin
*   **URL**: `POST /login`
*   **Body**: `{ "password": "admin123" }`
*   **Response**: `{ "success": true, "token": "eyJhbG..." }`

---

### 📦 Products (Produk)

#### Get All Products (Public)
*   **URL**: `GET /products`
*   **Query Param**: `?kategori=Sembako` (Opsional)
*   **Response**: List produk beserta data Mitra (jika ada).

#### Create Product (Admin Only)
*   **URL**: `POST /products`
*   **Header**: `Authorization: Bearer <token>`
*   **Form-Data**:
    *   `nama`: String
    *   `harga`: Int
    *   `stok`: Int
    *   `kategori`: String
    *   `image`: File (jpg/png)
    *   `isUnlimited`: Boolean
    *   `mitraId`: Int (Opsional)

#### Delete Product (Admin Only)
*   **URL**: `DELETE /products/:id`
*   **Header**: `Authorization: Bearer <token>`

---

### 🛒 Orders (Pesanan)

#### Create Order (Public)
*   **URL**: `POST /orders`
*   **Trigger**: Mengirim pesan WA ke Admin & User.
*   **Body**:
    ```json
    {
      "namaPelanggan": "Budi",
      "noHp": "08123456789",
      "alamat": "Jl. Mawar No 1",
      "total": 50000,
      "items": [{ "id": 1, "nama": "Beras", "quantity": 1, "harga": 50000 }]
    }
    ```

#### Get Orders (Admin Only)
*   **URL**: `GET /orders`
*   **Header**: `Authorization: Bearer <token>`

#### Update Status (Admin Only)
*   **URL**: `PATCH /orders/:id/status`
*   **Trigger**: Mengirim pesan WA ke User (Status Update).
*   **Header**: `Authorization: Bearer <token>`
*   **Body**: `{ "status": "PROCESSED" }`

---

### 🤝 Mitra (Partner)

#### Get Mitra (Admin Only)
*   **URL**: `GET /mitra`
*   **Header**: `Authorization: Bearer <token>`

#### Create Mitra (Admin Only)
*   **URL**: `POST /mitra`
*   **Body**:
    ```json
    {
      "nama": "Bu Siti",
      "noHp": "0812...",
      "alamat": "Blok A",
      "persenBagi": 90
    }
    ```

---

## 🤖 Integrasi WAHA (WhatsApp)

Backend terintegrasi dengan layanan **WAHA (WhatsApp HTTP API)** untuk notifikasi otomatis.

### Cara Kerja
1.  Backend membaca `WAHA_API_URL` dari `.env`.
2.  Saat event tertentu (Order Masuk / Ganti Status), Backend memanggil helper function `sendWhatsApp()`.
3.  Helper function mengirim request `POST` ke WAHA (`/api/sendText`).
4.  WAHA mengirim pesan ke nomor tujuan via WhatsApp Web session.

### setup Env
Pastikan `.env` memiliki konfigurasi ini:

```env
WAHA_API_URL="http://localhost:3000"
WAHA_ADMIN_NUMBER="628xxxxxxxx"
```

## ⚠️ Troubleshooting & Tips

1.  **Database Locked (SQLite)**
    *   Error: `PrismaClientKnownRequestError: Database is locked`
    *   Solusi: Stop server backend, hapus folder `node_modules/.prisma` jika perlu, lalu jalankan `npx prisma generate`. Pastikan tidak ada GUI SQLite browser yang membuka file `dev.db` saat server jalan.

2.  **Gambar Tidak Muncul**
    *   Pastikan folder `backend/public/uploads` ada.
    *   Cek URL gambar di database, harusnya format: `http://localhost:5000/uploads/namafile.jpg`.

3.  **WA Tidak Terkirim**
    *   Pastikan server WAHA berjalan (`docker ps`).
    *   Pastikan nomor HP di database menggunakan format internasional (628...) atau sudah dihandle oleh helper function.
