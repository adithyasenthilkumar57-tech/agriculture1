'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/marketplace/listings/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setListing(data.data);
        }
      } catch (err) {
        console.error('Failed to load listing', err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchListing();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="card p-12 text-center text-neutral-500 max-w-md mx-auto my-8 space-y-3">
        <span className="text-4xl block">🏪</span>
        <h3 className="font-bold text-base text-neutral-800">Listing Not Found</h3>
        <p className="text-xs text-neutral-500">This agricultural listing may have been sold or removed.</p>
        <Link href="/marketplace" className="btn btn-primary btn-sm">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
            {listing.category}
          </span>
          <h1 className="text-2xl font-bold font-display text-neutral-900">{listing.title}</h1>
        </div>
        <Link href="/marketplace" className="btn btn-ghost btn-sm text-xs">
          ← Back to Market
        </Link>
      </div>

      <div className="card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="text-3xl font-black text-green-700 font-display">
              ₹{listing.price?.value}{' '}
              <span className="text-xs text-neutral-500 font-normal">
                / {listing.price?.unit?.replace(/per_/g, '') || 'kg'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {listing.price?.negotiable ? 'Price Negotiable' : 'Fixed Price'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-success text-xs">
              Grade {listing.grade || 'Standard'}
            </span>
            <span className="badge badge-neutral text-xs">
              Available: {listing.quantity?.available} {listing.quantity?.unit}
            </span>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">Produce</span>
            <span className="font-bold text-neutral-900">{listing.cropName}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">Variety</span>
            <span className="font-bold text-neutral-900">{listing.variety || 'Standard'}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">Location</span>
            <span className="font-bold text-neutral-900">
              {listing.location?.district}, {listing.location?.state}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">Harvest Date</span>
            <span className="font-bold text-neutral-900">
              {listing.harvestDate ? new Date(listing.harvestDate).toLocaleDateString() : 'Fresh'}
            </span>
          </div>
        </div>

        {listing.description && (
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-neutral-800">Description</h4>
            <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
              {listing.description}
            </p>
          </div>
        )}

        {/* Farmer Profile Card */}
        <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-800">
              Verified Farmer Contact
            </span>
            <h4 className="font-bold text-sm text-neutral-900">
              {listing.farmer?.name || 'Verified Farmer'}
            </h4>
            <p className="text-neutral-600">
              📞 Phone: {listing.farmer?.phone || 'Contact via platform booking'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/transport/book?crop=${encodeURIComponent(listing.cropName)}&quantity=${listing.quantity?.available}`}
              className="btn btn-transport btn-sm text-xs font-bold"
            >
              🚜 Arrange Transport for this Produce
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
