import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get All Mitra
export const getAllMitra = async (req, res) => {
    try {
        const mitra = await prisma.mitra.findMany({
            include: { products: true }, // Lihat produknya apa aja
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: mitra });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal ambil data mitra' });
    }
};

// Create Mitra
export const createMitra = async (req, res) => {
    try {
        const { nama, noHp, alamat, persenBagi } = req.body;

        if (!nama || !noHp) return res.status(400).json({ success: false, message: 'Nama dan No HP wajib diisi' });

        const mitra = await prisma.mitra.create({
            data: {
                nama,
                noHp,
                alamat: alamat || '',
                persenBagi: persenBagi ? parseInt(persenBagi) : 90
            }
        });
        res.status(201).json({ success: true, message: 'Mitra berhasil ditambahkan', data: mitra });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal tambah mitra', error: error.message });
    }
};

// Delete Mitra
export const deleteMitra = async (req, res) => {
    try {
        // Cek apakah mitra punya produk? Jangan hapus kalau masih punya produk aktif
        // Tapi untuk MVP kita force delete atau set null dulu. Kita force delete saja.
        await prisma.mitra.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true, message: 'Mitra dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus mitra. Pastikan produk sudah dihapus dulu.', error: error.message });
    }
};
