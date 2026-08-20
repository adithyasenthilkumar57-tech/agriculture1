'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';

function NewCropForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultFarmId = searchParams.get('farmId');
  const { farms, activeFarm, refetchCrops } = useFarm();

  const [formData, setFormData] = useState({
    farm: defaultFarmId || activeFarm?._id || (farms[0]?._id || ''),
    name: '',
    localName: '',
    variety: '',
    category: 'vegetable',
    stage: 'planting',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    cultivationMethod: 'conventional',
    fieldAreaValue: '',
    fieldAreaUnit: 'acres',
    estimatedYieldValue: '',
    estimatedYieldUnit: 'kg',
    season: 'kharif',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.farm) {
      setError('Please select or create a farm first.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm: formData.farm,
          name: formData.name,
          localName: formData.localName,
          variety: formData.variety,
          category: formData.category,
          stage: formData.stage,
          plantingDate: formData.plantingDate,
          expectedHarvestDate: formData.expectedHarvestDate || undefined,
          cultivationMethod: formData.cultivationMethod,
          fieldArea: formData.fieldAreaValue
            ? { value: Number(formData.fieldAreaValue), unit: formData.fieldAreaUnit }
            : undefined,
          estimatedYield: formData.estimatedYieldValue
            ? { value: Number(formData.estimatedYieldValue), unit: formData.estimatedYieldUnit }
            : undefined,
          season: formData.season,
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add crop');
      }

      await refetchCrops();
      router.push('/crops');
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
          <h1 className="text-2xl font-bold font-display text-neutral-900">Add Crop to Farm</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Record planting date, variety, and initial growth stage for timeline tracking
          </p>
        </div>
        <Link href="/crops" className="btn btn-ghost btn-sm text-xs">
          ← Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {farms.length === 0 ? (
        <div className="card p-6 text-center space-y-3">
          <p className="text-sm text-neutral-600 font-medium">
            You must register a farm profile before adding crops.
          </p>
          <Link href="/farms/new" className="btn btn-primary btn-sm">
            Register Farm Profile 🏡
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label label-required text-xs">Select Farm</label>
              <select
                name="farm"
                required
                value={formData.farm}
                onChange={handleChange}
                className="input select text-sm"
              >
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.location?.district || 'Farm'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label label-required text-xs">Crop Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Tomato, Wheat, Cotton"
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label text-xs">Crop Variety</label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. Hybrid S-22"
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
                <option value="pulse">Pulse / Legume</option>
                <option value="oilseed">Oilseed</option>
                <option value="fiber">Fiber / Cotton</option>
                <option value="spice">Spice</option>
                <option value="flower">Flower</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="label text-xs">Season</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="input select text-sm"
              >
                <option value="kharif">Kharif (Monsoon)</option>
                <option value="rabi">Rabi (Winter)</option>
                <option value="zaid">Zaid (Summer)</option>
                <option value="perennial">Perennial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label label-required text-xs">Current Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="input select text-sm"
              >
                <option value="planning">1. Planning</option>
                <option value="planting">2. Planting</option>
                <option value="growth">3. Vegetative Growth</option>
                <option value="flowering">4. Flowering</option>
                <option value="fruiting">5. Fruiting</option>
                <option value="harvest">6. Ready for Harvest</option>
              </select>
            </div>

            <div>
              <label className="label label-required text-xs">Planting Date</label>
              <input
                type="date"
                name="plantingDate"
                required
                value={formData.plantingDate}
                onChange={handleChange}
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label text-xs">Expected Harvest</label>
              <input
                type="date"
                name="expectedHarvestDate"
                value={formData.expectedHarvestDate}
                onChange={handleChange}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Cultivation Method</label>
              <select
                name="cultivationMethod"
                value={formData.cultivationMethod}
                onChange={handleChange}
                className="input select text-sm"
              >
                <option value="conventional">Conventional</option>
                <option value="organic">Certified Organic</option>
                <option value="natural_farming">Natural Farming (ZBNF)</option>
                <option value="integrated">Integrated Pest Management (IPM)</option>
              </select>
            </div>

            <div>
              <label className="label text-xs">Estimated Yield (kg/tonnes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="estimatedYieldValue"
                  value={formData.estimatedYieldValue}
                  onChange={handleChange}
                  placeholder="e.g. 2000"
                  className="input text-sm flex-1"
                />
                <select
                  name="estimatedYieldUnit"
                  value={formData.estimatedYieldUnit}
                  onChange={handleChange}
                  className="input select text-sm w-28"
                >
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                  <option value="quintals">quintals</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="label text-xs">Notes / Special Instructions</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Seed treatment, fertilizer schedule, target market..."
              className="input textarea text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link href="/crops" className="btn btn-ghost btn-sm text-xs">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm text-xs font-bold"
            >
              {loading ? 'Saving Crop...' : 'Save Crop Record 🌱'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function NewCropPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading form...</div>}>
      <NewCropForm />
    </Suspense>
  );
}
