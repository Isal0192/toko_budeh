import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000/api';
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                // Simpan token
                localStorage.setItem('adminToken', data.token);
                // Redirect ke admin
                navigate('/admin');
            } else {
                setError(data.message || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound size={32} className="text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Login Admin</h1>
                    <p className="text-gray-500 mt-2">Masuk untuk mengelola toko</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Admin
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field py-3"
                            placeholder="Masukkan password admin..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg"
                    >
                        {isLoading ? 'Memproses...' : (
                            <>
                                Masuk <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-500 hover:text-primary-600"
                    >
                        &larr; Kembali ke Toko
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
