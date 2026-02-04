import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, MapPin, Phone, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';

const CartModal = ({ isOpen, onClose }) => {
    const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

    // State untuk Form Lengkap
    const [formData, setFormData] = useState({
        nama: '',
        noHp: '',
        alamat: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // State Sukses Order

    // Helper: Format Rupiah
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Helper: Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper: Ambil Lokasi (Silent)
    const getUserLocation = async () => {
        if (!navigator.geolocation) return null;

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000
                });
            });
            return position.coords;
        } catch (error) {
            console.warn("Gagal auto-location:", error);
            return null;
        }
    };

    // Handle "Kirim Pesanan" (Server-side Order)
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert('Keranjang belanja kosong!');
            return;
        }

        if (!formData.nama || !formData.noHp || !formData.alamat) {
            alert('Mohon lengkapi data pesanan (Nama, No HP, Alamat)!');
            return;
        }

        setIsProcessing(true);

        // 1. Ambil Lokasi (Background Process)
        let finalAlamat = formData.alamat;
        console.log("Memulai pengambilan lokasi...");

        try {
            const coords = await getUserLocation();
            if (coords) {
                console.log("Lokasi didapat:", coords);
                const gMapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
                finalAlamat = `${finalAlamat}\n\n📍 Lokasi: ${gMapsUrl}`;
            } else {
                console.log("Lokasi tidak didapat atau ditolak data user.");
            }
        } catch (err) {
            console.warn("Gagal auto-location:", err);
        }

        try {
            // 2. Kirim ke Backend API kita
            const orderData = await createOrder({
                namaPelanggan: formData.nama,
                noHp: formData.noHp,
                alamat: finalAlamat,
                items: cart,
                total: getTotalPrice(),
            });

            // Jika sampai sini, berarti sukses
            if (orderData) {
                // 3. Tampilkan Sukses UI
                setIsSuccess(true);
                clearCart();
            } else {
                throw new Error('Tidak ada respon data pesanan');
            }

        } catch (error) {
            console.error('Error placing order:', error);
            alert('Terjadi kesalahan koneksi. Silakan coba lagi.');
            setIsProcessing(false);
        }
    };
    const handleClose = () => {
        setIsSuccess(false);
        setIsProcessing(false);
        setFormData({ nama: '', noHp: '', alamat: '' });
        onClose();
    };
    if (!isOpen) return null;

    // Tampilan Sukses
    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative z-10 text-center animate-bounce-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Terkirim! 🎉</h2>
                    <p className="text-gray-600 mb-6">
                        Terima kasih, <strong>{formData.nama}</strong>. <br />
                        Admin kami akan segera menghubungi Anda via WhatsApp untuk konfirmasi.
                    </p>
                    <button
                        onClick={handleClose}
                        className="w-full btn-primary py-3"
                    >
                        Oke, Siap Menunggu!
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-primary-600 text-white p-6 flex items-center justify-between shadow-lg z-10">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={24} />
                        <h2 className="text-xl font-bold">Checkout Pesanan</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {/* List Barang */}
                    <div className="p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <ShoppingBag size={48} className="mb-2 opacity-30" />
                                <p>Keranjang kosong</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex gap-3">
                                    <img src={item.imageUrl} className="w-16 h-16 rounded-md object-cover bg-gray-200" alt="" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-sm line-clamp-1">{item.nama}</h4>
                                                {item.isUnlimited && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded font-bold">PO</span>}
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>

                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded p-1 text-xs">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white rounded"><Minus size={12} /></button>
                                                <span className="w-4 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={!item.isUnlimited && item.quantity >= item.stok}
                                                    className="p-1 hover:bg-white rounded disabled:opacity-50"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            {item.isUnlimited && (
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 10)} className="text-[10px] text-purple-600 font-bold hover:bg-purple-50 px-2 py-1 rounded">+10</button>
                                            )}
                                            <span className="font-bold text-primary-600 text-sm">{formatPrice(item.harga * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Form Data Diri */}
                    {cart.length > 0 && (
                        <div className="p-4 bg-white m-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={18} className="text-primary-600" /> Data Pemesan
                            </h3>
                            <form id="checkoutForm" onSubmit={handlePlaceOrder} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            name="nama"
                                            value={formData.nama}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                            placeholder="Contoh: Budi Santoso"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Nomor WhatsApp</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="noHp"
                                            value={formData.noHp}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                            placeholder="Contoh: 081234567890"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Alamat Lengkap</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <textarea
                                            name="alamat"
                                            value={formData.alamat}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none resize-none"
                                            placeholder="Jalan, RT/RW, Patokan..."
                                            required
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {cart.length > 0 && (
                    <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500">Total Pembayaran</span>
                            <span className="text-xl font-bold text-primary-600">{formatPrice(getTotalPrice())}</span>
                        </div>

                        <button
                            type="submit"
                            form="checkoutForm"
                            disabled={isProcessing}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                                ${isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:scale-[1.01] active:scale-[0.98]'
                                }
                            `}
                        >
                            {isProcessing ? (
                                'Memproses...'
                            ) : (
                                <>
                                    <Send size={20} /> Kirim Pesanan
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
