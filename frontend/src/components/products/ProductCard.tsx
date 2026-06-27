import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { FiShoppingBag, FiEye } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop';

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const imageUrl = product.images?.[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : product.images[0]
    : PLACEHOLDER;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden bg-stone-100 h-72">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER;
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => addItem(product)}
            className="flex-1 bg-amber-400 text-stone-900 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:bg-amber-300"
          >
            <FiShoppingBag size={14} /> Add to Cart
          </button>
          <Link
            to={`/products/${product.id}`}
            className="bg-white text-stone-900 p-2 rounded-lg hover:bg-stone-100 flex items-center justify-center"
          >
            <FiEye size={16} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-amber-600 font-semibold tracking-wide uppercase mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-stone-800 leading-tight mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-stone-900">
            ${product.price.toFixed(2)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            product.stock > 5
              ? 'bg-green-100 text-green-700'
              : product.stock > 0
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
