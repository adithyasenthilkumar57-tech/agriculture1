import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import TransportOffer from '@/lib/db/models/TransportOffer';
import TransportRequest from '@/lib/db/models/TransportRequest';
import Booking from '@/lib/db/models/Booking';
import Trip from '@/lib/db/models/Trip';
import Transporter from '@/lib/db/models/Transporter';
import Notification from '@/lib/db/models/Notification';

// PUT /api/transport/offers/[id] — Accept or reject an offer
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    const { action } = await request.json(); // 'accept' | 'reject' | 'withdraw'

    if (!['accept', 'reject', 'withdraw'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
    }

    await connectDB();

    const offer = await TransportOffer.findById(id).populate('request');
    if (!offer) {
      return NextResponse.json({ success: false, error: 'Offer not found.' }, { status: 404 });
    }

    const transportRequest = offer.request;

    if (action === 'accept') {
      // Must be the requester
      if (transportRequest.requester.toString() !== user._id.toString() && user.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Only the request creator can accept this offer.' }, { status: 403 });
      }

      // Mark this offer accepted, others rejected
      offer.status = 'accepted';
      await offer.save();

      await TransportOffer.updateMany(
        { request: transportRequest._id, _id: { $ne: offer._id } },
        { $set: { status: 'rejected' } }
      );

      // Update request status
      transportRequest.status = 'accepted';
      transportRequest.acceptedOffer = offer._id;
      await transportRequest.save();

      // Create Booking
      const booking = await Booking.create({
        request: transportRequest._id,
        offer: offer._id,
        farmer: user._id,
        transporter: offer.transporter,
        vehicle: offer.vehicle,
        agreedPrice: offer.price,
        status: 'confirmed',
      });

      // Create Active Trip with real lifecycle starting at 'booking_confirmed'
      const trip = await Trip.create({
        booking: booking._id,
        farmer: user._id,
        transporter: offer.transporter,
        vehicle: offer.vehicle,
        status: 'booking_confirmed',
        statusHistory: [
          {
            status: 'booking_confirmed',
            updatedAt: new Date(),
            updatedBy: user._id,
            note: 'Booking confirmed by farmer. Transporter assigned.',
          },
        ],
      });

      // Notify transporter
      const transporterDoc = await Transporter.findById(offer.transporter);
      if (transporterDoc) {
        await Notification.create({
          user: transporterDoc.user,
          type: 'transport_accepted',
          title: 'Offer Accepted! Transport Booked',
          body: `Farmer ${user.name} accepted your offer of ₹${offer.price.value}. Trip #${trip._id.toString().slice(-6)} is confirmed.`,
          link: `/transport`,
          referenceId: trip._id,
          referenceModel: 'Trip',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Offer accepted! Transport booking confirmed and trip started.',
        data: { booking, trip },
      });
    }

    if (action === 'reject') {
      offer.status = 'rejected';
      await offer.save();
      return NextResponse.json({ success: true, message: 'Offer rejected.' });
    }

    if (action === 'withdraw') {
      offer.status = 'withdrawn';
      await offer.save();
      return NextResponse.json({ success: true, message: 'Offer withdrawn.' });
    }
  } catch (error) {
    console.error('[Offer Action PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update offer status.' }, { status: 500 });
  }
});
