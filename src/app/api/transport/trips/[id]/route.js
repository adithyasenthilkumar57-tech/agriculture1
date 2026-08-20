import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Trip from '@/lib/db/models/Trip';
import Notification from '@/lib/db/models/Notification';
import TransportRequest from '@/lib/db/models/TransportRequest';
import Transporter from '@/lib/db/models/Transporter';

// GET /api/transport/trips/[id]
export const GET = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const trip = await Trip.findById(id)
      .populate({
        path: 'booking',
        populate: [{ path: 'request' }, { path: 'offer' }],
      })
      .populate('farmer', 'name phone')
      .populate('vehicle')
      .populate({
        path: 'transporter',
        populate: { path: 'user', select: 'name phone' },
      })
      .lean();

    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (error) {
    console.error('[Trip GET by ID]', error);
    return NextResponse.json({ success: false, error: 'Failed to load trip.' }, { status: 500 });
  }
});

// PUT /api/transport/trips/[id] — update trip status
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    const { status, note, gpsCoordinates } = await request.json();

    const validStatuses = [
      'booking_confirmed',
      'transporter_assigned',
      'en_route_to_farm',
      'pickup_completed',
      'in_transit',
      'arrived',
      'delivery_completed',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid trip status.' }, { status: 400 });
    }

    await connectDB();

    const trip = await Trip.findById(id).populate('booking');
    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found.' }, { status: 404 });
    }

    trip.status = status;
    trip.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: user._id,
      note: note || `Status updated to ${status.replace(/_/g, ' ')}`,
    });

    if (status === 'pickup_completed') {
      trip.actualPickupTime = new Date();
    } else if (status === 'delivery_completed') {
      trip.actualDeliveryTime = new Date();
      // Mark request completed
      if (trip.booking?.request) {
        await TransportRequest.findByIdAndUpdate(trip.booking.request, { status: 'completed' });
      }
      // Increment transporter completed trips
      await Transporter.findByIdAndUpdate(trip.transporter, { $inc: { totalTrips: 1 } });
    }

    if (gpsCoordinates?.lat && gpsCoordinates?.lon) {
      trip.gpsTracking = {
        isEnabled: true,
        lastLocation: {
          lat: gpsCoordinates.lat,
          lon: gpsCoordinates.lon,
          updatedAt: new Date(),
        },
      };
    }

    await trip.save();

    // Send notification to farmer
    const statusLabels = {
      transporter_assigned: 'Transporter Assigned',
      en_route_to_farm: 'Vehicle En Route to Farm',
      pickup_completed: 'Cargo Pickup Completed',
      in_transit: 'Cargo In Transit',
      arrived: 'Vehicle Arrived at Destination',
      delivery_completed: 'Delivery Completed',
    };

    if (user.role === 'transporter') {
      await Notification.create({
        user: trip.farmer,
        type: 'trip_update',
        title: `Trip Update: ${statusLabels[status] || status}`,
        body: note || `Your agricultural transport trip status has been updated to: ${statusLabels[status] || status}`,
        link: `/transport`,
        referenceId: trip._id,
        referenceModel: 'Trip',
      });
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (error) {
    console.error('[Trip Status PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update trip status.' }, { status: 500 });
  }
});
