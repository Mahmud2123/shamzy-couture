import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };

  return (
    <nav className="bg-stone-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-1">
            <span className="text-xl font-bold tracking-widest text-amber-400">SHAMZY</span>
            <span className="text-xl font-light tracking-widest">COUTURE</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-sm hover:text-amber-400 transition-colors tracking-wide">COLLECTIONS</Link>
            <Link to="/design-requests/new" className="text-sm hover:text-amber-400 transition-colors tracking-wide">BESPOKE</Link>
            <Link to="/measurements" className="text-sm hover:text-amber-400 transition-colors tracking-wide">MEASUREMENTS</Link>
            {isAdmin && <Link to="/admin" className="text-sm hover:text-amber-400 transition-colors tracking-wide text-amber-500">ADMIN</Link>}
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/cart" className="relative p-2 hover:text-amber-400 transition-colors">
              <FiShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 hover:text-amber-400 transition-colors">
                  <div className="w-7 h-7 bg-amber-400 text-stone-900 rounded-full flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm max-w-24 truncate">{user?.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-stone-900 rounded-xl shadow-xl py-1.5 z-50 border border-stone-100">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-stone-400 truncate">{user?.email}</p>
                    </div>
                    {[
                      { to: '/dashboard', label: 'Dashboard', icon: <FiUser size={14} /> },
                      { to: '/orders', label: 'My Orders', icon: <FiShoppingBag size={14} /> },
                      { to: '/profile', label: 'Edit Profile', icon: <FiUser size={14} /> },
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 transition-colors">
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 text-amber-600 transition-colors">
                        <FiSettings size={14} /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-stone-100" />
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-stone-50 text-red-500 transition-colors">
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm hover:text-amber-400 transition-colors">Login</Link>
                <Link to="/register" className="bg-amber-400 text-stone-900 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-300 transition-colors">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-stone-800 pt-3">
            {[
              { to: '/products', label: 'Collections' },
              { to: '/design-requests/new', label: 'Bespoke Design' },
              { to: '/measurements', label: 'Measurements' },
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400">{item.label}</Link>
            ))}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-amber-400">Admin Panel</Link>}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400">Dashboard</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400">Profile</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2 text-sm text-red-400">Logout</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm hover:text-amber-400">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-amber-400 text-stone-900 px-4 py-1.5 rounded-lg text-sm font-bold">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
