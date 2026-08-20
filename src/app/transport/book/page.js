'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';

function BookTransportWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCrop = searchParams.get('crop') || '';
  const initialQty = searchParams.get('quantity') || '';
  const { farms, activeFarm } = useFarm();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Category & Name
    category: 'vegetables',
    cargoName: initialCrop || '',
    requiresRefrigeration: false,
    handlingNotes: '',
    // Step 2: Quantity
    quantityValue: initialQty || '500',
    quantityUnit: 'kg',
    // Step 3: Pickup
    pickupType: 'farm',
    pickupAddress: activeFarm?.location?.address || '',
    pickupDistrict: activeFarm?.location?.district || '',
    pickupState: activeFarm?.location?.state || 'Maharashtra',
    contactPhone: '',
    // Step 4: Destination
    destType: 'market',
    destName: 'City APMC Mandi',
    destAddress: '',
    destDistrict: '',
    destState: 'Maharashtra',
    // Step 5: Vehicle requirement
    preferredVehicleType: 'pickup',
    // Step 6: Date & Time
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: 'Morning (06:00 - 10:00 AM)',
    estimatedDistance: '35',
    isSharedTransport: false,
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((p) => ({ ...p, [e.target.name]: value }));
  };

  // Cost calculation formula
  const dist = Number(formData.estimatedDistance || 25);
  const qtyInKg = formData.quantityUnit === 'tonnes' ? Number(formData.quantityValue) * 1000 : Number(formData.quantityValue || 500);
  const baseRate = 500;
  const perKmRate = 18;
  const refrigFactor = formData.requiresRefrigeration ? 1.4 : 1.0;
  const estimatedCost = Math.round((baseRate + (dist * perKmRate) + (qtyInKg * 0.2)) * refrigFactor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/transport/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cargo: {
            category: formData.category,
            name: formData.cargoName || 'Agricultural Produce',
            quantity: {
              value: Number(formData.quantityValue),
              unit: formData.quantityUnit,
            },
            requiresRefrigeration: formData.requiresRefrigeration,
            handlingNotes: formData.handlingNotes,
          },
          pickup: {
            address: formData.pickupAddress || 'Farm Location',
            district: formData.pickupDistrict,
            state: formData.pickupState,
            contactPhone: formData.contactPhone,
          },
          destination: {
            type: formData.destType,
            name: formData.destName,
            address: formData.destAddress || `${formData.destName}, ${formData.destDistrict || 'Market'}`,
            district: formData.destDistrict,
            state: formData.destState,
          },
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          preferredVehicleType: formData.preferredVehicleType,
          estimatedDistance: { value: dist, unit: 'km' },
          isSharedTransport: formData.isSharedTransport,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit transport request');
      }

      router.push('/transport');
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
          <h1 className="text-2xl font-bold font-display text-neutral-900">🚜 Book Agricultural Transport</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Step {step} of 7 — Moving produce from farm to market & storage
          </p>
        </div>
        <Link href="/transport" className="btn btn-ghost btn-sm text-xs">
          ← Back to Transport
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between gap-1 px-1">
        {[
          '1. Cargo',
          '2. Quantity',
          '3. Pickup',
          '4. Destination',
          '5. Vehicle',
          '6. Schedule',
          '7. Confirm',
        ].map((lbl, idx) => (
          <div key={idx} className="flex-1 text-center">
            <div
              className={`h-1.5 rounded-full transition-all ${
                idx + 1 <= step ? 'bg-transport-500' : 'bg-neutral-200'
              }`}
            />
            <span
              className={`hidden sm:block text-[9px] mt-1 truncate ${
                idx + 1 === step ? 'font-bold text-transport-700' : 'text-neutral-400'
              }`}
            >
              {lbl}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="card p-6 space-y-5">
        {/* Step 1: Cargo Category & Name */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-neutral-900 font-display">
              Step 1: What are you transporting?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'vegetables', label: 'Vegetables', icon: '🥦' },
                { id: 'fruits', label: 'Fruits', icon: '🍎' },
                { id: 'grains', label: 'Grains / Cereals', icon: '🌾' },
                { id: 'crops', label: 'Standing Crops', icon: '🌱' },
                { id: 'seeds', label: 'Seeds / Inputs', icon: '🌰' },
                { id: 'fertilizers', label: 'Fertilizers', icon: '🧪' },
                { id: 'equipment', label: 'Farm Machinery', icon: '🚜' },
                { id: 'milk', label: 'Milk / Dairy', icon: '🥛' },
                { id: 'flowers', label: 'Flowers', icon: '🌸' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    formData.category === cat.id
                      ? 'border-transport-500 bg-transport-50 text-transport-900 ring-2 ring-transport-500/20 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="label label-required text-xs">Produce / Item Name</label>
              <input
                type="text"
                name="cargoName"
                required
                value={formData.cargoName}
                onChange={handleChange}
                placeholder="e.g. Tomatoes (Hybrid), Wheat bags, Harvester blade"
                className="input text-sm"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center gap-2">
              <input
                type="checkbox"
                id="refrig"
                name="requiresRefrigeration"
                checked={formData.requiresRefrigeration}
                onChange={handleChange}
                className="w-4 h-4 rounded text-transport-600"
              />
              <label htmlFor="refrig" className="text-amber-900 font-semibold cursor-pointer">
                Requires Cold-Chain / Refrigerated Temperature Control
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Quantity */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-neutral-900 font-display">
              Step 2: Enter Quantity & Load Volume
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label label-required text-xs">Quantity Value</label>
                <input
                  type="number"
                  name="quantityValue"
                  required
                  min="1"
                  value={formData.quantityValue}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="input text-sm font-bold"
                />
              </div>

              <div>
                <label className="label label-required text-xs">Unit of Measurement</label>
                <select
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  className="input select text-sm"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="bags">Bags (50kg standard)</option>
                  <option value="crates">Crates (20kg standard)</option>
                  <option value="litres">Litres (Liquid/Milk)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label text-xs">Handling & Loading Notes</label>
              <textarea
                name="handlingNotes"
                rows={2}
                value={formData.handlingNotes}
                onChange={handleChange}
                placeholder="e.g. Needs gentle stacking, crates provided by farmer, fragile produce..."
                className="input textarea text-xs"
              />
            </div>
          </div>
        )}

        {/* Step 3: Pickup Location */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-neutral-900 font-display">
              Step 3: Pickup Location (Farm / Supplier)
            </h3>

            {farms.length > 0 && (
              <div>
                <label className="label text-xs">Select From Your Registered Farms</label>
                <select
                  onChange={(e) => {
                    const f = farms.find((farm) => farm._id === e.target.value);
                    if (f) {
                      setFormData((p) => ({
                        ...p,
                        pickupAddress: f.location?.address || '',
                        pickupDistrict: f.location?.district || '',
                        pickupState: f.location?.state || 'Maharashtra',
                      }));
                    }
                  }}
                  className="input select text-xs mb-2"
                >
                  <option value="">-- Choose Farm --</option>
                  {farms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.location?.address})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label label-required text-xs">Full Pickup Address / Village Landmark</label>
              <input
                type="text"
                name="pickupAddress"
                required
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="e.g. Survey No. 42, Village Pipri, Near Canal Gate"
                className="input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">District</label>
                <input
                  type="text"
                  name="pickupDistrict"
                  value={formData.pickupDistrict}
                  onChange={handleChange}
                  placeholder="e.g. Nagpur"
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Destination */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-neutral-900 font-display">
              Step 4: Destination Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'market', label: 'APMC / Mandi', icon: '🏛️' },
                { id: 'buyer', label: 'Direct Buyer', icon: '🏪' },
                { id: 'warehouse', label: 'Warehouse', icon: '🏬' },
                { id: 'cold_storage', label: 'Cold Storage', icon: '❄️' },
                { id: 'processing', label: 'Processing Plant', icon: '🏭' },
                { id: 'collection_center', label: 'Collection Center', icon: '📦' },
                { id: 'farm', label: 'Another Farm', icon: '🏡' },
                { id: 'other', label: 'Other Location', icon: '📍' },
              ].map((dest) => (
                <button
                  type="button"
                  key={dest.id}
                  onClick={() => setFormData({ ...formData, destType: dest.id })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    formData.destType === dest.id
                      ? 'border-transport-500 bg-transport-50 text-transport-900 ring-2 ring-transport-500/20 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xl">{dest.icon}</span>
                  <span className="text-[11px] text-center">{dest.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="label label-required text-xs">Destination Facility / Market Name</label>
              <input
                type="text"
                name="destName"
                required
                value={formData.destName}
                onChange={handleChange}
                placeholder="e.g. APMC Wholesale Grain Market, Reliance Fresh Hub"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label label-required text-xs">Destination Address</label>
              <input
                type="text"
                name="destAddress"
                required
                value={formData.destAddress}
                onChange={handleChange}
                placeholder="e.g. Gate No. 3, APMC Yard, Kalmeshwar Road"
                className="input text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 5: Vehicle Preference */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-neutral-900 font-display">
              Step 5: Select / Recommend Vehicle
            </h3>
            <p className="text-xs text-neutral-500">
              Recommended vehicle based on your load volume ({formData.quantityValue} {formData.quantityUnit}):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'tractor_trolley', title: 'Tractor Trolley', cap: 'Up to 3-5 tonnes', icon: '🚜', desc: 'Best for local farm-to-mandi trips on rural roads' },
                { id: 'pickup', title: 'Pickup Truck (Bolero / Tata Yodha)', cap: 'Up to 1.5 tonnes', icon: '🛻', desc: 'Fast, flexible for vegetables and fruit crates' },
                { id: 'mini_truck', title: 'Mini Truck (Tata Ace)', cap: 'Up to 1 tonne', icon: '🚚', desc: 'Economical for small to medium batches' },
                { id: 'lcv', title: 'Light Commercial Vehicle (LCV)', cap: '3 to 6 tonnes', icon: '🚛', desc: 'Inter-district grain and vegetable transport' },
                { id: 'medium_truck', title: 'Medium / Large Truck', cap: '10+ tonnes', icon: '🚚', desc: 'Bulk grain, sugarcane, and wholesale loads' },
                { id: 'refrigerated', title: 'Refrigerated Cold Van', cap: 'Temperature Controlled', icon: '❄️', desc: 'Perishable fruits, vegetables, flowers, milk' },
              ].map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setFormData({ ...formData, preferredVehicleType: v.id })}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    formData.preferredVehicleType === v.id
                      ? 'border-transport-500 bg-transport-50 text-transport-900 ring-2 ring-transport-500/20 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-2xl">{v.icon}</span>
                  <div>
                    <div className="font-bold text-xs">{v.title}</div>
                    <div className="text-[10px] text-transport-700">{v.cap}</div>
                    <div className="text-[10px] text-neutral-500 font-normal mt-0.5">{v.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Schedule & Shared Transport */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-neutral-900 font-display">
              Step 6: Date, Time & Transport Sharing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label label-required text-xs">Preferred Transport Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  required
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs">Preferred Time Window</label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="input select text-sm"
                >
                  <option value="Early Morning (04:00 - 07:00 AM)">Early Morning (04:00 - 07:00 AM)</option>
                  <option value="Morning (07:00 - 11:00 AM)">Morning (07:00 - 11:00 AM)</option>
                  <option value="Afternoon (12:00 - 04:00 PM)">Afternoon (12:00 - 04:00 PM)</option>
                  <option value="Evening (05:00 - 09:00 PM)">Evening (05:00 - 09:00 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label text-xs">Approximate Distance (km)</label>
              <input
                type="number"
                name="estimatedDistance"
                value={formData.estimatedDistance}
                onChange={handleChange}
                placeholder="e.g. 35"
                className="input text-sm"
              />
            </div>

            <div className="p-3.5 bg-transport-50/60 rounded-xl border border-transport-200 space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sharedTransport"
                  name="isSharedTransport"
                  checked={formData.isSharedTransport}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-transport-600"
                />
                <label htmlFor="sharedTransport" className="text-xs font-bold text-transport-900 cursor-pointer">
                  Enable "Share a Transport" with nearby farmers
                </label>
              </div>
              <p className="text-[11px] text-transport-800 pl-6">
                Allows combining compatible loads along the same route to reduce per-farmer transportation costs.
              </p>
            </div>
          </div>
        )}

        {/* Step 7: Confirmation & Estimation */}
        {step === 7 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-neutral-900 font-display">
              Step 7: Review & Confirm Transport Request
            </h3>

            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs">
              <div className="flex justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Cargo:</span>
                <span className="font-bold text-neutral-900">
                  {formData.cargoName} ({formData.quantityValue} {formData.quantityUnit})
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Pickup:</span>
                <span className="font-bold text-neutral-900 text-right max-w-xs">{formData.pickupAddress}</span>
              </div>

              <div className="flex justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Destination:</span>
                <span className="font-bold text-neutral-900 text-right max-w-xs">
                  {formData.destName} ({formData.destAddress})
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Vehicle Type:</span>
                <span className="font-bold text-neutral-900 capitalize">
                  {formData.preferredVehicleType.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Scheduled Date:</span>
                <span className="font-bold text-neutral-900">
                  {new Date(formData.preferredDate).toLocaleDateString()} • {formData.preferredTime}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="font-bold text-neutral-700">Estimated Cost:</span>
                <span className="text-xl font-black text-green-700">₹{estimatedCost}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
              ℹ️ Estimated cost is for reference. Transporters will review your request and submit actual competitive offers. You can choose and accept the best offer.
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn btn-ghost btn-sm text-xs"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn btn-transport btn-sm text-xs font-bold"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-transport btn-sm text-xs font-bold shadow-md"
            >
              {loading ? 'Submitting Request...' : 'Confirm & Post Request 🚜'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookTransportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading booking wizard...</div>}>
      <BookTransportWizard />
    </Suspense>
  );
}
