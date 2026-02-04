import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// === Konfigurasi Multer ===
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan!'));
        }
    }
});

import { sendWhatsApp } from '../services/waha.js';


// === Middleware Autentikasi ===
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Akses ditolak.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token invalid.' });
        req.user = user;
        next();
    });
};

// === Routes ===

// Login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Password salah!' });
    }
});

// Get Products
router.get('/products', async (req, res) => {
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
});

// Create Product
router.post('/products', authenticateToken, upload.single('image'), async (req, res) => {
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
});

// Delete Product
router.delete('/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Produk dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus', error: error.message });
    }
});

// === MITRA ROUTES ===

// Get All Mitra
router.get('/mitra', authenticateToken, async (req, res) => {
    try {
        const mitra = await prisma.mitra.findMany({
            include: { products: true }, // Lihat produknya apa aja
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: mitra });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal ambil data mitra' });
    }
});

// Create Mitra
router.post('/mitra', authenticateToken, async (req, res) => {
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
});

// Delete Mitra
router.delete('/mitra/:id', authenticateToken, async (req, res) => {
    try {
        // Cek apakah mitra punya produk? Jangan hapus kalau masih punya produk aktif
        // Tapi untuk MVP kita force delete atau set null dulu. Kita force delete saja.
        await prisma.mitra.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true, message: 'Mitra dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus mitra. Pastikan produk sudah dihapus dulu.', error: error.message });
    }
});

// === ORDER ROUTES ===

// Buat Pesanan
router.post('/orders', async (req, res) => {
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
});

// Update Status Order
router.patch('/orders/:id/status', authenticateToken, async (req, res) => {
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
});

router.get('/orders', authenticateToken, async (req, res) => {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: orders });
});

