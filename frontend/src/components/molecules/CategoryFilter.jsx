import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            <button
                onClick={() => onSelectCategory(null)}
                className={`
          px-4 py-2 rounded-full font-medium transition-all duration-200
          ${selectedCategory === null
                        ? 'bg-primary-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-card'
                    }
        `}
            >
                Semua Produk
            </button>

            {categories.map((kategori) => (
                <button
                    key={kategori}
                    onClick={() => onSelectCategory(kategori)}
                    className={`
            px-4 py-2 rounded-full font-medium transition-all duration-200
            ${selectedCategory === kategori
                            ? 'bg-primary-600 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-card'
                        }
          `}
                >
                    {kategori}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
