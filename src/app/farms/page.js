'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import EmptyState from '@/components/shared/EmptyState';

export default function FarmsPage() {
  const { farms, activeFarm, setActiveFarm, loading, refetchFarms } = useFarm();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">🏡 My Farms</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your registered agricultural land profiles, soil characteristics, and irrigation methods
          </p>
        </div>

        <Link href="/farms/new" className="btn btn-primary btn-sm text-xs">
          + Register New Farm
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skeleton h-44 w-full" />
          <div className="skeleton h-44 w-full" />
        </div>
      ) : farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => {
            const isActive = activeFarm?._id === farm._id;

            return (
              <div
                key={farm._id}
                className={`card p-5 flex flex-col justify-between transition-all ${
                  isActive ? 'ring-2 ring-primary-500 shadow-md bg-primary-50/20' : 'hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-neutral-900 font-display">{farm.name}</h3>
                      <p className="text-xs text-neutral-500">
                        📍 {farm.location?.address || `${farm.location?.district}, ${farm.location?.state}`}
                      </p>
                    </div>

                    {isActive ? (
                      <span className="badge badge-success text-[10px]">Active Context</span>
                    ) : (
                      <button
                        onClick={() => setActiveFarm(farm)}
                        className="btn btn-ghost btn-sm text-[11px] py-1 px-2"
                      >
                        Set Active
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] text-neutral-400 block">Total Area</span>
                      <span className="font-bold text-neutral-800">
                        {farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : 'Not specified'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] text-neutral-400 block">Soil Type</span>
                      <span className="font-bold text-neutral-800 capitalize">
                        {farm.soilType?.replace(/_/g, ' ') || 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] text-neutral-400 block">Irrigation</span>
                      <span className="font-bold text-neutral-800 capitalize">
                        {farm.irrigationType?.replace(/_/g, ' ') || 'Rain-fed'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] text-neutral-400 block">Water Source</span>
                      <span className="font-bold text-neutral-800 capitalize">
                        {farm.waterAvailability || 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 mt-4 flex items-center justify-between">
                  <Link
                    href={`/crops/new?farmId=${farm._id}`}
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    + Plant Crop
                  </Link>

                  <Link
                    href={`/farms/${farm._id}`}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🏡"
          title="Create Your First Farm"
          description="Add your farm details to start receiving personalized agricultural insights, crop stage tracking, and seamless harvest transport."
          actionLabel="Register Farm Profile"
          actionHref="/farms/new"
        />
      )}
    </div>
  );
}
