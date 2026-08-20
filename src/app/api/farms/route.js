import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Farm from '@/lib/db/models/Farm';

// GET /api/farms — list current user's farms
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const farms = await Farm.find({ owner: user._id, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: farms });
  } catch (error) {
    console.error('[Farms GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load farms.' }, { status: 500 });
  }
});

// POST /api/farms — create a new farm
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { name, location, size, soilType, irrigationType, waterAvailability, description } = body;

    if (!name?.trim() || !location?.address?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Farm name and location address are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const farm = await Farm.create({
      owner: user._id,
      name: name.trim(),
      location,
      size,
      soilType,
      irrigationType,
      waterAvailability,
      description: description?.trim(),
    });

    return NextResponse.json({ success: true, data: farm }, { status: 201 });
  } catch (error) {
    console.error('[Farms POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create farm.' }, { status: 500 });
  }
}, { roles: ['farmer', 'admin'] });
