import { NextResponse } from 'next/server';
import { withAuth, withOptionalAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import ProductListing from '@/lib/db/models/ProductListing';

// GET /api/marketplace/listings — browse marketplace with real search and filters
export const GET = withOptionalAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const state = searchParams.get('state');
    const search = searchParams.get('q');
    const myOnly = searchParams.get('my');

    await connectDB();

    let query = { status: 'active' };

    if (myOnly && user) {
      query = { farmer: user._id };
    } else {
      if (category && category !== 'all') query.category = category;
      if (district) query['location.district'] = new RegExp(district, 'i');
      if (state) query['location.state'] = new RegExp(state, 'i');
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { cropName: new RegExp(search, 'i') },
          { variety: new RegExp(search, 'i') },
        ];
      }
    }

    const listings = await ProductListing.find(query)
      .populate('farmer', 'name phone preferredLanguage')
      .populate('farm', 'name location')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('[Marketplace GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load marketplace listings.' }, { status: 500 });
  }
});

// POST /api/marketplace/listings — create listing
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const {
      farm,
      crop,
      title,
      cropName,
      variety,
      category,
      quantity,
      grade,
      price,
      harvestDate,
      availableFrom,
      location,
      description,
    } = body;

    if (!title?.trim() || !cropName?.trim() || !quantity?.available || !price?.value || !location?.district || !location?.state) {
      return NextResponse.json(
        { success: false, error: 'Title, crop name, quantity, price, and location district/state are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const listing = await ProductListing.create({
      farmer: user._id,
      farm: farm || undefined,
      crop: crop || undefined,
      title: title.trim(),
      cropName: cropName.trim(),
      variety: variety?.trim(),
      category: category || 'other',
      quantity: {
        available: Number(quantity.available),
        unit: quantity.unit || 'kg',
      },
      grade: grade || 'standard',
      price: {
        value: Number(price.value),
        unit: price.unit || 'per_kg',
        currency: 'INR',
        negotiable: price.negotiable !== false,
      },
      harvestDate: harvestDate ? new Date(harvestDate) : null,
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      location: {
        address: location.address?.trim(),
        district: location.district.trim(),
        state: location.state.trim(),
      },
      description: description?.trim(),
      status: 'active',
    });

    return NextResponse.json({ success: true, data: listing }, { status: 201 });
  } catch (error) {
    console.error('[Marketplace POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create marketplace listing.' }, { status: 500 });
  }
}, { roles: ['farmer', 'admin'] });
