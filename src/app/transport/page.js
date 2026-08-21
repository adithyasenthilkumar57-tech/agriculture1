'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/shared/EmptyState';
import TripTimeline from '@/components/shared/TripTimeline';

export default function TransportPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'active_trips' | 'history'
  const [loading, setLoading] = useState(true);
  const [selectedOfferModal, setSelectedOfferModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, tripRes] = await Promise.all([
        fetch('/api/transport/requests?filter=my'),
        fetch('/api/transport/trips'),
      ]);
      const [reqData, tripData] = await Promise.all([reqRes.json(), tripRes.json()]);

      if (reqData.success) setRequests(reqData.data || []);
      if (tripData.success) setTrips(tripData.data || []);
    } catch (err) {
      console.error('Failed to load transport data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await fetch(`/api/transport/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (res.ok) {
        setSelectedOfferModal(null);
        fetchData();
        setActiveTab('active_trips');
      }
    } catch (err) {
      console.error('Failed to accept offer', err);
    }
  };

  const activeTrips = trips.filter((t) => t.status !== 'delivery_completed');
  const completedTrips = trips.filter((t) => t.status === 'delivery_completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Agricultural Logistics & Transport</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Dedicated farm-to-market, farm-to-storage, and input transportation network
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'transporter' && (
            <Link href="/transport/transporter" className="btn btn-ghost btn-sm text-xs">
              Transporter Hub
            </Link>
          )}
          <Link href="/transport/book" className="btn btn-transport btn-sm text-xs font-bold">
            + Book Agricultural Transport
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 text-xs border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-transport-500 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          My Transport Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('active_trips')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'active_trips'
              ? 'bg-transport-500 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Active Trips ({activeTrips.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-transport-500 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Completed History ({completedTrips.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      ) : activeTab === 'requests' ? (
        requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req._id} className="card p-5 space-y-4 border-l-4 border-l-transport-500 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-transport-700 block">
                      {req.cargo?.category?.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-bold text-base text-neutral-900 font-display">
                      {req.cargo?.name} ({req.cargo?.quantity?.value} {req.cargo?.quantity?.unit})
                    </h3>
                  </div>

                  <span className={`badge capitalize text-xs ${
                    req.status === 'open' ? 'badge-info' : req.status === 'offers_received' ? 'badge-warning' : 'badge-success'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Pickup:</span>
                    <span className="font-medium text-neutral-800">{req.pickup?.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Destination:</span>
                    <span className="font-medium text-neutral-800">{req.destination?.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[11px]">
                    <span>Date: {new Date(req.preferredDate).toLocaleDateString()}</span>
                    <span className="font-bold text-neutral-800">
                      Est. Cost: ₹{req.estimatedCost?.value || '—'}
                    </span>
                  </div>
                </div>

                {/* Transporter Offers Section */}
                <div className="pt-2">
                  <Link
                    href={`/transport/requests/${req._id}`}
                    className="btn btn-transport w-full text-xs font-bold"
                  >
                    View Transporter Offers & Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🚜"
            title="No Active Transport Requests"
            description="Create an agricultural transport request for your harvested crops, fertilizers, seeds, or farm machinery."
            actionLabel="Book Agricultural Transport"
            actionHref="/transport/book"
            variant="transport"
          />
        )
      ) : activeTab === 'active_trips' ? (
        activeTrips.length > 0 ? (
          <div className="space-y-6">
            {activeTrips.map((trip) => (
              <div key={trip._id} className="card p-6 space-y-4 border-l-4 border-l-transport-500 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-transport-700">
                      Active Trip #{trip._id.slice(-6)}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 font-display">
                      Cargo: {trip.booking?.request?.cargo?.name} ({trip.booking?.request?.cargo?.quantity?.value}{' '}
                      {trip.booking?.request?.cargo?.quantity?.unit})
                    </h3>
                  </div>

                  <span className="badge badge-transport capitalize text-xs">
                    {trip.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Trip Lifecycle Progress Bar */}
                <TripTimeline currentStatus={trip.status} />

                {/* Transporter & Vehicle Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Transporter</span>
                    <span className="font-bold text-neutral-900">
                      {trip.transporter?.businessName || trip.transporter?.user?.name || 'Verified Transporter'}
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      Contact: {trip.transporter?.user?.phone || 'Contact via platform'}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px]">Vehicle</span>
                    <span className="font-bold text-neutral-900 capitalize">
                      {trip.vehicle?.type?.replace(/_/g, ' ')} ({trip.vehicle?.registrationNumber})
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      Capacity: {trip.vehicle?.capacity?.value} {trip.vehicle?.capacity?.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px]">Agreed Price</span>
                    <span className="text-base font-black text-green-700">
                      ₹{trip.booking?.agreedPrice?.value || '—'}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      GPS: {trip.gpsTracking?.isEnabled ? 'Live Tracking Active' : 'Live GPS unavailable. Status updated manually.'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🚚"
            title="No Active Trips"
            description="You have no ongoing trips right now. Once a transporter's offer is accepted, your active trip tracking will appear here."
            actionLabel="Create Transport Request"
            actionHref="/transport/book"
            variant="transport"
          />
        )
      ) : (
        completedTrips.length > 0 ? (
          <div className="space-y-4">
            {completedTrips.map((trip) => (
              <div key={trip._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-success text-[10px]">Delivered</span>
                    <span className="font-bold text-sm text-neutral-900">
                      {trip.booking?.request?.cargo?.name} ({trip.booking?.request?.cargo?.quantity?.value}{' '}
                      {trip.booking?.request?.cargo?.quantity?.unit})
                    </span>
                  </div>
                  <p className="text-neutral-500">
                    {trip.booking?.request?.pickup?.address} &rarr; {trip.booking?.request?.destination?.address}
                  </p>
                  <p className="text-neutral-400 text-[11px]">
                    Completed on: {new Date(trip.actualDeliveryTime || trip.updatedAt).toLocaleDateString()} • Price: ₹{trip.booking?.agreedPrice?.value}
                  </p>
                </div>

                <Link
                  href={`/transport/book?cargoName=${encodeURIComponent(trip.booking?.request?.cargo?.name || '')}`}
                  className="btn btn-outline btn-sm text-xs font-bold self-start sm:self-center"
                >
                  Book Similar Transport
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📦"
            title="No Transportation Trips Yet"
            description="Your completed agricultural deliveries and history will appear here once trips finish."
            actionLabel="Book Transport"
            actionHref="/transport/book"
            variant="transport"
          />
        )
      )}
    </div>
  );
}
