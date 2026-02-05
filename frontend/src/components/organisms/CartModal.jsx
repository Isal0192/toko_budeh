import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, MapPin, Phone, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/api';
import Button from '../atoms/Button';
import IconButton from '../atoms/IconButton';
import InputWithIcon from '../molecules/InputWithIcon';
import TextareaWithIcon from '../molecules/TextareaWithIcon';

const CartModal = ({ isOpen, onClose }) => {
    const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

    const [formData, setFormData] = useState({
        nama: '',
        noHp: '',
        alamat: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0 || !formData.nama || !formData.noHp || !formData.alamat) {
            alert('Keranjang kosong atau data belum lengkap!');
            return;
        }

        setIsProcessing(true);
        let finalAlamat = formData.alamat;
        try {
            const coords = await getUserLocation();
            if (coords) {
                const gMapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
                finalAlamat = `${finalAlamat}\n\n📍 Lokasi: ${gMapsUrl}`;
            }
        } catch (err) {
            console.warn("Gagal auto-location:", err);
        }

        try {
            const orderData = await createOrder({
                namaPelanggan: formData.nama,
                noHp: formData.noHp,
                alamat: finalAlamat,
                items: cart,
                total: getTotalPrice(),
            });

            if (orderData) {
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
                    <Button onClick={handleClose}>
                        Oke, Siap Menunggu!
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                <div className="bg-primary-600 text-white p-6 flex items-center justify-between shadow-lg z-10">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={24} />
                        <h2 className="text-xl font-bold">Checkout Pesanan</h2>
                    </div>
                    <IconButton onClick={onClose} className="text-white hover:bg-white/20">
                        <X size={24} />
                    </IconButton>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50">
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
                                            <IconButton variant="danger" size="sm" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded p-1 text-xs">
                                                <IconButton size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={12} /></IconButton>
                                                <span className="w-4 text-center font-medium">{item.quantity}</span>
                                                <IconButton size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={!item.isUnlimited && item.quantity >= item.stok}><Plus size={12} /></IconButton>
                                            </div>
                                            <span className="font-bold text-primary-600 text-sm">{formatPrice(item.harga * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="p-4 bg-white m-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={18} className="text-primary-600" /> Data Pemesan
                            </h3>
                            <form id="checkoutForm" onSubmit={handlePlaceOrder} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</label>
                                    <InputWithIcon
                                        icon={<User size={16} />}
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Budi Santoso"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Nomor WhatsApp</label>
                                    <InputWithIcon
                                        icon={<Phone size={16} />}
                                        type="tel"
                                        name="noHp"
                                        value={formData.noHp}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 081234567890"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Alamat Lengkap</label>
                                    <TextareaWithIcon
                                        icon={<MapPin size={16} />}
                                        name="alamat"
                                        value={formData.alamat}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Jalan, RT/RW, Patokan..."
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500">Total Pembayaran</span>
                            <span className="text-xl font-bold text-primary-600">{formatPrice(getTotalPrice())}</span>
                        </div>
                        <Button
                            type="submit"
                            form="checkoutForm"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Memproses...' : <><Send size={20} /> Kirim Pesanan</>}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;