import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, LogOut, Package, ShoppingCart, Users, Clock, Phone, MapPin, ChevronDown, ChevronUp, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000/api';

const AdminPage = () => {
    // Tab State: 'products' | 'orders' | 'mitra'
    const [activeTab, setActiveTab] = useState('products');

    // --- STATE PRODUK ---
    const [formData, setFormData] = useState({
        nama: '', harga: '', kategori: '', stok: '', deskripsi: '',
        isUnlimited: false, mitraId: '' // Added mitraId
    });
    const [imageFile, setImageFile] = useState(null);
    const [products, setProducts] = useState([]);

    // --- STATE MITRA ---
    const [mitraList, setMitraList] = useState([]);
    const [mitraForm, setMitraForm] = useState({
        nama: '', noHp: '', alamat: '', persenBagi: '90'
    });

    // --- STATE ORDER & UMUM ---
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();
    const categories = ['Sembako', 'Snack', 'Minuman', 'Sabun', 'Jajanan Pasar'];

    const getAuthHeader = () => {
        const token = localStorage.getItem('adminToken');
        return { 'Authorization': `Bearer ${token}` };
    };

    // --- EFFECT: LOAD DATA ---
    useEffect(() => {
        // Load data on tab change
        if (activeTab === 'products') {
            fetchProducts();
            fetchMitra(); // Load mitra for dropdown
        }
        else if (activeTab === 'mitra') fetchMitra();
        else if (activeTab === 'orders') fetchOrders();
    }, [activeTab]);

    // --- FETCH FUNCTIONS ---
    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            if (data.success) setProducts(data.data);
        } catch (error) { console.error('Gagal load produk', error); }
    };

    const fetchMitra = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/mitra`, { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) setMitraList(data.data);
        } catch (error) { console.error('Gagal load mitra', error); }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`, { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) {
                const parsedOrders = data.data.map(order => ({
                    ...order,
                    items: JSON.parse(order.items)
                }));
                setOrders(parsedOrders);
            } else if (res.status === 401) handleLogout();
        } catch (error) { console.error('Gagal load orders', error); }
    };

    // --- HANDLERS: PRODUK ---
    const handleProductChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage(null);
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
            if (imageFile) dataToSend.append('image', imageFile);

            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST', headers: getAuthHeader(), body: dataToSend,
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            setMessage({ type: 'success', text: 'Produk berhasil ditambahkan!' });
            setFormData({ nama: '', harga: '', kategori: '', stok: '', deskripsi: '', isUnlimited: false, mitraId: '' });
            setImageFile(null);
            document.getElementById('fileInput').value = '';
            fetchProducts();
        } catch (error) { setMessage({ type: 'error', text: error.message }); }
        finally { setIsLoading(false); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Hapus produk ini?')) return;
        setIsDeleting(id);
        try {
            await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: getAuthHeader() });
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) { alert('Gagal hapus'); }
        finally { setIsDeleting(null); }
    };

    // --- HANDLERS: MITRA ---
    const handleMitraChange = (e) => setMitraForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmitMitra = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage(null);
        try {
            const res = await fetch(`${API_BASE_URL}/mitra`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(mitraForm)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            setMessage({ type: 'success', text: 'Mitra baru berhasil direkrut!' });
            setMitraForm({ nama: '', noHp: '', alamat: '', persenBagi: '90' });
            fetchMitra();
        } catch (error) { setMessage({ type: 'error', text: error.message }); }
        finally { setIsLoading(false); }
    };

    const handleDeleteMitra = async (id) => {
        if (!window.confirm('Yakin putus kemitraan?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/mitra/${id}`, { method: 'DELETE', headers: getAuthHeader() });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            fetchMitra();
        } catch (err) { alert(err.message); }
    };

    const handleLogout = () => { localStorage.removeItem('adminToken'); navigate('/login'); };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto">
                {/* Header & Nav */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link to="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></Link>
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                        {[
                            { id: 'products', label: 'Produk', icon: Package },
                            { id: 'mitra', label: 'Kemitraan', icon: Users },
                            { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium ml-auto sm:ml-0">Logout</button>
                </div>

                {/* --- TAB: PRODUK --- */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Produk */}
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-card p-6 h-fit sticky top-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Save size={20} className="text-primary-600" /> Tambah Produk</h2>
                            {message && <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>}

                            <form onSubmit={handleSubmitProduct} className="space-y-3">
                                <input name="nama" required value={formData.nama} onChange={handleProductChange} className="input-field" placeholder="Nama Produk" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" name="harga" required value={formData.harga} onChange={handleProductChange} className="input-field" placeholder="Harga (Rp)" />
                                    <input type="number" name="stok" disabled={formData.isUnlimited} required={!formData.isUnlimited} value={formData.stok} onChange={handleProductChange} className={`input-field ${formData.isUnlimited ? 'bg-gray-100' : ''}`} placeholder={formData.isUnlimited ? '-' : 'Stok'} />
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <input type="checkbox" id="isUnlimited" name="isUnlimited" checked={formData.isUnlimited} onChange={handleProductChange} className="w-4 h-4 text-primary-600 cursor-pointer" />
                                    <label htmlFor="isUnlimited" className="text-xs font-bold text-purple-700">Set Pre-Order (Unlimited)</label>
                                </div>
                                <select name="kategori" required value={formData.kategori} onChange={handleProductChange} className="input-field bg-white">
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <select name="mitraId" value={formData.mitraId} onChange={handleProductChange} className="input-field bg-white border-blue-200">
                                    <option value="">Produk Milik Sendiri</option>
                                    {mitraList.map(m => <option key={m.id} value={m.id}>Mitra: {m.nama} ({m.persenBagi}%)</option>)}
                                </select>
                                <input id="fileInput" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary-50 file:text-primary-700" />
                                <textarea name="deskripsi" rows="2" value={formData.deskripsi} onChange={handleProductChange} className="input-field" placeholder="Deskripsi..." />
                                <button type="submit" disabled={isLoading} className="w-full btn-primary">{isLoading ? 'Loading...' : 'Simpan Produk'}</button>
                            </form>
                        </div>

                        {/* List Produk */}
                        <div className="lg:col-span-2 space-y-3">
                            {products.map(p => (
                                <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 hover:shadow-md transition-shadow relative overflow-hidden">
                                    {/* Badge Mitra */}
                                    {p.mitra && (
                                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                                            <Users size={10} /> {p.mitra.nama}
                                        </div>
                                    )}
                                    <img src={p.imageUrl} alt={p.nama} className="w-16 h-16 object-cover rounded-lg bg-gray-100" onError={e => e.target.src = 'https://via.placeholder.com/150'} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{p.nama}</h3>
                                        <div className="flex gap-2 my-1">
                                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.kategori}</span>
                                            {p.isUnlimited ?
                                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">PO</span> :
                                                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${p.stok === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.stok} Stok</span>
                                            }
                                        </div>
                                        <p className="font-bold text-primary-600 text-sm">Rp {p.harga.toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="self-end text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )} // END TAB PRODUCTS

                {/* --- TAB: MITRA --- */}
                {activeTab === 'mitra' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-card p-6 h-fit">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600"><Users size={20} /> Tambah Mitra</h2>
                            {message && <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>}

                            <form onSubmit={handleSubmitMitra} className="space-y-3">
                                <input name="nama" required value={mitraForm.nama} onChange={handleMitraChange} className="input-field" placeholder="Nama Mitra" />
                                <input name="noHp" required value={mitraForm.noHp} onChange={handleMitraChange} className="input-field" placeholder="No HP / WA" />
                                <input name="alamat" value={mitraForm.alamat} onChange={handleMitraChange} className="input-field" placeholder="Alamat" />
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Persentase Bagi Hasil (Untuk Mitra)</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" name="persenBagi" max="100" min="1" required value={mitraForm.persenBagi} onChange={handleMitraChange} className="input-field text-center font-bold" />
                                        <span className="font-bold text-gray-500">%</span>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full btn-primary bg-blue-600 hover:bg-blue-700">{isLoading ? 'Loading...' : 'Rekrut Mitra'}</button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mitraList.length === 0 ? <p className="text-gray-500 italic p-4">Belum ada mitra.</p> :
                                    mitraList.map(m => (
                                        <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-50 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                        {m.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">{m.nama}</h3>
                                                        <p className="text-xs text-gray-500">{m.products?.length || 0} Produk</p>
                                                    </div>
                                                </div>
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">Bagi: {m.persenBagi}%</span>
                                            </div>
                                            <div className="text-sm text-gray-600 pl-12 space-y-1">
                                                <p className="flex items-center gap-2"><Phone size={12} /> {m.noHp}</p>
                                                <p className="flex items-center gap-2"><MapPin size={12} /> {m.alamat || '-'}</p>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-gray-50 flex justify-end">
                                                <button onClick={() => handleDeleteMitra(m.id)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1"><Trash2 size={12} /> Hapus Mitra</button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )} // END TAB MITRA

                {/* --- TAB: ORDERS --- */}
                {activeTab === 'orders' && (
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
                )}
            </div>
        </div>
    );
};

// Sub-component OrderCard (Simplified for brevity but same functionality)
const OrderCard = ({ order }) => {
    const [open, setOpen] = useState(false);

    // Status Logic
    const handleStatus = async (s) => {
        if (!confirm('Ubah status?')) return;
        const res = await fetch(`${API_BASE_URL}/orders/${order.id}/status`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: JSON.stringify({ status: s })
        });
        if (res.ok) window.location.reload(); // Simple reload for state sync
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
                                // Cek jika baris mengandung URL (misal Google Maps)
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
                        <a href={`https://wa.me/${order.noHp}`} target="_blank" className="bg-green-500 text-white px-3 py-1 rounded">Chat</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
