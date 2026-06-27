import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '../services/products';
import { Product } from '../types';
import ProductCard from '../components/products/ProductCard';
import { FiArrowRight, FiStar, FiTruck, FiRefreshCw } from 'react-icons/fi';

const CATEGORIES = ['SUITS', 'DRESSES', 'OUTERWEAR', 'SHIRTS', 'ACCESSORIES'];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsService.getAll()
      .then((all) => setFeatured(all.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-stone-900 text-white min-h-[85vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-amber-400 text-sm tracking-widest uppercase mb-4 font-semibold">
            Welcome to
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            SHAMZY
            <br />
            <span className="text-amber-400">COUTURE</span>
          </h1>
          <p className="text-xl text-stone-300 mb-8 max-w-xl leading-relaxed">
            Bespoke Fashion, Crafted for You. Every stitch tells your story — designed to perfection, made to last.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="bg-amber-400 text-stone-900 px-8 py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors flex items-center gap-2"
            >
              Shop Collections <FiArrowRight />
            </Link>
            <Link
              to="/design-requests/new"
              className="border border-white/40 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Request Bespoke
            </Link>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-amber-400 py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-stone-900">
          <div className="flex items-center gap-3 justify-center">
            <FiStar size={20} />
            <span className="text-sm font-semibold">Premium Italian Fabrics</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <FiTruck size={20} />
            <span className="text-sm font-semibold">Worldwide Shipping</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <FiRefreshCw size={20} />
            <span className="text-sm font-semibold">Perfect Fit Guarantee</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-stone-800 mb-2 text-center">Collections</h2>
          <p className="text-stone-500 text-center mb-10">Explore our curated fashion categories</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${cat}`}
                className="bg-white border border-stone-200 text-stone-700 px-6 py-3 rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all font-medium text-sm"
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Link>
            ))}
            <Link
              to="/products"
              className="bg-stone-900 text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-stone-700 transition-colors"
            >
              All Items
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-1">Featured Pieces</h2>
              <p className="text-stone-500">Hand-selected from our latest collection</p>
            </div>
            <Link
              to="/products"
              className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 text-sm"
            >
              View All <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-stone-100 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bespoke CTA */}
      <section className="bg-stone-900 text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-amber-400 text-sm tracking-widest uppercase mb-3">Custom Made</p>
          <h2 className="text-4xl font-bold mb-4">Request a Bespoke Creation</h2>
          <p className="text-stone-300 mb-8 text-lg leading-relaxed">
            Have a unique vision? Share your ideas and our master tailors will bring your dream garment to life with unmatched craftsmanship.
          </p>
          <Link
            to="/design-requests/new"
            className="bg-amber-400 text-stone-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-amber-300 transition-colors inline-flex items-center gap-2"
          >
            Start Your Design <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
