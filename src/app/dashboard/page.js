'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFarm } from '@/context/FarmContext';
import EmptyState from '@/components/shared/EmptyState';
import SourceLabel from '@/components/shared/SourceLabel';
import CropTimeline from '@/components/shared/CropTimeline';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { farms, activeFarm, crops, loading: farmLoading } = useFarm();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [trips, setTrips] = useState([]);

  // Fetch live weather based on active farm coordinates or fallback
  useEffect(() => {
    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        let url = '/api/weather';
        if (activeFarm?.location?.coordinates?.lat && activeFarm?.location?.coordinates?.lon) {
          url += `?lat=${activeFarm.location.coordinates.lat}&lon=${activeFarm.location.coordinates.lon}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.available) {
          setWeather(data);
        } else {
          setWeather(null);
        }
      } catch {
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, [activeFarm]);

  // Fetch pending tasks
  useEffect(() => {
    if (user) {
      fetch('/api/tasks?status=pending')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setTasks(data.data || []);
        })
        .catch(() => {});
    }
  }, [user]);

  // Fetch trips
  useEffect(() => {
    if (user) {
      fetch('/api/transport/trips')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setTrips(data.data || []);
        })
        .catch(() => {});
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <div className="skeleton h-8 w-48 mx-auto mb-4" />
        <p className="text-sm">Loading your agriculture dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">
            Welcome, {user?.name || 'Farmer'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {activeFarm
              ? `Viewing active farm: ${activeFarm.name} (${activeFarm.location?.district || activeFarm.location?.address})`
              : 'Your complete digital agriculture, transport, and AI ecosystem'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/crops/new" className="btn btn-outline btn-sm text-xs">
            + Add Crop
          </Link>
          <Link href="/transport/book" className="btn btn-transport btn-sm text-xs">
            Book Transport
          </Link>
          <Link href="/ai" className="btn btn-ai btn-sm text-xs">
            Ask AI
          </Link>
        </div>
      </div>

      {/* Top 3 Pillar Quick Navigation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Agriculture */}
        <Link
          href="/farms"
          className="card card-agriculture p-4 hover:shadow-md transition-all flex items-center gap-3 bg-linear-to-r from-primary-50/50 to-white"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-neutral-900 font-display">Agriculture</h3>
            <p className="text-xs text-neutral-500">
              {farms.length} Farm{farms.length === 1 ? '' : 's'} • {crops.length} Active Crop{crops.length === 1 ? '' : 's'}
            </p>
          </div>
          <span className="text-primary-600 text-xs font-bold">Manage →</span>
        </Link>

        {/* Pillar 2: Transport */}
        <Link
          href="/transport"
          className="card card-transport p-4 hover:shadow-md transition-all flex items-center gap-3 bg-linear-to-r from-transport-50/50 to-white"
        >
          <div className="w-10 h-10 rounded-xl bg-transport-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-transport-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM3 7h3l2-4h8l2 4h3v6h-2m-2 0H7m-2 0H3V7z" /></svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-neutral-900 font-display">Agricultural Transport</h3>
            <p className="text-xs text-neutral-500">
              {trips.length} Active/Past Trip{trips.length === 1 ? '' : 's'}
            </p>
          </div>
          <span className="text-transport-600 text-xs font-bold">Book/Track →</span>
        </Link>

        {/* Pillar 3: AI Assistant */}
        <Link
          href="/ai"
          className="card card-ai p-4 hover:shadow-md transition-all flex items-center gap-3 bg-linear-to-r from-ai-50/50 to-white"
        >
          <div className="w-10 h-10 rounded-xl bg-ai-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-ai-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-neutral-900 font-display">AgriMitra AI Assistant</h3>
            <p className="text-xs text-neutral-500">Contextual farm & logistics advice</p>
          </div>
          <span className="text-ai-600 text-xs font-bold">Ask AI →</span>
        </Link>
      </div>

      {/* Main Grid: Weather + Active Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Intelligence Card */}
        <div className="card p-5 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold font-display text-sm text-neutral-900 flex items-center gap-1.5">
                Weather Intelligence
              </h3>
              {weather?.available && (
                <SourceLabel source="Open-Meteo" updated="Live" status="live" />
              )}
            </div>

            {weatherLoading ? (
              <div className="space-y-3 py-4">
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-8 w-full" />
              </div>
            ) : weather?.available ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50/70 border border-primary-100">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{weather.current.emoji}</span>
                    <div>
                      <div className="text-2xl font-black font-display text-neutral-900 leading-none">
                        {weather.current.temperature.value}°C
                      </div>
                      <div className="text-xs text-neutral-600 font-medium mt-1">
                        {weather.current.condition} • Feels like {weather.current.feelsLike.value}°C
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Humidity</span>
                    <span className="font-bold text-neutral-800">{weather.current.humidity.value}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Wind</span>
                    <span className="font-bold text-neutral-800">{weather.current.windSpeed.value} km/h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Rain</span>
                    <span className="font-bold text-neutral-800">{weather.current.rain.value} mm</span>
                  </div>
                </div>

                {/* Agricultural Weather Alerts */}
                {weather.agriculturalAlerts?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {weather.agriculturalAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium flex items-start gap-1.5"
                      >
                        <span>Warning</span>
                        <span>{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-400 text-xs">
                <span className="text-2xl block mb-1">--</span>
                Live weather data unavailable.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4 text-center">
            <Link href="/weather" className="text-xs font-semibold text-primary-700 hover:underline">
              View 7-Day Agricultural Forecast →
            </Link>
          </div>
        </div>

        {/* Current Crops Section */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold font-display text-sm text-neutral-900 flex items-center gap-1.5">
              Current Crops & Lifecycle
            </h3>
            <Link href="/crops/new" className="text-xs font-bold text-primary-600 hover:underline">
              + Add Crop
            </Link>
          </div>

          {crops.length > 0 ? (
            <div className="space-y-4">
              {crops.slice(0, 3).map((crop) => (
                <div
                  key={crop._id}
                  className="p-4 rounded-xl border border-neutral-100 hover:border-primary-200 bg-neutral-50/50 space-y-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">
                        {crop.name} {crop.variety && <span className="text-xs text-neutral-500 font-normal">({crop.variety})</span>}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Method: <span className="capitalize font-medium text-neutral-700">{crop.cultivationMethod || 'Standard'}</span>
                        {crop.fieldArea?.value && ` • Area: ${crop.fieldArea.value} ${crop.fieldArea.unit}`}
                      </p>
                    </div>

                    <span className="badge badge-success capitalize text-xs">
                      {crop.stage}
                    </span>
                  </div>

                  {/* Crop Lifecycle Timeline */}
                  <CropTimeline currentStage={crop.stage} />
                </div>
              ))}

              {crops.length > 3 && (
                <div className="text-center pt-1">
                  <Link href="/crops" className="text-xs font-semibold text-primary-700 hover:underline">
                    View all {crops.length} crops →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon="🌱"
              title="No Crops Registered Yet"
              description="Add your current crops to track stage lifecycles, log health screenings, and connect directly to harvest transport."
              actionLabel="Add First Crop"
              actionHref="/crops/new"
            />
          )}
        </div>
      </div>

      {/* Lower Row: Active Tasks + Active Transport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farming Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold font-display text-sm text-neutral-900 flex items-center gap-1.5">
              Pending Farming Tasks
            </h3>
            <Link href="/tasks" className="text-xs font-bold text-primary-600 hover:underline">
              View All
            </Link>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {task.category === 'irrigation'
                        ? 'W'
                        : task.category === 'fertilizer'
                        ? 'F'
                        : task.category === 'harvesting'
                        ? 'H'
                        : 'T'}
                    </span>
                    <div>
                      <span className="font-bold text-neutral-800 block">{task.title}</span>
                      <span className="text-[10px] text-neutral-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`badge text-[10px] capitalize ${
                      task.priority === 'urgent'
                        ? 'badge-error'
                        : task.priority === 'high'
                        ? 'badge-warning'
                        : 'badge-neutral'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📋"
              title="No Pending Tasks"
              description="Keep your farm schedule organized. Add tasks for irrigation, fertilization, spraying, or harvest preparation."
              actionLabel="Create Task"
              actionHref="/tasks"
            />
          )}
        </div>

        {/* Agricultural Transport Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold font-display text-sm text-neutral-900 flex items-center gap-1.5">
              Transport & Logistics Status
            </h3>
            <Link href="/transport/book" className="text-xs font-bold text-transport-600 hover:underline">
              + Book New
            </Link>
          </div>

          {trips.length > 0 ? (
            <div className="space-y-3">
              {trips.slice(0, 2).map((trip) => (
                <div
                  key={trip._id}
                  className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800">
                      Cargo: {trip.booking?.request?.cargo?.name || 'Produce'} (
                      {trip.booking?.request?.cargo?.quantity?.value}{' '}
                      {trip.booking?.request?.cargo?.quantity?.unit})
                    </span>
                    <span className="badge badge-transport capitalize text-[10px]">
                      {trip.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {trip.booking?.request?.pickup?.address} &rarr; {trip.booking?.request?.destination?.address}
                  </p>
                  <div className="text-[10px] text-neutral-400">
                    GPS Status: {trip.gpsTracking?.isEnabled ? 'Active' : 'Live GPS unavailable. Last status updated manually.'}
                  </div>
                </div>
              ))}
              <div className="text-center pt-1">
                <Link href="/transport" className="text-xs font-semibold text-transport-700 hover:underline">
                  View full transport management →
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="🚜"
              title="No Transport Trips Yet"
              description="Move your harvested crops, inputs, seeds, or equipment directly from your farm to market, cold storage, or buyer."
              actionLabel="Book Agricultural Transport"
              actionHref="/transport/book"
              variant="transport"
            />
          )}
        </div>
      </div>
    </div>
  );
}
