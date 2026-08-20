import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Crop from '@/lib/db/models/Crop';

// GET /api/crops/[id]
export const GET = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const crop = await Crop.findOne({ _id: id, owner: user._id, isActive: true })
      .populate('farm')
      .lean();

    if (!crop) {
      return NextResponse.json({ success: false, error: 'Crop not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: crop });
  } catch (error) {
    console.error('[Crop GET by ID]', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve crop.' }, { status: 500 });
  }
});

// PUT /api/crops/[id]
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    await connectDB();

    const crop = await Crop.findOneAndUpdate(
      { _id: id, owner: user._id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!crop) {
      return NextResponse.json({ success: false, error: 'Crop not found or unauthorized.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: crop });
  } catch (error) {
    console.error('[Crop PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update crop.' }, { status: 500 });
  }
});

// DELETE /api/crops/[id] (soft delete)
export const DELETE = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const crop = await Crop.findOneAndUpdate(
      { _id: id, owner: user._id },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!crop) {
      return NextResponse.json({ success: false, error: 'Crop not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Crop archived successfully.' });
  } catch (error) {
    console.error('[Crop DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete crop.' }, { status: 500 });
  }
});
