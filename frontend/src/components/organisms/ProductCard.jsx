import React from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../atoms/Button'; // Import the Button atom

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = React.useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
        addToCart(product);

        // Reset animasi setelah 500ms
        setTimeout(() => {
            setIsAdding(false);
        }, 500);
    };

    // Format harga ke Rupiah
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const isOutOfStock = !product.isUnlimited && product.stok === 0;

    return (
        <div className="card overflow-hidden group flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100">
            {/* Gambar Produk */}
            <div className="relative aspect-square bg-gray-200 overflow-hidden">
                <img
                    src={product.imageUrl}
                    alt={product.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />

                {/* Badge Kategori */}
                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 opacity-80 sm:opacity-100">
                    <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-gray-700">
                        <Tag size={12} className="hidden sm:block" />
                        <span className="truncate max-w-[50px] sm:max-w-none">{product.kategori}</span>
                    </span>
                </div>

                {/* Badge Stok Habis */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-2 py-1 text-xs rounded font-bold">
                            Habis
                        </span>
                    </div>
                )}

                {/* Badge Pre-Order */}
                {product.isUnlimited && (
                    <div className="absolute bottom-2 right-2">
                        <span className="bg-purple-600/90 text-white px-2 py-1 text-[10px] sm:text-xs rounded font-bold shadow-sm backdrop-blur-sm">
                            Pre-Order
                        </span>
                    </div>
                )}
            </div>

            {/* Konten Produk */}
            <div className="p-2 sm:p-4 flex flex-col flex-1 gap-1 sm:gap-2">
                <h3 className="font-semibold text-xs sm:text-lg text-gray-900 line-clamp-2 leading-tight min-h-[2.5em] sm:min-h-[3.5em]">
                    {product.nama}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 hidden sm:block">
                    {product.deskripsi}
                </p>

                <div className="mt-auto pt-1 sm:pt-2">
                    <p className="text-xs sm:text-lg font-bold text-primary-600 mb-2 sm:mb-3 truncate">
                        {formatPrice(product.harga)}
                    </p>

                    {/* Add Button using Atom */}
                    <Button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAdding}
                        className={`text-xs sm:text-sm py-1.5 sm:py-2 ${isAdding ? 'bg-green-500 scale-95' : ''}`}
                    >
                        <ShoppingCart size={14} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">
                            {isAdding ? 'Ditambah!' : 'Tambah'}
                        </span>
                        <span className="sm:hidden font-bold">+</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;