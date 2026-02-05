import React, { useState, useEffect } from 'react';
import { Save, Trash2, Users } from 'lucide-react';
import Card from '../../atoms/Card';
import Input from '../../atoms/Input';
import Button from '../../atoms/Button';
import Select from '../../atoms/Select';
import Textarea from '../../atoms/Textarea';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { 'Authorization': `Bearer ${token}` };
};

const ProductTab = () => {
    const [formData, setFormData] = useState({
        nama: '', harga: '', kategori: '', stok: '', deskripsi: '',
        isUnlimited: false, mitraId: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [products, setProducts] = useState([]);
    const [mitraList, setMitraList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const categories = ['Sembako', 'Snack', 'Minuman', 'Sabun', 'Jajanan Pasar'];

    useEffect(() => {
        fetchProducts();
        fetchMitra();
    }, []);

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
        try {
            await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: getAuthHeader() });
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) { alert('Gagal hapus'); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 h-fit sticky top-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Save size={20} className="text-primary-600" /> Tambah Produk</h2>
                {message && <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>}

                <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <Input name="nama" required value={formData.nama} onChange={handleProductChange} placeholder="Nama Produk" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" name="harga" required value={formData.harga} onChange={handleProductChange} placeholder="Harga (Rp)" />
                        <Input type="number" name="stok" disabled={formData.isUnlimited} required={!formData.isUnlimited} value={formData.stok} onChange={handleProductChange} placeholder={formData.isUnlimited ? '-' : 'Stok'} />
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg border border-purple-100">
                        <input type="checkbox" id="isUnlimited" name="isUnlimited" checked={formData.isUnlimited} onChange={handleProductChange} className="w-4 h-4 text-primary-600 cursor-pointer" />
                        <label htmlFor="isUnlimited" className="text-xs font-bold text-purple-700">Set Pre-Order (Unlimited)</label>
                    </div>
                    <Select name="kategori" required value={formData.kategori} onChange={handleProductChange}>
                        <option value="">Pilih Kategori</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Select>
                    <Select name="mitraId" value={formData.mitraId} onChange={handleProductChange} className="border-blue-200">
                        <option value="">Produk Milik Sendiri</option>
                        {mitraList.map(m => <option key={m.id} value={m.id}>Mitra: {m.nama} ({m.persenBagi}%)</option>)}
                    </Select>
                    <Input id="fileInput" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary-50 file:text-primary-700" />
                    <Textarea name="deskripsi" rows={2} value={formData.deskripsi} onChange={handleProductChange} placeholder="Deskripsi..." />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Loading...' : 'Simpan Produk'}
                    </Button>
                </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
                {products.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 hover:shadow-md transition-shadow relative overflow-hidden">
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
    );
};

export default ProductTab;