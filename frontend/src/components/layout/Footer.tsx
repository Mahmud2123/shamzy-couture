import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-amber-400 font-bold text-lg tracking-widest mb-3">SHAMZY COUTURE</h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Bespoke Fashion, Crafted for You. Every piece is a masterwork — tailored to perfection.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">COLLECTIONS</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=SUITS" className="hover:text-amber-400 transition-colors">Suits</Link></li>
              <li><Link to="/products?category=DRESSES" className="hover:text-amber-400 transition-colors">Dresses</Link></li>
              <li><Link to="/products?category=OUTERWEAR" className="hover:text-amber-400 transition-colors">Outerwear</Link></li>
              <li><Link to="/products?category=ACCESSORIES" className="hover:text-amber-400 transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">SERVICES</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/design-requests/new" className="hover:text-amber-400 transition-colors">Bespoke Design</Link></li>
              <li><Link to="/measurements" className="hover:text-amber-400 transition-colors">Save Measurements</Link></li>
              <li><Link to="/orders" className="hover:text-amber-400 transition-colors">Track Orders</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-700 mt-8 pt-6 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} SHAMZY COUTURE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
