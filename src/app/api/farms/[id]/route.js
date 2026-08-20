import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Farm from '@/lib/db/models/Farm';
import Crop from '@/lib/db/models/Crop';

// GET /api/farms/[id]
export const GET = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const farm = await Farm.findOne({ _id: id, owner: user._id, isActive: true }).lean();

    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found.' }, { status: 404 });
    }

    // Include farm's active crops
    const crops = await Crop.find({ farm: farm._id, isActive: true }).lean();

    return NextResponse.json({ success: true, data: { ...farm, crops } });
  } catch (error) {
    console.error('[Farm GET by ID]', error);
    return NextResponse.json({ success: false, error: 'Failed to load farm details.' }, { status: 500 });
  }
});

// PUT /api/farms/[id]
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    await connectDB();

    const farm = await Farm.findOneAndUpdate(
      { _id: id, owner: user._id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: farm });
  } catch (error) {
    console.error('[Farm PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update farm.' }, { status: 500 });
  }
});

// DELETE /api/farms/[id] (soft delete)
export const DELETE = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const farm = await Farm.findOneAndUpdate(
      { _id: id, owner: user._id },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Farm removed successfully.' });
  } catch (error) {
    console.error('[Farm DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete farm.' }, { status: 500 });
  }
});
