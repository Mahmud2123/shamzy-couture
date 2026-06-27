import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../services/orders';
import { Order } from '../types';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PRODUCTION: 'bg-purple-100 text-purple-700', SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    ordersService.getMyOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <FiPackage size={50} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-600 mb-6">You haven't placed any orders yet</p>
            <Link to="/products" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-stone-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header row */}
                <div
                  className="p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-stone-400 font-mono mb-0.5">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-stone-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="text-lg font-bold text-stone-900">${order.totalAmount.toFixed(2)}</span>
                      {expandedId === order.id ? <FiChevronUp size={16} className="text-stone-400" /> : <FiChevronDown size={16} className="text-stone-400" />}
                    </div>
                  </div>

                  {/* Progress bar (not for cancelled) */}
                  {order.status !== 'CANCELLED' && (
                    <div className="mt-4">
                      <div className="flex items-center gap-0">
                        {STATUS_STEPS.map((step, idx) => {
                          const current = stepIndex(order.status);
                          const done = idx <= current;
                          const active = idx === current;
                          return (
                            <React.Fragment key={step}>
                              <div className={`flex flex-col items-center flex-shrink-0`}>
                                <div className={`w-3 h-3 rounded-full transition-colors ${done ? 'bg-stone-900' : 'bg-stone-200'} ${active ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`} />
                                <p className="text-xs mt-1 text-stone-400 hidden sm:block whitespace-nowrap">{step.replace('_', ' ')}</p>
                              </div>
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 ${idx < current ? 'bg-stone-900' : 'bg-stone-200'}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded items */}
                {expandedId === order.id && (
                  <div className="border-t border-stone-100 p-5">
                    <h4 className="text-sm font-semibold text-stone-600 mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-stone-50 last:border-0">
                          <div>
                            <p className="font-medium text-stone-800">{item.product?.name ?? 'Product'}</p>
                            {item.customNotes && <p className="text-xs text-stone-400 italic mt-0.5">"{item.customNotes}"</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-stone-500">×{item.quantity}</p>
                            <p className="font-semibold text-stone-800">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mt-3 p-3 bg-stone-50 rounded-lg">
                        <p className="text-xs font-semibold text-stone-500 mb-1">Order Notes</p>
                        <p className="text-sm text-stone-600">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
