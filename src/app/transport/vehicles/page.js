'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmptyState from '@/components/shared/EmptyState';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    type: 'pickup',
    capacityValue: '1.5',
    capacityUnit: 'tonnes',
    make: 'Tata',
    model: 'Yodha',
    year: '2022',
    isRefrigerated: false,
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: formData.registrationNumber,
          type: formData.type,
          capacity: {
            value: Number(formData.capacityValue),
            unit: formData.capacityUnit,
          },
          make: formData.make,
          model: formData.model,
          year: formData.year ? Number(formData.year) : undefined,
          isRefrigerated: formData.isRefrigerated,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          registrationNumber: '',
          type: 'pickup',
          capacityValue: '1.5',
          capacityUnit: 'tonnes',
          make: 'Tata',
          model: 'Yodha',
          year: '2022',
          isRefrigerated: false,
        });
        fetchVehicles();
      }
    } catch (err) {
      console.error('Failed to save vehicle', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">🚛 Transporter Fleet & Vehicles</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Register and manage your tractors, trolleys, mini trucks, and cold-chain refrigerated vehicles
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary btn-sm text-xs font-bold"
        >
          + Add New Vehicle
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((veh) => (
            <div key={veh._id} className="card p-5 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-transport-700 block">
                    {veh.type.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-bold text-base text-neutral-900 font-display">
                    {veh.registrationNumber}
                  </h3>
                  <p className="text-xs text-neutral-500">{veh.make} {veh.model} ({veh.year || 'Standard'})</p>
                </div>

                <span className={`badge capitalize text-[10px] ${
                  veh.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'
                }`}>
                  {veh.verificationStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Capacity</span>
                  <span className="font-bold text-neutral-800">
                    {veh.capacity?.value} {veh.capacity?.unit}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 block">Cold-Chain</span>
                  <span className="font-bold text-neutral-800">
                    {veh.isRefrigerated ? '❄️ Refrigerated' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🚛"
          title="No Vehicles Registered Yet"
          description="Add your vehicles (tractors, mini trucks, pickups, cold vans) to start receiving and bidding on agricultural transport jobs."
          actionLabel="Add First Vehicle"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900 font-display">Register Vehicle</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="label label-required text-xs">Vehicle Registration Number</label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="e.g. MH 31 AB 1234"
                  className="input uppercase text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label label-required text-xs">Vehicle Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input select text-xs"
                  >
                    <option value="tractor">Tractor</option>
                    <option value="tractor_trolley">Tractor Trolley</option>
                    <option value="pickup">Pickup Truck</option>
                    <option value="mini_truck">Mini Truck (Ace)</option>
                    <option value="lcv">LCV</option>
                    <option value="medium_truck">Medium Truck</option>
                    <option value="large_truck">Large Truck</option>
                    <option value="refrigerated">Refrigerated Van</option>
                  </select>
                </div>

                <div>
                  <label className="label label-required text-xs">Capacity</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.capacityValue}
                      onChange={(e) => setFormData({ ...formData, capacityValue: e.target.value })}
                      placeholder="1.5"
                      className="input text-xs flex-1"
                    />
                    <select
                      value={formData.capacityUnit}
                      onChange={(e) => setFormData({ ...formData, capacityUnit: e.target.value })}
                      className="input select text-xs w-20"
                    >
                      <option value="tonnes">tonnes</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label text-xs">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g. Mahindra"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Bolero Maxi"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2022"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vehRefrig"
                  checked={formData.isRefrigerated}
                  onChange={(e) => setFormData({ ...formData, isRefrigerated: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <label htmlFor="vehRefrig" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                  Vehicle has active refrigerated / temperature control unit
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost btn-sm text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm text-xs font-bold">
                  Save Vehicle 🚛
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
