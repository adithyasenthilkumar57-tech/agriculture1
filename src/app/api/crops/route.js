import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Crop from '@/lib/db/models/Crop';
import Farm from '@/lib/db/models/Farm';

// GET /api/crops — list current user's crops (optionally filter by farm)
export const GET = withAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    await connectDB();

    const query = { owner: user._id, isActive: true };
    if (farmId) query.farm = farmId;

    const crops = await Crop.find(query)
      .populate('farm', 'name location')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: crops });
  } catch (error) {
    console.error('[Crops GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load crops.' }, { status: 500 });
  }
});

// POST /api/crops — add a new crop
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const {
      farm,
      name,
      localName,
      variety,
      category,
      plantingDate,
      expectedHarvestDate,
      stage,
      cultivationMethod,
      fieldArea,
      estimatedYield,
      seedSource,
      notes,
      season,
    } = body;

    if (!farm || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Farm and crop name are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify farm belongs to user
    const farmDoc = await Farm.findOne({ _id: farm, owner: user._id });
    if (!farmDoc && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Selected farm not found or unauthorized.' },
        { status: 403 }
      );
    }

    const crop = await Crop.create({
      owner: user._id,
      farm,
      name: name.trim(),
      localName: localName?.trim(),
      variety: variety?.trim(),
      category: category || 'other',
      plantingDate: plantingDate ? new Date(plantingDate) : new Date(),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
      stage: stage || 'planting',
      cultivationMethod: cultivationMethod || 'conventional',
      fieldArea,
      estimatedYield,
      seedSource: seedSource?.trim(),
      notes: notes?.trim(),
      season,
    });

    return NextResponse.json({ success: true, data: crop }, { status: 201 });
  } catch (error) {
    console.error('[Crops POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to add crop.' }, { status: 500 });
  }
}, { roles: ['farmer', 'admin'] });
