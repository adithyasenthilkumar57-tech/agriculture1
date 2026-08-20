'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/shared/EmptyState';

export default function AdminPage() {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
      } else {
        setError(data.error || 'Access denied. Admin rights required.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleVerify = async (action, targetId, status) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetId, status }),
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Failed to update verification status', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 text-center text-neutral-500 max-w-md mx-auto my-8 space-y-3">
        <span className="text-4xl block">🛡️</span>
        <h3 className="font-bold text-base text-neutral-800">Admin Access Required</h3>
        <p className="text-xs text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  const { stats, verificationQueue, systemHealth } = adminData || {};

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">⚙️ Admin Control Panel</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            System overview, transporter verifications, database metrics, and service health monitoring
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-ghost btn-sm text-xs font-semibold">
          Refresh Metrics 🔄
        </button>
      </div>

      {/* System Health Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="card p-3.5 flex items-center justify-between">
          <span className="text-neutral-500 font-medium">MongoDB Connection</span>
          <span className="badge badge-success font-bold text-[10px]">
            {systemHealth?.databaseConnected ? '✓ Connected' : 'Error'}
          </span>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <span className="text-neutral-500 font-medium">AI Service (OpenAI/Compatible)</span>
          <span
            className={`badge font-bold text-[10px] ${
              systemHealth?.aiConfigured ? 'badge-success' : 'badge-warning'
            }`}
          >
            {systemHealth?.aiConfigured ? '✓ Configured' : 'Key Needed in .env'}
          </span>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <span className="text-neutral-500 font-medium">Weather Intelligence</span>
          <span className="badge badge-success font-bold text-[10px]">
            {systemHealth?.weatherService || 'Live'}
          </span>
        </div>
      </div>

      {/* Real Platform Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total Users</span>
          <span className="text-2xl font-black font-display text-neutral-900 mt-1 block">
            {stats?.totalUsers ?? 0}
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">
            {stats?.totalFarmers ?? 0} Farmers • {stats?.totalTransporters ?? 0} Drivers
          </span>
        </div>

        <div className="card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Registered Farms</span>
          <span className="text-2xl font-black font-display text-neutral-900 mt-1 block">
            {stats?.totalFarms ?? 0}
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">
            {stats?.totalCrops ?? 0} Tracked Crops
          </span>
        </div>

        <div className="card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Transport Requests</span>
          <span className="text-2xl font-black font-display text-neutral-900 mt-1 block">
            {stats?.totalTransportRequests ?? 0}
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">
            {stats?.totalTrips ?? 0} Trips Created
          </span>
        </div>

        <div className="card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Marketplace</span>
          <span className="text-2xl font-black font-display text-neutral-900 mt-1 block">
            {stats?.totalListings ?? 0}
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">Active Listings</span>
        </div>
      </div>

      {/* Transporter Verification Queue */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 font-display flex items-center gap-2">
            <span>🛡️</span> Pending Transporter Verification Queue ({verificationQueue?.transporters?.length || 0})
          </h3>
        </div>

        {verificationQueue?.transporters?.length > 0 ? (
          <div className="space-y-3 text-xs">
            {verificationQueue.transporters.map((t) => (
              <div
                key={t._id}
                className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-neutral-900">{t.businessName || 'Transporter'}</h4>
                  <p className="text-neutral-500">
                    Owner: {t.user?.name} (📧 {t.user?.email} • 📞 {t.user?.phone || 'N/A'})
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Registered: {new Date(t.createdAt).toLocaleDateString()} • Specializations: {t.specializations?.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify('verify_transporter', t._id, 'verified')}
                    className="btn btn-primary btn-sm text-xs font-bold py-1 px-3"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleVerify('verify_transporter', t._id, 'rejected')}
                    className="btn btn-danger btn-sm text-xs py-1 px-3"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 py-3 text-center">
            No pending transporter verifications in the queue.
          </p>
        )}
      </div>

      {/* Vehicle Verification Queue */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 font-display flex items-center gap-2">
            <span>🚛</span> Pending Vehicle Verification Queue ({verificationQueue?.vehicles?.length || 0})
          </h3>
        </div>

        {verificationQueue?.vehicles?.length > 0 ? (
          <div className="space-y-3 text-xs">
            {verificationQueue.vehicles.map((v) => (
              <div
                key={v._id}
                className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-neutral-900 uppercase">{v.registrationNumber}</h4>
                  <p className="text-neutral-500">
                    Type: <span className="capitalize">{v.type?.replace(/_/g, ' ')}</span> • Capacity: {v.capacity?.value} {v.capacity?.unit} • {v.isRefrigerated ? '❄️ Cold-Chain' : 'Standard'}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Owner: {v.owner?.name} (📞 {v.owner?.phone || 'N/A'})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify('verify_vehicle', v._id, 'verified')}
                    className="btn btn-primary btn-sm text-xs font-bold py-1 px-3"
                  >
                    ✓ Approve Vehicle
                  </button>
                  <button
                    onClick={() => handleVerify('verify_vehicle', v._id, 'rejected')}
                    className="btn btn-danger btn-sm text-xs py-1 px-3"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 py-3 text-center">
            No pending vehicle verifications in the queue.
          </p>
        )}
      </div>
    </div>
  );
}
