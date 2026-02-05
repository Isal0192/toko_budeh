import React, { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000/api';

const OrderCard = ({ order }) => {
    const [open, setOpen] = useState(false);

    const getAuthHeader = () => {
        const token = localStorage.getItem('adminToken');
        return { 'Authorization': `Bearer ${token}` };
    };

    const handleStatus = async (s) => {
        if (!confirm('Ubah status?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${order.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ status: s })
            });
            if (res.ok) {
                // This is not ideal, a proper state management solution (like context or Zustand)
                // would be better to avoid a full reload. But for now, it works.
                window.location.reload();
            } else {
                const data = await res.json();
                alert(`Gagal update status: ${data.message}`);
            }
        } catch (error) {
            alert('Gagal menghubungi server untuk update status.');
        }
    };

    return (
        <div className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(!open)}>
                <div>
                    <h3 className="font-bold">{order.namaPelanggan} <span className="text-sm font-normal text-gray-500">({order.status})</span></h3>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-primary-600">Rp {order.total.toLocaleString()}</p>
                </div>
            </div>
            {open && (
                <div className="mt-3 bg-white p-3 border rounded text-sm">
                    <div className="mb-2 text-gray-700">
                        <strong>Alamat:</strong>
                        <div className="ml-2 whitespace-pre-wrap">
                            {order.alamat.split('\n').map((line, i) => {
                                const urlRegex = /(https?:\/\/[^\s]+)/g;
                                const parts = line.split(urlRegex);
                                return (
                                    <div key={i}>
                                        {parts.map((part, j) => {
                                            if (part.match(urlRegex)) {
                                                return (
                                                    <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold hover:text-blue-800 flex items-center gap-1">
                                                        <MapPin size={14} /> Buka Lokasi (Google Maps)
                                                    </a>
                                                );
                                            }
                                            return part;
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                            <Phone size={12} /> {order.noHp}
                        </div>
                    </div>
                    <ul className="space-y-1 mb-3">
                        {order.items.map((i, k) => (
                            <li key={k} className="flex justify-between">
                                <span>{i.quantity}x {i.nama}</span>
                                <span>{(i.harga * i.quantity).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2 justify-end">
                        <select className="border p-1 rounded" value={order.status} onChange={(e) => handleStatus(e.target.value)}>
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSED">PROCESSED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <a href={`https://wa.me/${order.noHp}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-3 py-1 rounded">Chat</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
