import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';

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
                localStorage.setItem('adminToken', data.token);
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
            <Card className="w-full max-w-md p-8">
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

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Admin
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password admin..."
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : (
                            <>
                                Masuk <ArrowRight size={20} />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="text-sm"
                    >
                        &larr; Kembali ke Toko
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;