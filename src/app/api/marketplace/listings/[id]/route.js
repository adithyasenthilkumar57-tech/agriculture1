import { NextResponse } from 'next/server';
import { withAuth, withOptionalAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import ProductListing from '@/lib/db/models/ProductListing';

// GET /api/marketplace/listings/[id]
export const GET = withOptionalAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const listing = await ProductListing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('farmer', 'name email phone preferredLanguage isVerified createdAt')
      .populate('farm', 'name location size soilType irrigationType')
      .lean();

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error('[Listing GET by ID]', error);
    return NextResponse.json({ success: false, error: 'Failed to load listing.' }, { status: 500 });
  }
});

// PUT /api/marketplace/listings/[id]
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    await connectDB();

    const listing = await ProductListing.findOneAndUpdate(
      { _id: id, farmer: user._id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found or unauthorized.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error('[Listing PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update listing.' }, { status: 500 });
  }
});

// DELETE /api/marketplace/listings/[id]
export const DELETE = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const listing = await ProductListing.findOneAndUpdate(
      { _id: id, farmer: user._id },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Listing archived successfully.' });
  } catch (error) {
    console.error('[Listing DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete listing.' }, { status: 500 });
  }
});
