import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsService } from '../services/products';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { FiShoppingBag, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=700&fit=crop';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    productsService.getById(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Product not found</h2>
        <Link to="/products" className="text-amber-600 hover:underline">Back to Collections</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-8 text-sm">
          <FiArrowLeft size={16} /> Back to Collections
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-stone-100 rounded-2xl overflow-hidden aspect-[4/5]">
            <img
              src={product.images?.[0] || PLACEHOLDER}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-amber-600 font-semibold text-sm tracking-wide uppercase mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold text-stone-900 mb-4">{product.name}</h1>
            <p className="text-4xl font-bold text-stone-900 mb-6">${product.price.toFixed(2)}</p>
            <p className="text-stone-600 leading-relaxed mb-8">{product.description}</p>

            {/* Stock */}
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.stock > 5 ? 'bg-green-100 text-green-700'
                : product.stock > 0 ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-stone-700 mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            {/* Custom Notes */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-stone-700 mb-2 block">
                Custom Notes <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Any specific requirements, alterations, or preferences..."
                className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                rows={3}
              />
            </div>

            <button
              disabled={product.stock === 0}
              onClick={() => addItem(product, quantity, customNotes || undefined)}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingBag size={20} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
