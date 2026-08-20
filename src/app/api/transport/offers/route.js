import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import TransportOffer from '@/lib/db/models/TransportOffer';
import TransportRequest from '@/lib/db/models/TransportRequest';
import Transporter from '@/lib/db/models/Transporter';
import Booking from '@/lib/db/models/Booking';
import Trip from '@/lib/db/models/Trip';
import Notification from '@/lib/db/models/Notification';

// GET /api/transport/offers — list offers (transporter sees theirs, farmer sees offers for their requests)
export const GET = withAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    await connectDB();

    let query = {};
    if (requestId) {
      query.request = requestId;
    } else if (user.role === 'transporter') {
      const transporter = await Transporter.findOne({ user: user._id });
      if (!transporter) return NextResponse.json({ success: true, data: [] });
      query.transporter = transporter._id;
    }

    const offers = await TransportOffer.find(query)
      .populate('request')
      .populate('vehicle')
      .populate({
        path: 'transporter',
        populate: { path: 'user', select: 'name phone' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error('[Offers GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load offers.' }, { status: 500 });
  }
});

// POST /api/transport/offers — submit an offer on a transport request
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { request: requestId, vehicle: vehicleId, price, estimatedPickupTime, estimatedDeliveryTime, notes } = body;

    if (!requestId || !vehicleId || !price?.value) {
      return NextResponse.json(
        { success: false, error: 'Request ID, vehicle ID and price are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const transporter = await Transporter.findOne({ user: user._id });
    if (!transporter) {
      return NextResponse.json(
        { success: false, error: 'You must complete your transporter profile first.' },
        { status: 400 }
      );
    }

    const targetRequest = await TransportRequest.findById(requestId);
    if (!targetRequest || targetRequest.status === 'completed' || targetRequest.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'This transport request is no longer accepting offers.' },
        { status: 400 }
      );
    }

    const offer = await TransportOffer.create({
      request: requestId,
      transporter: transporter._id,
      vehicle: vehicleId,
      price: {
        value: Number(price.value),
        currency: 'INR',
        includes: price.includes?.trim(),
      },
      estimatedPickupTime: estimatedPickupTime ? new Date(estimatedPickupTime) : null,
      estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
      notes: notes?.trim(),
      status: 'pending',
    });

    // Update request status
    await TransportRequest.findByIdAndUpdate(requestId, { status: 'offers_received' });

    // Send notification to farmer
    await Notification.create({
      user: targetRequest.requester,
      type: 'transport_offer',
      title: 'New Transport Offer Received',
      body: `${transporter.businessName || 'A transporter'} has submitted an offer of ₹${price.value} for your cargo transport.`,
      link: `/transport`,
      referenceId: offer._id,
      referenceModel: 'TransportOffer',
    });

    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error) {
    console.error('[Offer POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to submit offer.' }, { status: 500 });
  }
}, { roles: ['transporter', 'admin'] });
