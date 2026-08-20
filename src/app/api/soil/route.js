import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import SoilRecord from '@/lib/db/models/SoilRecord';

// GET /api/soil — list soil records for user's farms
export const GET = withAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    await connectDB();

    const query = { owner: user._id };
    if (farmId) query.farm = farmId;

    const records = await SoilRecord.find(query)
      .populate('farm', 'name location')
      .sort({ testDate: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('[Soil GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load soil records.' }, { status: 500 });
  }
});

// POST /api/soil — add a new soil test record
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const {
      farm,
      testDate,
      testLab,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      organicMatter,
      moisture,
      electricalConductivity,
      soilTexture,
      notes,
    } = body;

    if (!farm) {
      return NextResponse.json({ success: false, error: 'Farm ID is required.' }, { status: 400 });
    }

    await connectDB();

    const record = await SoilRecord.create({
      owner: user._id,
      farm,
      testDate: testDate ? new Date(testDate) : new Date(),
      testLab: testLab?.trim(),
      ph: ph !== undefined && ph !== '' ? Number(ph) : undefined,
      nitrogen: nitrogen ? { value: Number(nitrogen.value || nitrogen) } : undefined,
      phosphorus: phosphorus ? { value: Number(phosphorus.value || phosphorus) } : undefined,
      potassium: potassium ? { value: Number(potassium.value || potassium) } : undefined,
      organicMatter: organicMatter ? { value: Number(organicMatter.value || organicMatter) } : undefined,
      moisture: moisture ? { value: Number(moisture.value || moisture) } : undefined,
      electricalConductivity: electricalConductivity ? { value: Number(electricalConductivity.value || electricalConductivity) } : undefined,
      soilTexture,
      notes: notes?.trim(),
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('[Soil POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to record soil data.' }, { status: 500 });
  }
});
