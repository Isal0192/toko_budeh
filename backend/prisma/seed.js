import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Memulai seeding database...');

    // Hapus data lama
    await prisma.product.deleteMany();
    console.log('🗑️  Data lama dihapus');

    // Data produk warung
    const products = [
        // Kategori Sembako
        {
            nama: 'Beras Premium 5kg',
            harga: 75000,
            deskripsi: 'Beras premium kualitas terbaik, pulen dan wangi',
            kategori: 'Sembako',
            imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            stok: 50
        },
        {
            nama: 'Minyak Goreng 2L',
            harga: 32000,
            deskripsi: 'Minyak goreng berkualitas untuk memasak sehari-hari',
            kategori: 'Sembako',
            imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
            stok: 30
        },
        {
            nama: 'Gula Pasir 1kg',
            harga: 15000,
            deskripsi: 'Gula pasir murni untuk kebutuhan dapur',
            kategori: 'Sembako',
            imageUrl: 'https://images.unsplash.com/photo-1587149185964-7579e2181d43?w=400',
            stok: 40
        },
        {
            nama: 'Telur Ayam 1kg',
            harga: 28000,
            deskripsi: 'Telur ayam segar pilihan',
            kategori: 'Sembako',
            imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc1f3e3132?w=400',
            stok: 25
        },

        // Kategori Snack
        {
            nama: 'Chitato Rasa Sapi Panggang',
            harga: 12000,
            deskripsi: 'Keripik kentang renyah rasa sapi panggang',
            kategori: 'Snack',
            imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
            stok: 60
        },
        {
            nama: 'Oreo Original',
            harga: 9500,
            deskripsi: 'Biskuit sandwich coklat favorit keluarga',
            kategori: 'Snack',
            imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
            stok: 45
        },
        {
            nama: 'Tango Wafer Coklat',
            harga: 5000,
            deskripsi: 'Wafer renyah dengan krim coklat lezat',
            kategori: 'Snack',
            imageUrl: 'https://images.unsplash.com/photo-1609126431412-ef54f5c22c6f?w=400',
            stok: 80
        },

        // Kategori Minuman
        {
            nama: 'Teh Botol Sosro 450ml',
            harga: 5000,
            deskripsi: 'Minuman teh manis segar dalam kemasan botol',
            kategori: 'Minuman',
            imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
            stok: 100
        },
        {
            nama: 'Aqua 600ml',
            harga: 3500,
            deskripsi: 'Air mineral berkualitas untuk keluarga',
            kategori: 'Minuman',
            imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
            stok: 120
        },
        {
            nama: 'Coca Cola 390ml',
            harga: 6000,
            deskripsi: 'Minuman berkarbonasi rasa cola',
            kategori: 'Minuman',
            imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
            stok: 70
        },

        // Kategori Sabun & Kebersihan
        {
            nama: 'Sabun Mandi Lifebuoy',
            harga: 4500,
            deskripsi: 'Sabun mandi antiseptik untuk perlindungan keluarga',
            kategori: 'Sabun',
            imageUrl: 'https://images.unsplash.com/photo-1585933646077-214f043f0c93?w=400',
            stok: 50
        },
        {
            nama: 'Sabun Cuci Piring Sunlight',
            harga: 8000,
            deskripsi: 'Sabun cuci piring dengan jeruk nipis',
            kategori: 'Sabun',
            imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
            stok: 35
        },
        {
            nama: 'Detergen Rinso 800gr',
            harga: 18000,
            deskripsi: 'Detergen bubuk untuk cucian bersih bersinar',
            kategori: 'Sabun',
            imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
            stok: 40
        }
    ];

    // Insert products
    for (const product of products) {
        await prisma.product.create({
            data: product
        });
    }

    console.log(`✅ Berhasil menambahkan ${products.length} produk`);
    console.log('🎉 Seeding selesai!');
}

main()
    .catch((e) => {
        console.error('❌ Error saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
