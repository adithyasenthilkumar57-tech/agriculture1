import { NextResponse } from 'next/server';
import { withAuth, withOptionalAuth } from '@/lib/auth/middleware';
import { getWeatherForLocation } from '@/lib/services/weather';
import connectDB from '@/lib/db/mongoose';
import Farm from '@/lib/db/models/Farm';

// GET /api/weather?lat=&lon=&farmId=
export const GET = withOptionalAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    let lat = searchParams.get('lat');
    let lon = searchParams.get('lon');
    const farmId = searchParams.get('farmId');

    // If farmId provided, look up farm coordinates
    if (farmId && (!lat || !lon)) {
      await connectDB();
      const farm = await Farm.findById(farmId).lean();
      if (farm?.location?.coordinates?.lat && farm?.location?.coordinates?.lon) {
        lat = farm.location.coordinates.lat;
        lon = farm.location.coordinates.lon;
      }
    }

    // Default fallback if no coordinates provided (e.g. Nagpur, Maharashtra - central agricultural hub in India)
    if (!lat || !lon) {
      lat = '21.1458';
      lon = '79.0882';
    }

    const weatherData = await getWeatherForLocation(Number(lat), Number(lon));

    return NextResponse.json({
      success: true,
      ...weatherData,
      locationQueried: { lat: Number(lat), lon: Number(lon) },
    });
  } catch (error) {
    console.error('[Weather API]', error);
    return NextResponse.json(
      {
        success: false,
        available: false,
        reason: 'Unable to fetch weather data at this time.',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
