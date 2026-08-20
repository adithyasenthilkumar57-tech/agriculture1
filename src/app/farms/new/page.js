'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';

export default function NewFarmPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    district: '',
    state: 'Maharashtra',
    sizeValue: '',
    sizeUnit: 'acres',
    soilType: 'loamy',
    irrigationType: 'drip',
    waterAvailability: 'adequate',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refetchFarms } = useFarm();

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: {
            address: formData.address,
            district: formData.district,
            state: formData.state,
          },
          size: {
            value: formData.sizeValue ? Number(formData.sizeValue) : undefined,
            unit: formData.sizeUnit,
          },
          soilType: formData.soilType,
          irrigationType: formData.irrigationType,
          waterAvailability: formData.waterAvailability,
          description: formData.description,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create farm');
      }

      await refetchFarms();
      router.push('/farms');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Register New Farm</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Add your agricultural land details for localized insights and transport pickups
          </p>
        </div>
        <Link href="/farms" className="btn btn-ghost btn-sm text-xs">
          ← Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label label-required text-xs">Farm Name / Identifier</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Green Valley Farm, North Field"
            className="input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="label label-required text-xs">Full Address / Village</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Village Borgaon, Near Canal Road"
              className="input text-sm"
            />
          </div>

          <div>
            <label className="label text-xs">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="e.g. Nagpur"
              className="input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label text-xs">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Maharashtra"
              className="input text-sm"
            />
          </div>

          <div>
            <label className="label text-xs">Farm Size</label>
            <input
              type="number"
              name="sizeValue"
              step="0.1"
              value={formData.sizeValue}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="input text-sm"
            />
          </div>

          <div>
            <label className="label text-xs">Unit</label>
            <select
              name="sizeUnit"
              value={formData.sizeUnit}
              onChange={handleChange}
              className="input select text-sm"
            >
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
              <option value="bigha">Bigha</option>
              <option value="guntha">Guntha</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label text-xs">Primary Soil Type</label>
            <select
              name="soilType"
              value={formData.soilType}
              onChange={handleChange}
              className="input select text-sm"
            >
              <option value="loamy">Loamy Soil</option>
              <option value="clay">Clay Soil</option>
              <option value="sandy">Sandy Soil</option>
              <option value="silt">Silt Soil</option>
              <option value="clay_loam">Clay Loam</option>
              <option value="sandy_loam">Sandy Loam</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label text-xs">Irrigation Method</label>
            <select
              name="irrigationType"
              value={formData.irrigationType}
              onChange={handleChange}
              className="input select text-sm"
            >
              <option value="drip">Drip Irrigation</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="flood">Flood / Furrow</option>
              <option value="borewell">Borewell</option>
              <option value="canal">Canal</option>
              <option value="rain_fed">Rain-fed</option>
            </select>
          </div>

          <div>
            <label className="label text-xs">Water Availability</label>
            <select
              name="waterAvailability"
              value={formData.waterAvailability}
              onChange={handleChange}
              className="input select text-sm"
            >
              <option value="abundant">Abundant</option>
              <option value="adequate">Adequate</option>
              <option value="limited">Limited</option>
              <option value="seasonal">Seasonal</option>
              <option value="scarce">Scarce</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label text-xs">Additional Farm Notes</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Special soil treatments, accessibility notes for transport trucks, storage sheds on site..."
            className="input textarea text-sm"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Link href="/farms" className="btn btn-ghost btn-sm text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-sm text-xs font-bold"
          >
            {loading ? 'Registering Farm...' : 'Save Farm Profile 🌾'}
          </button>
        </div>
      </form>
    </div>
  );
}
