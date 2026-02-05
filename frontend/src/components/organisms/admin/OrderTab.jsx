import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import OrderCard from './OrderCard';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { 'Authorization': `Bearer ${token}` };
};

const OrderTab = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`, { headers: getAuthHeader() });
            if (res.status === 401) {
                handleLogout();
                return;
            }
            const data = await res.json();
            if (data.success) {
                const parsedOrders = data.data.map(order => ({
                    ...order,
                    items: JSON.parse(order.items)
                }));
                setOrders(parsedOrders);
            }
        } catch (error) {
            console.error('Gagal load orders', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-card min-h-[500px]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-primary-600" /> Pesanan Masuk</h2>
                <button onClick={fetchOrders} className="text-sm text-primary-600 hover:underline">Refresh</button>
            </div>
            <div className="divide-y divide-gray-100">
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
                {orders.length === 0 && <div className="p-8 text-center text-gray-400">Belum ada pesanan</div>}
            </div>
        </div>
    );
};

export default OrderTab;
