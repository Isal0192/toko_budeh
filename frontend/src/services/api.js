const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:5000/api';

// Fetch semua produk atau filter berdasarkan kategori
export const fetchProducts = async (kategori = null) => {
    try {
        const url = kategori
            ? `${API_BASE_URL}/products?kategori=${encodeURIComponent(kategori)}`
            : `${API_BASE_URL}/products`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Gagal mengambil produk');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Simpan pesanan
export const createOrder = async (orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Gagal menyimpan pesanan');
        }

        return data.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};
