'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import EmptyState from '@/components/shared/EmptyState';
import CropTimeline from '@/components/shared/CropTimeline';

export default function CropsPage() {
  const { crops, activeFarm, refetchCrops } = useFarm();
  const [selectedStage, setSelectedStage] = useState('all');

  const filteredCrops = selectedStage === 'all'
    ? crops
    : crops.filter((c) => c.stage === selectedStage);

  const handleAdvanceStage = async (cropId, currentStage) => {
    const stageOrder = ['planning', 'planting', 'growth', 'flowering', 'fruiting', 'harvest', 'post_harvest'];
    const currentIdx = stageOrder.indexOf(currentStage);
    if (currentIdx === -1 || currentIdx >= stageOrder.length - 1) return;

    const nextStage = stageOrder[currentIdx + 1];

    try {
      const res = await fetch(`/api/crops/${cropId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage }),
      });
      if (res.ok) {
        refetchCrops();
      }
    } catch (err) {
      console.error('Failed to advance crop stage', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">🌱 Crops & Lifecycle Timeline</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track real crop growth stages from planning to harvest and directly coordinate harvest logistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/crops/new" className="btn btn-primary btn-sm text-xs">
            + Add New Crop
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'planning', 'planting', 'growth', 'flowering', 'fruiting', 'harvest'].map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
              selectedStage === stage
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {stage === 'all' ? 'All Crops' : stage}
          </button>
        ))}
      </div>

      {/* Crops List */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCrops.map((crop) => (
            <div key={crop._id} className="card p-5 space-y-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 font-display">
                    {crop.name} {crop.variety && <span className="text-xs text-neutral-500 font-normal">({crop.variety})</span>}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Farm: <span className="font-medium text-neutral-700">{crop.farm?.name || 'Assigned Farm'}</span>
                    {crop.season && ` • Season: ${crop.season}`}
                  </p>
                </div>

                <span className="badge badge-success capitalize text-xs">
                  {crop.stage}
                </span>
              </div>

              {/* Visual Timeline */}
              <CropTimeline currentStage={crop.stage} />

              <div className="grid grid-cols-3 gap-2 text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Planting Date</span>
                  <span className="font-semibold text-neutral-800">
                    {crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 block">Cultivation</span>
                  <span className="font-semibold text-neutral-800 capitalize">
                    {crop.cultivationMethod || 'Standard'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 block">Expected Yield</span>
                  <span className="font-semibold text-neutral-800">
                    {crop.estimatedYield?.value ? `${crop.estimatedYield.value} ${crop.estimatedYield.unit}` : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => handleAdvanceStage(crop._id, crop.stage)}
                  disabled={crop.stage === 'harvest' || crop.stage === 'post_harvest'}
                  className="btn btn-ghost btn-sm text-[11px] py-1 px-2.5"
                >
                  Advance Stage ⏩
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/transport/book?crop=${encodeURIComponent(crop.name)}&quantity=${crop.estimatedYield?.value || 100}`}
                    className="btn btn-transport btn-sm text-[11px] py-1 px-2.5"
                  >
                    🚜 Book Transport
                  </Link>

                  <Link
                    href={`/ai?prompt=${encodeURIComponent(`I am growing ${crop.name} in stage ${crop.stage}. What are key management tips?`)}`}
                    className="btn btn-ai btn-sm text-[11px] py-1 px-2.5"
                  >
                    🤖 Ask AI
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🌱"
          title="No Crops Found"
          description={
            selectedStage === 'all'
              ? 'Add your first crop to track growth stages, calculate expected yield, and connect to harvest transportation.'
              : `No crops currently in the '${selectedStage}' stage.`
          }
          actionLabel="Add New Crop"
          actionHref="/crops/new"
        />
      )}
    </div>
  );
}
