'use client';

import { useState, useEffect } from 'react';
import { useFarm } from '@/context/FarmContext';
import SourceLabel from '@/components/shared/SourceLabel';

export default function WeatherPage() {
  const { activeFarm } = useFarm();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
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
        setLoading(false);
      }
    }
    fetchWeather();
  }, [activeFarm]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Weather Intelligence</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time agricultural weather forecasts, spray-window guidance, irrigation alerts, and rain protection
          </p>
        </div>

        {weather?.available && (
          <SourceLabel source="Open-Meteo" updated={new Date(weather.updatedAt).toLocaleTimeString()} status="live" />
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-48 w-full" />
          <div className="skeleton h-64 w-full" />
        </div>
      ) : weather?.available ? (
        <div className="space-y-6">
          {/* Current Weather Card */}
          <div className="card p-6 bg-linear-to-br from-primary-900 via-primary-800 to-neutral-900 text-white shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <span className="text-6xl select-none">{weather.current.emoji}</span>
                <div>
                  <div className="text-4xl md:text-5xl font-black font-display tracking-tight">
                    {weather.current.temperature.value}°C
                  </div>
                  <div className="text-sm text-primary-200 font-semibold mt-1">
                    {weather.current.condition} • Feels like {weather.current.feelsLike.value}°C
                  </div>
                  <div className="text-xs text-neutral-300 mt-0.5">
                    Location: {activeFarm?.location?.district || activeFarm?.location?.address || 'Central Agriculture Region'}
                  </div>
                </div>
              </div>

              {/* Quick Agri Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center min-w-[90px]">
                  <span className="text-[10px] text-primary-200 block">Humidity</span>
                  <span className="text-base font-bold">{weather.current.humidity.value}%</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center min-w-[90px]">
                  <span className="text-[10px] text-primary-200 block">Wind Speed</span>
                  <span className="text-base font-bold">{weather.current.windSpeed.value} km/h</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center min-w-[90px]">
                  <span className="text-[10px] text-primary-200 block">Rain</span>
                  <span className="text-base font-bold">{weather.current.rain.value} mm</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center min-w-[90px]">
                  <span className="text-[10px] text-primary-200 block">UV Index</span>
                  <span className="text-base font-bold">{weather.current.uvIndex ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agricultural Field Guidance Banner */}
          <div className="card p-5 border-l-4 border-l-primary-500 space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 font-display flex items-center gap-2">
              Agricultural Field Guidance for Today
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                  Spraying Conditions
                </span>
                <p className="text-neutral-600">
                  {weather.current.windSpeed.value > 25
                    ? 'High wind speed. Spraying pesticides/fungicides is NOT recommended due to drift risk.'
                    : weather.current.rain.value > 0
                    ? 'Rain detected. Postpone spray operations to prevent chemical wash-off.'
                    : 'Favorable spraying window. Low wind and clear conditions.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                  Irrigation Considerations
                </span>
                <p className="text-neutral-600">
                  {weather.current.rain.value > 5
                    ? 'Sufficient precipitation received. Pause standard irrigation cycles to save water.'
                    : weather.current.temperature.value > 35
                    ? 'High evapotranspiration rate. Maintain adequate soil moisture for standing crops.'
                    : 'Normal irrigation schedule recommended based on crop stage.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                  Transport & Harvesting
                </span>
                <p className="text-neutral-600">
                  {weather.current.rain.value > 0
                    ? 'Wet conditions. Ensure tarpaulin protection for open tractor trolleys during harvest transport.'
                    : 'Excellent transport & harvest weather. Road and field traffic conditions optimal.'}
                </p>
              </div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 font-display">7-Day Agricultural Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.daily?.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-center space-y-1.5 flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold text-neutral-700 block">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </span>
                  <span className="text-3xl block my-1">{day.emoji}</span>
                  <span className="text-[10px] text-neutral-500 font-medium line-clamp-1">
                    {day.condition}
                  </span>
                  <div className="text-xs font-bold text-neutral-800 pt-1 border-t border-neutral-200">
                    {day.tempMax.value}° / {day.tempMin.value}°
                  </div>
                  {day.rainProbability !== undefined && (
                    <span className="text-[10px] text-blue-600 font-semibold block">
                      {day.rainProbability}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center text-neutral-500 space-y-3">
          <span className="text-4xl block">--</span>
          <h3 className="font-bold text-base text-neutral-800">Live Weather Data Unavailable</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Unable to connect to live weather feed at this moment. AgriMitra AI does not display fake or simulated weather data.
          </p>
        </div>
      )}
    </div>
  );
}
