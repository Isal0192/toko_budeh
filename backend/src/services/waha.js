

/**
 * Mengirim pesan WhatsApp via WAHA API
 * @param {string} number - Nomor tujuan (bisa format 08..., 628..., atau ID khusus yang mengandung '@')
 * @param {string} message - Isi pesan
 */
export const sendWhatsApp = async (number, message) => {
    try {
        const waUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
        const apiKey = process.env.WAHA_API_KEY;

        let chatId;
        let formattedNumber;

        // Jika number sudah berupa chatId (misal: ...@c.us atau ...@lid), gunakan langsung
        if (number.includes('@')) {
            chatId = number;
            formattedNumber = number.split('@')[0]; // Extract ID part for logging
        } else {
            // Format nomor HP biasa
            formattedNumber = number.replace(/\D/g, '');
            if (formattedNumber.startsWith('0')) {
                formattedNumber = '62' + formattedNumber.substring(1);
            }
            chatId = `${formattedNumber}@c.us`;
        }

        // Jangan kirim jika number kosong atau "-"
        if (!number || number === '-' || number.length < 5) return;

        console.log(`Sending WA to ${chatId}...`);

        // Panggil WAHA API
        // Gunakan setImmediate agar tidak blocking request utama (fire-and-forget)
        setImmediate(async () => {
            try {
                const headers = { 'Content-Type': 'application/json' };
                if (apiKey) {
                    headers['X-Api-Key'] = apiKey;
                }

                await fetch(`${waUrl}/api/sendText`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        chatId: chatId,
                        text: message,
                        session: 'default'
                    })
                });
            } catch (err) {
                console.error('WAHA Error:', err.message);
            }
        });

    } catch (error) {
        console.error('Setup WA Error:', error.message);
    }
};