// === WEBHOOK RECEIVER & ADMIN BOT ===
router.post('/webhook', async (req, res) => {
    try {
        const event = req.body;
        console.log('🔔 Webhook RAW:', JSON.stringify(event, null, 2)); // DEBUG LOG

        // 1. Cek Pesan Masuk (termasuk dari diri sendiri jika itu Admin)
        // Handle 'unread_count' event which might contain the message
        if (event.event === 'unread_count' && event.payload && event.payload.data && event.payload.data.length > 0) {
            // Extract the first message from unread_count
            const firstMsg = event.payload.data[0].lastMessage._data;
            if (firstMsg) {
                // Normalize structure to match message.any
                event.event = 'message.any';
                event.payload = {
                    from: firstMsg.from._serialized,
                    body: firstMsg.body,
                    fromMe: firstMsg.id.fromMe,
                    ...firstMsg
                };
            }
        }

        if (event.event !== 'message.any' && event.event !== 'message') return res.status(200).send('OK');

        const isFromMe = event.payload.fromMe;
        const sender = event.payload.from;
        const adminNumber = process.env.WAHA_ADMIN_NUMBER + '@c.us';
        const adminLid = '32019065094203@lid'; // Known Admin LID from logs

        // Syarat: Event message DAN (Bukan dari diri sendiri ATAU Dari diri sendiri tapi sender == Admin)
        // Admin bisa berupa Nomor HP (@c.us) atau Linked Device (@lid)
        const isAdmin = (sender === adminNumber || sender === adminLid);
        const isValidSender = !isFromMe || (isFromMe && isAdmin);

        if (isValidSender) {
            const text = (event.payload.body || '').trim();

            console.log(`📩 Pesan dari ${sender}: ${text}`);

            // === KEAMANAN: Pastikan ini dari ADMIN ===
            if (!isAdmin) {
                console.log(`⛔ Diabaikan: ${sender} bukan admin.`);
                return res.status(200).send('OK (Not Admin)');
            }

            // === COMMAND HANDLER ===
            const parts = text.split(' ');
            const command = parts[0].toLowerCase();
            const arg1 = parts[1]; // Status atau ID

            // --- HELP / MENU ---
            if (command === '!help' || command === '!menu') {
                const helpMsg = `🤖 *ADMIN BOT SUPER*\n\n` +
                    `📦 *KELOLA ORDER*\n` +
                    `• *!list* - Cek Pending\n` +
                    `• *!list proses* - Cek Diproses\n` +
                    `• *!list selesai* - Cek Selesai\n` +
                    `• *!detail [id]* - Lihat Detail Item\n\n` +
                    `⚙️ *AKSI ORDER*\n` +
                    `• *!proses [id]* -> Ubah ke PROCESSED\n` +
                    `• *!selesai [id]* -> Ubah ke COMPLETED\n` +
                    `• *!batal [id]* -> Ubah ke CANCELLED\n\n` +
                    `Contoh: *!proses 20*`;
                await sendWhatsApp(sender, helpMsg);
            }

            // --- LIST ORDERS ---
            else if (command === '!list') {
                let statusFilter = 'PENDING'; // Default
                if (arg1) {
                    const mapStatus = {
                        'proses': 'PROCESSED',
                        'selesai': 'COMPLETED',
                        'batal': 'CANCELLED',
                        'pending': 'PENDING'
                    };
                    if (mapStatus[arg1.toLowerCase()]) {
                        statusFilter = mapStatus[arg1.toLowerCase()];
                    }
                }

                const orders = await prisma.order.findMany({
                    where: { status: statusFilter },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                });

                if (orders.length === 0) {
                    await sendWhatsApp(sender, `📭 Tidak ada pesanan dengan status *${statusFilter}*.`);
                } else {
                    let msg = `📝 *LIST ORDER: ${statusFilter}* (Max 10)\n`;
                    orders.forEach(o => {
                        msg += `------------------------------\n`;
                        msg += `🆔 *#${o.id}*\n`;
                        msg += `👤 ${o.namaPelanggan} (${o.noHp})\n`;
                        msg += `💰 Rp ${o.total.toLocaleString()}\n`;
                        msg += `📅 ${new Date(o.createdAt).toLocaleString('id-ID')}\n`;
                    });
                    msg += `\n_Ketik !detail [id] untuk rincian._`;
                    await sendWhatsApp(sender, msg);
                }
            }

            // --- DETAIL ORDER ---
            else if (command === '!detail' || command === '!status') {
                if (!arg1) {
                    await sendWhatsApp(sender, `⚠️ Masukkan ID. Contoh: *!detail 20*`);
                    return res.status(200).send('OK');
                }
                const orderId = parseInt(arg1);
                const order = await prisma.order.findUnique({
                    where: { id: orderId }
                });

                if (!order) {
                    await sendWhatsApp(sender, `❌ Order #${orderId} tidak ditemukan.`);
                } else {
                    let items;
                    try {
                        items = JSON.parse(order.items);
                    } catch (e) { items = []; }

                    let itemStr = "";
                    items.forEach((item, idx) => {
                        itemStr += `${idx + 1}. ${item.nama} x${item.qty} (@${item.harga / 1000}k)\n`;
                    });

                    let msg = `📋 *DETAIL ORDER #${order.id}*\n\n`;
                    msg += `👤 *Pelanggan*: ${order.namaPelanggan}\n`;
                    msg += `📞 *HP*: ${order.noHp}\n`;
                    msg += `📍 *Alamat*: ${order.alamat}\n`;
                    msg += `🏷️ *Status*: ${order.status}\n`;
                    msg += `📅 *Waktu*: ${new Date(order.createdAt).toLocaleString('id-ID')}\n`;
                    msg += `------------------------------\n`;
                    msg += `📦 *ITEMS*:\n${itemStr}`;
                    msg += `------------------------------\n`;
                    msg += `💰 *TOTAL*: Rp ${order.total.toLocaleString()}\n`;

                    await sendWhatsApp(sender, msg);
                }
            }

            // --- UPDATE STATUS (!proses, !selesai, !batal) ---
            else if (['!proses', '!selesai', '!batal'].includes(command)) {
                if (!arg1) {
                    await sendWhatsApp(sender, `⚠️ Masukkan ID. Contoh: *${command} 20*`);
                    return res.status(200).send('OK');
                }

                const orderId = parseInt(arg1);
                const order = await prisma.order.findUnique({ where: { id: orderId } });

                if (!order) {
                    await sendWhatsApp(sender, `❌ Order #${orderId} tidak ditemukan.`);
                } else {
                    let newStatus = '';
                    let userMsg = '';
                    let adminReply = '';

                    if (command === '!proses') {
                        newStatus = 'PROCESSED';
                        userMsg = `Hore! Pesanan Kak ${order.namaPelanggan} sedang *DIPROSES* (Dibuat/Dikemas) 👩‍🍳.\nMohon ditunggu ya!`;
                        adminReply = `✅ Order #${orderId} -> PROCESSED.`;
                    } else if (command === '!selesai') {
                        newStatus = 'COMPLETED';
                        userMsg = `Pesanan Kak ${order.namaPelanggan} sudah *SELESAI/DIKIRIM* 🚀.\nTerima kasih sudah belanja di Toko Bueh!`;
                        adminReply = `✅ Order #${orderId} -> COMPLETED.`;
                    } else if (command === '!batal') {
                        newStatus = 'CANCELLED';
                        userMsg = `Maaf, pesanan Kak ${order.namaPelanggan} *DIBATALKAN* oleh admin.`;
                        adminReply = `✅ Order #${orderId} -> CANCELLED.`;
                    }

                    // Update DB
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { status: newStatus }
                    });

                    // Notif ke User & Admin
                    await sendWhatsApp(order.noHp, userMsg);
                    await sendWhatsApp(sender, adminReply);
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Error');
    }
});

export default router;
