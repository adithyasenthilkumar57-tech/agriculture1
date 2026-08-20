'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';

export default function NewMarketplaceListingPage() {
  const router = useRouter();
  const { farms, activeFarm, crops } = useFarm();

  const [formData, setFormData] = useState({
    farm: activeFarm?._id || '',
    crop: '',
    title: '',
    cropName: '',
    variety: '',
    category: 'vegetable',
    quantityAvailable: '1000',
    quantityUnit: 'kg',
    grade: 'A',
    priceValue: '25',
    priceUnit: 'per_kg',
    negotiable: true,
    harvestDate: new Date().toISOString().split('T')[0],
    district: activeFarm?.location?.district || 'Nagpur',
    state: activeFarm?.location?.state || 'Maharashtra',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((p) => ({ ...p, [e.target.name]: value }));
  };

  const handleCropSelect = (cropId) => {
    const selected = crops.find((c) => c._id === cropId);
    if (selected) {
      setFormData((p) => ({
        ...p,
        crop: selected._id,
        cropName: selected.name,
        variety: selected.variety || '',
        category: selected.category || 'vegetable',
        title: `Fresh Harvested ${selected.name} (${selected.variety || 'Standard'})`,
        quantityAvailable: selected.estimatedYield?.value ? String(selected.estimatedYield.value) : p.quantityAvailable,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm: formData.farm || undefined,
          crop: formData.crop || undefined,
          title: formData.title,
          cropName: formData.cropName,
          variety: formData.variety,
          category: formData.category,
          quantity: {
            available: Number(formData.quantityAvailable),
            unit: formData.quantityUnit,
          },
          grade: formData.grade,
          price: {
            value: Number(formData.priceValue),
            unit: formData.priceUnit,
            negotiable: formData.negotiable,
          },
          harvestDate: formData.harvestDate ? new Date(formData.harvestDate) : null,
          location: {
            district: formData.district,
            state: formData.state,
          },
          description: formData.description,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to list product');
      }

      router.push('/marketplace');
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
          <h1 className="text-2xl font-bold font-display text-neutral-900">List Produce on Marketplace</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Connect your standing or harvested crops directly with wholesale buyers and mandis
          </p>
        </div>
        <Link href="/marketplace" className="btn btn-ghost btn-sm text-xs">
          ← Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {/* Quick Autofill from user's crops */}
        {crops.length > 0 && (
          <div className="p-3 bg-primary-50/60 rounded-xl border border-primary-200 text-xs">
            <label className="font-bold text-primary-900 block mb-1">
              🌾 Quick Autofill from Your Current Crops:
            </label>
            <select
              onChange={(e) => handleCropSelect(e.target.value)}
              className="input select text-xs bg-white"
            >
              <option value="">-- Choose one of your crops --</option>
              {crops.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.variety || 'Variety'}, {c.stage} stage)
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label label-required text-xs">Listing Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Fresh Red Tomatoes Grade-A Bulk 2 Tonnes"
            className="input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label label-required text-xs">Crop / Produce Name</label>
            <input
              type="text"
              name="cropName"
              required
              value={formData.cropName}
              onChange={handleChange}
              placeholder="e.g. Tomato"
              className="input text-sm"
            />
          </div>

          <div>
            <label className="label text-xs">Variety</label>
            <input
              type="text"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              placeholder="e.g. Vaishali"
              className="input text-sm"
            />
          </div>

          <div>
            <label className="label text-xs">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input select text-sm"
            >
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="grain">Grain / Cereal</option>
              <option value="pulse">Pulse</option>
              <option value="oilseed">Oilseed</option>
              <option value="spice">Spice</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label label-required text-xs">Available Quantity</label>
            <input
              type="number"
              name="quantityAvailable"
              required
              value={formData.quantityAvailable}
              onChange={handleChange}
              placeholder="1000"
              className="input text-sm font-bold"
            />
          </div>

          <div>
            <label className="label text-xs">Unit</label>
            <select
              name="quantityUnit"
              value={formData.quantityUnit}
              onChange={handleChange}
              className="input select text-sm"
            >
              <option value="kg">kg</option>
              <option value="tonnes">tonnes</option>
              <option value="quintals">quintals</option>
              <option value="bags">bags</option>
              <option value="crates">crates</option>
            </select>
          </div>

          <div>
            <label className="label text-xs">Quality Grade</label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="input select text-sm"
            >
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="organic">Organic Certified</option>
              <option value="standard">Standard Mixed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label label-required text-xs">Price (₹ INR)</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="priceValue"
                required
                value={formData.priceValue}
                onChange={handleChange}
                placeholder="25"
                className="input text-sm font-bold flex-1"
              />
              <select
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleChange}
                className="input select text-sm w-32"
              >
                <option value="per_kg">per kg</option>
                <option value="per_tonne">per tonne</option>
                <option value="per_quintal">per quintal</option>
                <option value="per_bag">per bag</option>
                <option value="per_crate">per crate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label label-required text-xs">District</label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Nagpur"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label label-required text-xs">State</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
                className="input text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label text-xs">Product Details & Harvest Quality</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Freshly harvested, pesticide-free, sorted in plastic crates, ready for immediate loading..."
            className="input textarea text-sm"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Link href="/marketplace" className="btn btn-ghost btn-sm text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-sm text-xs font-bold"
          >
            {loading ? 'Publishing...' : 'Publish Produce Listing 🏪'}
          </button>
        </div>
      </form>
    </div>
  );
}
