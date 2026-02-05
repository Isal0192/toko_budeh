import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Users, ShoppingCart } from 'lucide-react';

import ProductTab from '../components/organisms/admin/ProductTab';
import MitraTab from '../components/organisms/admin/MitraTab';
import OrderTab from '../components/organisms/admin/OrderTab';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('products');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return <ProductTab />;
            case 'mitra':
                return <MitraTab />;
            case 'orders':
                return <OrderTab />;
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'products', label: 'Produk', icon: Package },
        { id: 'mitra', label: 'Kemitraan', icon: Users },
        { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto">
                {/* Header & Nav */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link to="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium ml-auto sm:ml-0"
                    >
                        Logout
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;