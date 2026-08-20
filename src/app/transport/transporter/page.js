'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/shared/EmptyState';

export default function TransporterDashboardPage() {
  const { user } = useAuth();
  const [openRequests, setOpenRequests] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [transporterProfile, setTransporterProfile] = useState(null);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bid submission modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [bidSubmitting, setBidSubmitting] = useState(false);

  const fetchTransporterData = async () => {
    setLoading(true);
    try {
      const [reqRes, transRes, vehRes, tripRes] = await Promise.all([
        fetch('/api/transport/requests?filter=open'),
        fetch('/api/transporters?self=true'),
        fetch('/api/vehicles'),
        fetch('/api/transport/trips'),
      ]);

      const [reqData, transData, vehData, tripData] = await Promise.all([
        reqRes.json(),
        transRes.json(),
        vehRes.json(),
        tripRes.json(),
      ]);

      if (reqData.success) setOpenRequests(reqData.data || []);
      if (transData.success) setTransporterProfile(transData.data);
      if (vehData.success) {
        setMyVehicles(vehData.data || []);
        if (vehData.data?.length > 0) setSelectedVehicle(vehData.data[0]._id);
      }
      if (tripData.success) setActiveTrips(tripData.data || []);
    } catch (err) {
      console.error('Failed to load transporter hub data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransporterData();
  }, [user]);

  const handleUpdateTripStatus = async (tripId, nextStatus) => {
    try {
      const res = await fetch(`/api/transport/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchTransporterData();
    } catch (err) {
      console.error('Failed to update trip status', err);
    }
  };

  const handleSendBid = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !bidPrice || !selectedVehicle) return;

    setBidSubmitting(true);
    try {
      const res = await fetch('/api/transport/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: selectedRequest._id,
          vehicle: selectedVehicle,
          price: { value: Number(bidPrice), currency: 'INR' },
          notes: bidNotes,
        }),
      });

      if (res.ok) {
        setSelectedRequest(null);
        setBidPrice('');
        setBidNotes('');
        fetchTransporterData();
      }
    } catch (err) {
      console.error('Failed to send offer', err);
    } finally {
      setBidSubmitting(false);
    }
  };

  const activeJobs = activeTrips.filter((t) => t.status !== 'delivery_completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">🚚 Transporter Operations Hub</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Discover open agricultural transport jobs, submit competitive bids, and update live trip statuses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/transport/vehicles" className="btn btn-primary btn-sm text-xs font-bold">
            + Manage Vehicles ({myVehicles.length})
          </Link>
        </div>
      </div>

      {/* Active Deliveries / Jobs to Update */}
      {activeJobs.length > 0 && (
        <div className="card p-5 border-l-4 border-l-transport-500 space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 font-display flex items-center gap-2">
            <span>🛣️</span> Your Active Transport Deliveries ({activeJobs.length})
          </h3>

          <div className="space-y-3">
            {activeJobs.map((job) => {
              const statusSequence = [
                'booking_confirmed',
                'transporter_assigned',
                'en_route_to_farm',
                'pickup_completed',
                'in_transit',
                'arrived',
                'delivery_completed',
              ];
              const curIdx = statusSequence.indexOf(job.status);
              const nextStatus = curIdx < statusSequence.length - 1 ? statusSequence[curIdx + 1] : null;

              return (
                <div
                  key={job._id}
                  className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-transport capitalize text-[10px]">
                        {job.status.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-neutral-900">
                        {job.booking?.request?.cargo?.name} ({job.booking?.request?.cargo?.quantity?.value}{' '}
                        {job.booking?.request?.cargo?.quantity?.unit})
                      </span>
                    </div>
                    <p className="text-neutral-600">
                      📍 {job.booking?.request?.pickup?.address} → 🏁 {job.booking?.request?.destination?.address}
                    </p>
                    <p className="text-neutral-500 text-[11px]">
                      Farmer: {job.farmer?.name} (📞 {job.farmer?.phone || 'On file'}) • Vehicle: {job.vehicle?.registrationNumber}
                    </p>
                  </div>

                  {nextStatus && (
                    <button
                      onClick={() => handleUpdateTripStatus(job._id, nextStatus)}
                      className="btn btn-transport btn-sm text-xs font-bold whitespace-nowrap self-start sm:self-center"
                    >
                      Update: {nextStatus.replace(/_/g, ' ')} ⏩
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open Farmer Requests Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-900 font-display">
            Open Agricultural Transport Requests ({openRequests.length})
          </h3>
          <span className="text-xs text-neutral-500">Live requests from farmers in need of transport</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        ) : openRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openRequests.map((req) => (
              <div
                key={req._id}
                className="card p-5 space-y-3 border-l-4 border-l-primary-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                        {req.cargo?.category}
                      </span>
                      <h4 className="font-bold text-sm text-neutral-900">
                        {req.cargo?.name} ({req.cargo?.quantity?.value} {req.cargo?.quantity?.unit})
                      </h4>
                    </div>

                    <span className="badge badge-info text-[10px]">Open for Bids</span>
                  </div>

                  <div className="text-xs text-neutral-600 space-y-1 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <p>📍 <strong>Pickup:</strong> {req.pickup?.address}</p>
                    <p>🏁 <strong>Destination:</strong> {req.destination?.name} ({req.destination?.address})</p>
                    <div className="flex justify-between pt-1 border-t border-neutral-200 text-[11px]">
                      <span>Date: {new Date(req.preferredDate).toLocaleDateString()}</span>
                      <span className="font-semibold text-neutral-800">
                        Vehicle Wanted: <span className="capitalize">{req.preferredVehicleType?.replace(/_/g, ' ')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Est: ₹{req.estimatedCost?.value || '—'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setBidPrice(String(req.estimatedCost?.value || '1500'));
                    }}
                    className="btn btn-transport btn-sm text-xs font-bold"
                  >
                    Submit Offer / Bid 🚜
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🚜"
            title="No Open Requests Currently"
            description="There are currently no open transport requests from farmers matching your area. Check back shortly as farmers post harvest and input trips."
            actionLabel="Register Another Vehicle"
            actionHref="/transport/vehicles"
            variant="transport"
          />
        )}
      </div>

      {/* Submit Bid Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900 font-display">
                Submit Offer for {selectedRequest.cargo?.name}
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-neutral-400 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBid} className="space-y-3 text-xs">
              <div>
                <label className="label label-required text-xs">Your Offer Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  placeholder="e.g. 2500"
                  className="input text-sm font-bold"
                />
              </div>

              <div>
                <label className="label label-required text-xs">Select Vehicle to Assign</label>
                {myVehicles.length > 0 ? (
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="input select text-xs"
                  >
                    {myVehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} ({v.type.replace(/_/g, ' ')} • {v.capacity?.value} {v.capacity?.unit})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-red-600 font-medium">
                    No registered vehicles found. Please add a vehicle first.
                  </p>
                )}
              </div>

              <div>
                <label className="label text-xs">Note to Farmer (Optional)</label>
                <textarea
                  rows={2}
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  placeholder="e.g. Can arrive at 7:00 AM sharp, tarpaulin cover included."
                  className="input textarea text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="btn btn-ghost btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bidSubmitting || myVehicles.length === 0}
                  className="btn btn-transport btn-sm text-xs font-bold"
                >
                  {bidSubmitting ? 'Sending Offer...' : 'Send Offer to Farmer 🚜'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
