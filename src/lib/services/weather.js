/**
 * AgriMitra AI — Weather Service
 * Uses Open-Meteo (free, no API key required) with agricultural parameters.
 */

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function getWeatherForLocation(lat, lon) {
  if (!lat || !lon) {
    return { available: false, reason: 'Location coordinates not provided.' };
  }

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
      'precipitation', 'rain', 'weather_code', 'wind_speed_10m',
      'wind_direction_10m', 'uv_index',
    ].join(','),
    hourly: ['precipitation_probability', 'soil_temperature_0cm', 'soil_moisture_0_to_1cm'].join(','),
    daily: [
      'weather_code', 'temperature_2m_max', 'temperature_2m_min',
      'precipitation_sum', 'precipitation_probability_max',
      'wind_speed_10m_max', 'uv_index_max',
    ].join(','),
    forecast_days: 7,
    timezone: 'Asia/Kolkata',
  });

  try {
    const response = await fetch(`${OPEN_METEO_BASE}?${params}`, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      console.error('[Weather Service] Open-Meteo error:', response.status);
      return { available: false, reason: 'Weather data provider temporarily unavailable.' };
    }

    const data = await response.json();

    return {
      available: true,
      source: 'Open-Meteo',
      sourceUrl: 'https://open-meteo.com',
      updatedAt: new Date().toISOString(),
      status: 'live',
      current: parseCurrent(data.current, data.current_units),
      daily: parseDaily(data.daily, data.daily_units),
      agriculturalAlerts: generateAgriculturalAlerts(data),
    };
  } catch (err) {
    console.error('[Weather Service] Network error:', err.message);
    return { available: false, reason: 'Unable to connect to weather service.' };
  }
}

function parseCurrent(current, units) {
  return {
    temperature: { value: current.temperature_2m, unit: units.temperature_2m || '°C' },
    feelsLike: { value: current.apparent_temperature, unit: '°C' },
    humidity: { value: current.relative_humidity_2m, unit: '%' },
    rain: { value: current.rain, unit: 'mm' },
    precipitation: { value: current.precipitation, unit: 'mm' },
    windSpeed: { value: current.wind_speed_10m, unit: 'km/h' },
    windDirection: current.wind_direction_10m,
    uvIndex: current.uv_index,
    weatherCode: current.weather_code,
    condition: weatherCodeToCondition(current.weather_code),
    emoji: weatherCodeToEmoji(current.weather_code),
  };
}

function parseDaily(daily, units) {
  if (!daily?.time) return [];
  return daily.time.map((date, i) => ({
    date,
    condition: weatherCodeToCondition(daily.weather_code[i]),
    emoji: weatherCodeToEmoji(daily.weather_code[i]),
    tempMax: { value: daily.temperature_2m_max[i], unit: '°C' },
    tempMin: { value: daily.temperature_2m_min[i], unit: '°C' },
    precipitation: { value: daily.precipitation_sum[i], unit: 'mm' },
    rainProbability: daily.precipitation_probability_max[i],
    windMax: { value: daily.wind_speed_10m_max[i], unit: 'km/h' },
    uvMax: daily.uv_index_max[i],
  }));
}

function generateAgriculturalAlerts(data) {
  const alerts = [];
  const c = data.current;

  if (c.rain > 0) {
    alerts.push({ type: 'rain', severity: 'info', message: `Rain detected (${c.rain}mm). Avoid pesticide/fertilizer application.` });
  }
  if (c.wind_speed_10m > 30) {
    alerts.push({ type: 'wind', severity: 'warning', message: `High wind speed (${c.wind_speed_10m} km/h). Avoid spraying operations.` });
  }
  if (c.temperature_2m > 38) {
    alerts.push({ type: 'heat', severity: 'warning', message: `High temperature (${c.temperature_2m}°C). Consider irrigation and avoid heat-sensitive operations.` });
  }
  if (c.temperature_2m < 10) {
    alerts.push({ type: 'cold', severity: 'info', message: `Low temperature (${c.temperature_2m}°C). Monitor frost-sensitive crops.` });
  }
  if (c.uv_index > 8) {
    alerts.push({ type: 'uv', severity: 'info', message: `High UV index (${c.uv_index}). Consider shade for sensitive crops and early/late field work.` });
  }

  // Check upcoming rain in forecast
  const todayPrecip = data.daily?.precipitation_sum?.[0] || 0;
  if (todayPrecip > 20) {
    alerts.push({ type: 'heavy_rain', severity: 'warning', message: `Heavy rain expected today (${todayPrecip}mm). Review irrigation and transport plans.` });
  }

  return alerts;
}

function weatherCodeToCondition(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy / misty';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow / sleet';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function weatherCodeToEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}
