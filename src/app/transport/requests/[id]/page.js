'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function TransportRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/transport/requests/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setRequestData(data.data);
      }
    } catch (err) {
      console.error('Failed to load transport request', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchRequest();
  }, [params.id]);

  const handleAcceptOffer = async (offerId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transport/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (res.ok) {
        router.push('/transport');
      }
    } catch (err) {
      console.error('Failed to accept offer', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="card p-12 text-center text-neutral-500 max-w-md mx-auto my-8 space-y-3">
        <span className="text-4xl block">🚜</span>
        <h3 className="font-bold text-base text-neutral-800">Transport Request Not Found</h3>
        <Link href="/transport" className="btn btn-primary btn-sm">
          Return to Transport Dashboard
        </Link>
      </div>
    );
  }

  const { cargo, pickup, destination, preferredDate, preferredTime, estimatedCost, status, offers = [] } = requestData;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-transport-700">
            Transport Request Details
          </span>
          <h1 className="text-2xl font-bold font-display text-neutral-900">
            {cargo?.name} ({cargo?.quantity?.value} {cargo?.quantity?.unit})
          </h1>
        </div>
        <Link href="/transport" className="btn btn-ghost btn-sm text-xs">
          ← Back to Transport
        </Link>
      </div>

      {/* Summary Card */}
      <div className="card p-6 space-y-4 border-l-4 border-l-transport-500">
        <div className="flex items-center justify-between">
          <span className="badge badge-transport capitalize text-xs">
            Status: {status.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-neutral-500">
            Est. Cost: <strong className="text-neutral-800">₹{estimatedCost?.value || '—'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
          <div className="space-y-1">
            <span className="text-neutral-400 block text-[10px] font-bold uppercase">Pickup Location</span>
            <p className="font-semibold text-neutral-900">{pickup?.address}</p>
            <p className="text-neutral-500">Contact: {pickup?.contactName} (📞 {pickup?.contactPhone || 'On file'})</p>
          </div>

          <div className="space-y-1">
            <span className="text-neutral-400 block text-[10px] font-bold uppercase">Destination</span>
            <p className="font-semibold text-neutral-900">{destination?.name || 'Destination'}</p>
            <p className="text-neutral-600">{destination?.address}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-neutral-600 pt-1">
          <span>📅 Date: <strong>{new Date(preferredDate).toLocaleDateString()}</strong></span>
          <span>⏰ Time: <strong>{preferredTime || 'Flexible'}</strong></span>
          <span>❄️ Cold-Chain: <strong>{cargo?.requiresRefrigeration ? 'Yes (Refrigerated)' : 'No (Standard)'}</strong></span>
        </div>
      </div>

      {/* Received Offers Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-neutral-900 font-display flex items-center gap-2">
          <span>💬</span> Offers Received from Verified Transporters ({offers.length})
        </h3>

        {offers.length > 0 ? (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-neutral-200 hover:border-transport-400 transition-all"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-neutral-900">
                      {offer.transporter?.businessName || offer.transporter?.user?.name || 'Verified Transporter'}
                    </h4>
                    <span className="badge badge-success text-[10px]">Verified</span>
                  </div>

                  <p className="text-neutral-600">
                    Vehicle: <strong className="capitalize">{offer.vehicle?.type?.replace(/_/g, ' ')}</strong> (
                    {offer.vehicle?.registrationNumber}) • Capacity: {offer.vehicle?.capacity?.value} {offer.vehicle?.capacity?.unit}
                  </p>

                  {offer.notes && (
                    <p className="text-neutral-500 italic mt-1">"{offer.notes}"</p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Offered Price</span>
                    <span className="text-2xl font-black text-green-700 font-display">
                      ₹{offer.price?.value}
                    </span>
                  </div>

                  {status === 'open' || status === 'offers_received' ? (
                    <button
                      onClick={() => handleAcceptOffer(offer._id)}
                      disabled={actionLoading}
                      className="btn btn-transport btn-sm text-xs font-bold shadow-xs py-1.5 px-4"
                    >
                      {actionLoading ? 'Confirming...' : 'Accept Offer & Book 🚜'}
                    </button>
                  ) : (
                    <span className="badge badge-neutral text-xs">
                      {offer.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-neutral-500 space-y-2 border-dashed border-2 border-neutral-200">
            <span className="text-3xl block">⏳</span>
            <h4 className="font-bold text-sm text-neutral-800">Awaiting Transporter Offers</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Your request is live. Verified transporters operating in your district will review and submit price offers shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
