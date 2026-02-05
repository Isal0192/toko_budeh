import React, { useState, useEffect } from 'react';
import { Users, Trash2, Phone, MapPin } from 'lucide-react';
import Card from '../../atoms/Card';
import Input from '../../atoms/Input';
import Button from '../../atoms/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { 'Authorization': `Bearer ${token}` };
};

const MitraTab = () => {
    const [mitraList, setMitraList] = useState([]);
    const [mitraForm, setMitraForm] = useState({
        nama: '', noHp: '', alamat: '', persenBagi: '90'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchMitra();
    }, []);

    const fetchMitra = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/mitra`, { headers: getAuthHeader() });
            const data = await res.json();
            if (data.success) setMitraList(data.data);
        } catch (error) { console.error('Gagal load mitra', error); }
    };

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 h-fit">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600"><Users size={20} /> Tambah Mitra</h2>
                {message && <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>}

                <form onSubmit={handleSubmitMitra} className="space-y-4">
                    <Input name="nama" required value={mitraForm.nama} onChange={handleMitraChange} placeholder="Nama Mitra" />
                    <Input name="noHp" required value={mitraForm.noHp} onChange={handleMitraChange} placeholder="No HP / WA" />
                    <Input name="alamat" value={mitraForm.alamat} onChange={handleMitraChange} placeholder="Alamat" />
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Persentase Bagi Hasil (Untuk Mitra)</label>
                        <div className="flex items-center gap-2">
                            <Input type="number" name="persenBagi" max="100" min="1" required value={mitraForm.persenBagi} onChange={handleMitraChange} className="text-center font-bold" />
                            <span className="font-bold text-gray-500">%</span>
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                        {isLoading ? 'Loading...' : 'Rekrut Mitra'}
                    </Button>
                </form>
            </Card>

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
    );
};

export default MitraTab;