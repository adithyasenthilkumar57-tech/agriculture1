'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CropTimeline from '@/components/shared/CropTimeline';

export default function FarmDetailPage() {
  const params = useParams();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFarm() {
      try {
        const res = await fetch(`/api/farms/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setFarm(data.data);
        }
      } catch (err) {
        console.error('Failed to load farm', err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchFarm();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-8">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="card p-12 text-center text-neutral-500 max-w-md mx-auto my-8 space-y-3">
        <span className="text-4xl block">🏡</span>
        <h3 className="font-bold text-base text-neutral-800">Farm Not Found</h3>
        <Link href="/farms" className="btn btn-primary btn-sm">
          Return to My Farms
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
            Farm Profile
          </span>
          <h1 className="text-2xl font-bold font-display text-neutral-900">{farm.name}</h1>
        </div>
        <Link href="/farms" className="btn btn-ghost btn-sm text-xs">
          ← Back to Farms
        </Link>
      </div>

      {/* Farm Overview Card */}
      <div className="card p-6 space-y-4 border-l-4 border-l-primary-500">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block font-semibold">Total Area</span>
            <span className="font-bold text-neutral-900">
              {farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : 'Not recorded'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block font-semibold">Soil Type</span>
            <span className="font-bold text-neutral-900 capitalize">
              {farm.soilType?.replace(/_/g, ' ') || 'Loamy'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block font-semibold">Irrigation</span>
            <span className="font-bold text-neutral-900 capitalize">
              {farm.irrigationType?.replace(/_/g, ' ') || 'Rain-fed'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block font-semibold">Water Source</span>
            <span className="font-bold text-neutral-900 capitalize">
              {farm.waterAvailability || 'Standard'}
            </span>
          </div>
        </div>

        <div className="text-xs text-neutral-600 space-y-1">
          <p>📍 <strong>Location / Address:</strong> {farm.location?.address} ({farm.location?.district}, {farm.location?.state})</p>
          {farm.description && <p className="pt-1 text-neutral-500 italic">"{farm.description}"</p>}
        </div>
      </div>

      {/* Crops on this farm */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-900 font-display">
            Active Crops on {farm.name} ({farm.crops?.length || 0})
          </h3>
          <Link href={`/crops/new?farmId=${farm._id}`} className="btn btn-primary btn-sm text-xs">
            + Plant New Crop
          </Link>
        </div>

        {farm.crops?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farm.crops.map((crop) => (
              <div key={crop._id} className="card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      {crop.name} {crop.variety && `(${crop.variety})`}
                    </h4>
                    <p className="text-xs text-neutral-500 capitalize">
                      {crop.cultivationMethod} • Season: {crop.season || 'Standard'}
                    </p>
                  </div>
                  <span className="badge badge-success capitalize text-xs">
                    {crop.stage}
                  </span>
                </div>

                <CropTimeline currentStage={crop.stage} />

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    href={`/transport/book?crop=${encodeURIComponent(crop.name)}&quantity=${crop.estimatedYield?.value || 500}`}
                    className="btn btn-transport btn-sm text-[11px]"
                  >
                    🚜 Book Transport
                  </Link>

                  <Link
                    href={`/ai?prompt=${encodeURIComponent(`Give me management advice for ${crop.name} in stage ${crop.stage}`)}`}
                    className="btn btn-ai btn-sm text-[11px]"
                  >
                    🤖 Ask AI
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-neutral-500 space-y-2 border-dashed border-2 border-neutral-200">
            <span className="text-3xl block">🌱</span>
            <h4 className="font-bold text-sm text-neutral-800">No Crops Planted on this Farm Yet</h4>
            <p className="text-xs text-neutral-500">Add crops to start tracking timeline stages and harvest forecasts.</p>
            <Link href={`/crops/new?farmId=${farm._id}`} className="btn btn-primary btn-sm text-xs">
              + Plant First Crop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
