import { PrismaClient } from '@prisma/client';
import { sendWhatsApp } from '../services/waha.js';

const prisma = new PrismaClient();
const ADMIN_JID = process.env.WAHA_ADMIN_NUMBER + '@c.us';

// --- Helper: Cek Admin ---
const isAdmin = (sender) => sender === ADMIN_JID;

// --- Command Handlers ---
const handlers = {
    '!daftar': async (sender, args) => {
        const content = args.join(' ');
        if (!content) {
            return sendWhatsApp(sender, `👋 Halo! Untuk mendaftar ketik:\n*!daftar Nama Toko#Alamat*\n\nContoh:\n*!daftar Toko Berkah#Jl. Kenangan No. 5*`);
        }

        const existing = await prisma.mitra.findFirst({ where: { noHp: sender } });
        if (existing) return sendWhatsApp(sender, `✅ Nomor sudah terdaftar sebagai: *${existing.nama}*`);

        let [nama, alamat] = content.split('#');
        const newMitra = await prisma.mitra.create({
            data: { nama: (nama || 'Mitra').trim(), noHp: sender, alamat: (alamat || '-').trim(), persenBagi: 90 },
        });

        await sendWhatsApp(sender, `🎉 Pendaftaran BERHASIL!\n\nNama: *${newMitra.nama}*\nAlamat: *${newMitra.alamat}*\n\nAdmin akan memverifikasi data Anda.`);
        return sendWhatsApp(ADMIN_JID, `🔔 *PENDAFTARAN BARU*\nNama: ${newMitra.nama}\nHP: ${sender}`);
    },

    '!menu': (sender) => {
        if (!isAdmin(sender)) return;
        return sendWhatsApp(sender, `🤖 *ADMIN BOT*\n\n📦 *ORDER*\n!list [pending/proses/selesai]\n!detail [id]\n\n⚙️ *AKSI*\n!proses [id]\n!selesai [id]\n!batal [id]\n\n📢 *INFO*\n!bc [pesan]`);
    },

    '!list': async (sender, args) => {
        if (!isAdmin(sender)) return;
        const statusMap = { 'proses': 'PROCESSED', 'selesai': 'COMPLETED', 'batal': 'CANCELLED' };
        const statusFilter = statusMap[args[0]?.toLowerCase()] || 'PENDING';

        const orders = await prisma.order.findMany({ where: { status: statusFilter }, orderBy: { createdAt: 'desc' }, take: 10 });
        if (orders.length === 0) return sendWhatsApp(sender, `📭 Tidak ada pesanan *${statusFilter}*.`);

        let msg = `📝 *LIST ORDER: ${statusFilter}*\n`;
        orders.forEach(o => msg += `------------------\n🆔 *#${o.id}* | 👤 ${o.namaPelanggan}\n💰 Rp ${o.total.toLocaleString()}\n`);
        return sendWhatsApp(sender, msg + `\n_Ketik !detail [id]_`);
    },

    '!detail': async (sender, args) => {
        if (!isAdmin(sender)) return;
        const orderId = parseInt(args[0]);
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return sendWhatsApp(sender, `❌ Order #${orderId} tidak ditemukan.`);

        const items = JSON.parse(order.items || '[]');
        const itemStr = items.map((it, i) => `${i + 1}. ${it.nama} x${it.qty}`).join('\n');
        return sendWhatsApp(sender, `📋 *DETAIL #${order.id}*\n\n👤 ${order.namaPelanggan}\n📍 ${order.alamat}\n🏷️ ${order.status}\n---\n${itemStr}\n---\n💰 *Total*: Rp ${order.total.toLocaleString()}`);
    },

    // Digabung untuk !proses, !selesai, !batal
    'updateStatus': async (sender, args, cmd) => {
        if (!isAdmin(sender)) return;
        const orderId = parseInt(args[0]);
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return;

        const config = {
            '!proses': { s: 'PROCESSED', m: 'Pesanan sedang *DIPROSES* 👩‍🍳' },
            '!selesai': { s: 'COMPLETED', m: 'Pesanan sudah *SELESAI* 🚀' },
            '!batal': { s: 'CANCELLED', m: 'Maaf, pesanan *DIBATALKAN*.' }
        }[cmd];

        await prisma.order.update({ where: { id: orderId }, data: { status: config.s } });
        await sendWhatsApp(order.noHp, `Hore! Kak ${order.namaPelanggan}, ${config.m}`);
        return sendWhatsApp(sender, `✅ #${orderId} -> ${config.s}`);
    },

    '!bc': async (sender, args) => {
        if (!isAdmin(sender)) return;
        const msg = args.join(' ');
        if (!msg) return sendWhatsApp(sender, `⚠️ Ketik: !bc [pesan]`);

        const mitras = await prisma.mitra.findMany({ select: { noHp: true } });
        await sendWhatsApp(sender, `⏳ Mengirim ke ${mitras.length} mitra...`);
        for (const m of mitras) await sendWhatsApp(m.noHp, `📢 *INFO*\n\n${msg}`);
        return sendWhatsApp(sender, `✅ Selesai.`);
    }
};

// --- Webhook Handler ---

export const handleWebhook = async (req, res) => {
    try {
        const { event, payload } = req.body;
        if (event !== 'message.any' || payload.fromMe) return res.sendStatus(200);

        const sender = payload.from;
        const text = (payload.body || '').trim();
        const [command, ...args] = text.split(' ');
        const cmd = command.toLowerCase();

        // Logika Eksekusi
        if (handlers[cmd]) {
            await handlers[cmd](sender, args, cmd);
        } else if (['!proses', '!selesai', '!batal'].includes(cmd)) {
            await handlers.updateStatus(sender, args, cmd);
        } else if (cmd === '!help' || cmd === '!menuwa') {
            await handlers['!menu'](sender);
        } else if (cmd === '!status') {
            await handlers['!detail'](sender, args);
        } else if (cmd === '!broadcast') {
            await handlers['!bc'](sender, args);
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error');
    }
};