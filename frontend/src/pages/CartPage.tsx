import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersService } from '../services/orders';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    setPlacing(true);
    try {
      await ordersService.create({
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          customNotes: i.customNotes,
        })),
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FiShoppingBag size={60} className="mx-auto text-stone-300 mb-4" />
          <h2 className="text-2xl font-bold text-stone-700 mb-2">Your cart is empty</h2>
          <p className="text-stone-500 mb-6">Discover our beautiful collection</p>
          <Link
            to="/products"
            className="bg-stone-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-stone-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/products" className="text-stone-500 hover:text-stone-800">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-stone-900">
            Your Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity, customNotes }) => (
              <div key={product.id} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
                <img
                  src={product.images?.[0] || PLACEHOLDER}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg bg-stone-100 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-600 font-semibold uppercase">{product.category}</p>
                  <h3 className="font-semibold text-stone-800 truncate">{product.name}</h3>
                  {customNotes && <p className="text-xs text-stone-500 mt-0.5 truncate">"{customNotes}"</p>}
                  <p className="text-lg font-bold text-stone-900 mt-1">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-2 py-1">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="hover:text-stone-600">
                      <FiMinus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="hover:text-stone-600">
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-stone-900 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-stone-200 pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={placing}
                className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-700 transition-colors disabled:opacity-60 mb-3"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
              <Link
                to="/products"
                className="block text-center text-sm text-stone-500 hover:text-stone-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
