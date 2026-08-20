import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import TransportRequest from '@/lib/db/models/TransportRequest';
import TransportOffer from '@/lib/db/models/TransportOffer';

// GET /api/transport/requests/[id]
export const GET = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const transportRequest = await TransportRequest.findById(id)
      .populate('requester', 'name phone preferredLanguage')
      .populate('farm')
      .populate('crop')
      .lean();

    if (!transportRequest) {
      return NextResponse.json({ success: false, error: 'Transport request not found.' }, { status: 404 });
    }

    // Fetch offers submitted for this request
    const offers = await TransportOffer.find({ request: id })
      .populate({
        path: 'transporter',
        populate: { path: 'user', select: 'name phone' },
      })
      .populate('vehicle')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { ...transportRequest, offers },
    });
  } catch (error) {
    console.error('[Transport Request GET by ID]', error);
    return NextResponse.json({ success: false, error: 'Failed to load transport request.' }, { status: 500 });
  }
});

// PUT /api/transport/requests/[id]
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    await connectDB();

    const transportRequest = await TransportRequest.findOneAndUpdate(
      { _id: id, requester: user._id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!transportRequest) {
      return NextResponse.json({ success: false, error: 'Request not found or unauthorized.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: transportRequest });
  } catch (error) {
    console.error('[Transport Request PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update transport request.' }, { status: 500 });
  }
});
