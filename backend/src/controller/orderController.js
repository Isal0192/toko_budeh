import { PrismaClient } from '@prisma/client';
import { sendWhatsApp } from '../services/waha.js';

const prisma = new PrismaClient();

// Get All Orders
export const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data order', error: error.message });
    }
};

// Create Order
export const createOrder = async (req, res) => {
    try {
        const { namaPelanggan, noHp, alamat, items, total } = req.body;

        if (!namaPelanggan || !noHp || !alamat) {
            return res.status(400).json({ success: false, message: 'Data pelanggan tidak lengkap' });
        }

        const order = await prisma.order.create({
            data: {
                namaPelanggan,
                noHp,
                alamat,
                items: JSON.stringify(items),
                total: parseInt(total),
                status: 'PENDING'
            }
        });

        // 1. Kirim WA ke Admin
        const adminMsg = `🔔 *ORDER MASUK BOS!*\n\n` +
            `Pemesan: ${namaPelanggan}\n` +
            `No HP: ${noHp}\n` +
            `produk: ${items.map(i => `${i.nama} x${i.qty}`).join(', ')}\n` +
            `Total: Rp ${total.toLocaleString()}\n\n` +
            `Segera cek Dashboard!`;
        await sendWhatsApp(process.env.WAHA_ADMIN_NUMBER, adminMsg);

        // 2. Kirim WA ke User
        const userMsg = `Halo Kak ${namaPelanggan}! 👋\n` +
            `Pesanan kakak sdh kami terima.\n` +
            `Status: *PENDING* (Menunggu Konfirmasi Admin)\n\n` +
            `Kami akan segera mengabari lagi. Terima kasih!`;
        await sendWhatsApp(noHp, userMsg);

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ success: false, message: 'Gagal order', error: error.message });
    }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ success: false, message: 'Status diperlukan' });

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        // Kirim Notifikasi WA ke User berdasarkan Status Baru
        let pesanUser = '';
        if (status === 'PROCESSED') {
            pesanUser = `Hore! Pesanan Kak ${order.namaPelanggan} sedang *DIPROSES* (Dibuat/Dikemas) 👩‍🍳.\nMohon ditunggu ya!`;
        } else if (status === 'COMPLETED') {
            pesanUser = `Pesanan Kak ${order.namaPelanggan} sudah *SELESAI/DIKIRIM* 🚀.\nTerima kasih sudah belanja di Toko Bueh!`;
        } else if (status === 'CANCELLED') {
            pesanUser = `Maaf, pesanan Kak ${order.namaPelanggan} *DIBATALKAN* oleh admin.\nSilakan hubungi kami untuk info lebih lanjut.`;
        }

        if (pesanUser) {
            await sendWhatsApp(order.noHp, pesanUser);
        }

        res.json({ success: true, message: 'Status berhasil diubah', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update status', error: error.message });
    }
};
