import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get Products
export const getProducts = async (req, res) => {
    try {
        const { kategori } = req.query;
        const where = kategori ? { kategori } : {};
        // Include data Mitra
        const products = await prisma.product.findMany({
            where,
            include: { mitra: true }, // Join tabel Mitra
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error server', error: error.message });
    }
};

// Create Product
export const createProduct = async (req, res) => {
    try {
        const { nama, harga, deskripsi, kategori, stok, isUnlimited, mitraId } = req.body;
        let imageUrl = req.body.imageUrl;

        if (req.file) {
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        if (!nama || !harga || !kategori) {
            return res.status(400).json({ success: false, message: 'Data wajib diisi' });
        }

        const product = await prisma.product.create({
            data: {
                nama,
                harga: parseInt(harga),
                deskripsi: deskripsi || '',
                kategori,
                imageUrl: imageUrl || 'https://via.placeholder.com/400',
                stok: parseInt(stok) || 0,
                isUnlimited: isUnlimited === 'true' || isUnlimited === true,
                mitraId: mitraId ? parseInt(mitraId) : null // Simpan ID mitra jika ada
            }
        });

        res.status(201).json({ success: true, message: 'Produk ditambahkan', data: product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Gagal menambah produk', error: error.message });
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Produk dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus', error: error.message });
    }
};