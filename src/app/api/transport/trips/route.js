import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Trip from '@/lib/db/models/Trip';
import Transporter from '@/lib/db/models/Transporter';

// GET /api/transport/trips — list active and completed trips
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    let query = {};
    if (user.role === 'farmer') {
      query.farmer = user._id;
    } else if (user.role === 'transporter') {
      const transporter = await Transporter.findOne({ user: user._id });
      if (!transporter) return NextResponse.json({ success: true, data: [] });
      query.transporter = transporter._id;
    }

    const trips = await Trip.find(query)
      .populate({
        path: 'booking',
        populate: [
          { path: 'request' },
          { path: 'offer' },
        ],
      })
      .populate('farmer', 'name phone')
      .populate('vehicle')
      .populate({
        path: 'transporter',
        populate: { path: 'user', select: 'name phone' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: trips });
  } catch (error) {
    console.error('[Trips GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load trips.' }, { status: 500 });
  }
});
