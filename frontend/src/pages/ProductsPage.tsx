import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsService } from '../services/products';
import { Product } from '../types';
import ProductCard from '../components/products/ProductCard';
import { FiFilter } from 'react-icons/fi';

const CATEGORIES = ['', 'SUITS', 'DRESSES', 'OUTERWEAR', 'SHIRTS', 'ACCESSORIES'];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = searchParams.get('category') || '';

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError('');
    productsService
      .getAll(category || undefined)
      .then(setProducts)
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">
            {category ? category.charAt(0) + category.slice(1).toLowerCase() : 'All Collections'}
          </h1>
          <p className="text-stone-300">
            {loading ? 'Loading...' : `${products.length} piece${products.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto">
          <FiFilter size={16} className="text-stone-500 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat || 'all'}
              onClick={() => setSearchParams(cat ? { category: cat } : {})}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat ? cat.charAt(0) + cat.slice(1).toLowerCase() : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-stone-200 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchProducts} className="bg-stone-900 text-white px-6 py-2 rounded-lg hover:bg-stone-700">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
