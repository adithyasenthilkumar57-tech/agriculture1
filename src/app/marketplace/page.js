'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/shared/EmptyState';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = '/api/marketplace/listings';
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (searchQuery) params.append('q', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setListings(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">🏪 Agricultural Marketplace</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Direct farmer-to-buyer agricultural produce trading with built-in logistics
          </p>
        </div>

        {user && (
          <Link href="/marketplace/new" className="btn btn-primary btn-sm text-xs font-bold">
            + List Produce for Sale
          </Link>
        )}
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crops, produce varieties, grains..."
            className="input text-xs flex-1"
          />
          <button type="submit" className="btn btn-ghost btn-sm text-xs">
            Search 🔍
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          {['all', 'vegetable', 'fruit', 'grain', 'pulse', 'oilseed', 'spice'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="skeleton h-56 w-full" />
          <div className="skeleton h-56 w-full" />
          <div className="skeleton h-56 w-full" />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item._id} className="card p-5 space-y-3 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 block">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-base text-neutral-900 font-display">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Crop: {item.cropName} {item.variety && `(${item.variety})`}
                    </p>
                  </div>

                  <span className="badge badge-success text-[10px]">
                    Grade {item.grade || 'Standard'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Available</span>
                    <span className="font-bold text-neutral-900">
                      {item.quantity?.available} {item.quantity?.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 block">Price</span>
                    <span className="font-bold text-green-700 text-sm">
                      ₹{item.price?.value} / {item.price?.unit?.replace(/per_/g, '') || 'kg'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 space-y-0.5">
                  <p>📍 Location: {item.location?.district}, {item.location?.state}</p>
                  <p>👨‍🌾 Farmer: {item.farmer?.name || 'Verified Farmer'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                <Link
                  href={`/transport/book?crop=${encodeURIComponent(item.cropName)}&quantity=${item.quantity?.available}`}
                  className="btn btn-transport btn-sm text-[11px] flex-1 py-1.5"
                >
                  🚜 Arrange Transport
                </Link>

                <Link
                  href={`/marketplace/${item._id}`}
                  className="btn btn-outline btn-sm text-[11px] py-1.5"
                >
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏪"
          title="No Agricultural Products Listed Yet"
          description="Be the first farmer to list your fresh harvested produce, grains, fruits, or vegetables for buyers in the region."
          actionLabel={user ? 'Create First Listing' : 'Register to List Produce'}
          actionHref={user ? '/marketplace/new' : '/register'}
        />
      )}
    </div>
  );
}
