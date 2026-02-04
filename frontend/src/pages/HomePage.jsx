import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import CartModal from '../components/CartModal';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { getTotalItems } = useCart();

    // Load products saat komponen dimount
    useEffect(() => {
        loadProducts();
    }, []);

    // Filter products berdasarkan kategori
    useEffect(() => {
        if (selectedCategory) {
            setFilteredProducts(products.filter(p => p.kategori === selectedCategory));
        } else {
            setFilteredProducts(products);
        }
    }, [selectedCategory, products]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const data = await fetchProducts();
            setProducts(data);
            setFilteredProducts(data);

            // Extract unique categories
            const uniqueCategories = [...new Set(data.map(p => p.kategori))];
            setCategories(uniqueCategories);

            setError(null);
        } catch (err) {
            setError('Gagal memuat produk. Silakan coba lagi.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const totalItems = getTotalItems();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-600 p-2 rounded-xl">
                                <Store size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Toko Bueh</h1>
                                <p className="text-sm text-gray-600">Warung Digital Modern</p>
                            </div>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                        >
                            <ShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-warung-orange text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
                {/* Welcome Section */}
                <div className="mb-4 sm:mb-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                        Selamat Datang! 👋
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                        Belanja kebutuhan sehari-hari jadi lebih mudah
                    </p>
                </div>

                {/* Category Filter */}
                {!isLoading && categories.length > 0 && (
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader size={48} className="animate-spin text-primary-600 mb-4" />
                        <p className="text-gray-600">Memuat produk...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                        <p className="font-medium">{error}</p>
                        <button
                            onClick={loadProducts}
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                {!isLoading && !error && (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">
                                    Tidak ada produk dalam kategori ini
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-2 sm:mb-4 text-xs sm:text-sm text-gray-600">
                                    Menampilkan {filteredProducts.length} produk
                                    {selectedCategory && ` dalam kategori "${selectedCategory}"`}
                                </div>

                                {/* MODIFIED GRID: 4 columns on mobile, gap-2 */}
                                <div className="grid grid-cols-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6">
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © 2026 Toko Bueh - Warung Digital Modern
                    </p>
                </div>
            </footer>

            {/* Cart Modal */}
            <CartModal
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </div>
    );
}

export default HomePage;
