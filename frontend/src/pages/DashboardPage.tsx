import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiShoppingBag, FiEdit3, FiSettings, FiTool, FiGrid, FiBox } from 'react-icons/fi';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const cards = [
     {
    icon: <FiShoppingBag size={24} />,
    title: 'My Orders',
    description: 'Track and manage your orders',
    href: '/orders',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <FiTool size={24} />, // or FiGrid, FiBox, FiMaximize2
    title: 'Measurements',
    description: 'Save your body measurements for perfect fits',
    href: '/measurements',
    color: 'bg-green-50 text-green-600',
  },
    {
      icon: <FiEdit3 size={24} />,
      title: 'Design Requests',
      description: 'Your custom bespoke design requests',
      href: '/design-requests',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Welcome, {user?.name}</h1>
          <p className="text-stone-500 mt-1">{user?.email} · {user?.role}</p>
        </div>

        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiSettings size={20} className="text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">Admin Access</p>
                <p className="text-sm text-amber-600">You have full access to the admin panel</p>
              </div>
            </div>
            <Link
              to="/admin"
              className="bg-amber-400 text-stone-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-amber-300 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-stone-800 mb-1">{card.title}</h3>
              <p className="text-stone-500 text-sm">{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-stone-900 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Ready to order something bespoke?</h3>
            <p className="text-stone-300 text-sm mt-1">Submit a custom design request and our tailors will get in touch</p>
          </div>
          <Link
            to="/design-requests/new"
            className="bg-amber-400 text-stone-900 px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-amber-300 transition-colors"
          >
            New Request
          </Link>
        </div>
      </div>
    </div>
  );
}
