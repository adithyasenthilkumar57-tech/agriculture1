import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import TransportRating from '@/lib/db/models/TransportRating';
import Trip from '@/lib/db/models/Trip';
import Transporter from '@/lib/db/models/Transporter';

// POST /api/transport/ratings — submit review for a completed trip
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { trip: tripId, rating, punctuality, cargoHandling, communication, comment } = body;

    if (!tripId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Trip ID and a valid rating (1-5) are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found.' }, { status: 404 });
    }

    if (trip.farmer.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only the farmer who booked this trip can submit a rating.' },
        { status: 403 }
      );
    }

    if (trip.status !== 'delivery_completed') {
      return NextResponse.json(
        { success: false, error: 'Ratings can only be submitted for completed deliveries.' },
        { status: 400 }
      );
    }

    const existing = await TransportRating.findOne({ trip: tripId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already rated this trip.' },
        { status: 409 }
      );
    }

    const newRating = await TransportRating.create({
      trip: tripId,
      ratedBy: user._id,
      transporter: trip.transporter,
      rating: Number(rating),
      punctuality: punctuality ? Number(punctuality) : undefined,
      cargoHandling: cargoHandling ? Number(cargoHandling) : undefined,
      communication: communication ? Number(communication) : undefined,
      comment: comment?.trim(),
    });

    // Recompute real average rating for the transporter
    const allRatings = await TransportRating.find({ transporter: trip.transporter });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await Transporter.findByIdAndUpdate(trip.transporter, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: allRatings.length,
    });

    return NextResponse.json({ success: true, data: newRating }, { status: 201 });
  } catch (error) {
    console.error('[Rating POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to submit rating.' }, { status: 500 });
  }
});
