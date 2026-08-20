import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import TransportRequest from '@/lib/db/models/TransportRequest';
import TransportOffer from '@/lib/db/models/TransportOffer';
import Transporter from '@/lib/db/models/Transporter';

// GET /api/transport/requests — list requests
// For farmer: my requests
// For transporter: open requests matching their area / all open requests
export const GET = withAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'my' | 'open' | 'all'

    await connectDB();

    let query = {};
    if (user.role === 'farmer' || filter === 'my') {
      query.requester = user._id;
    } else if (user.role === 'transporter' || filter === 'open') {
      query.status = { $in: ['open', 'offers_received'] };
    }

    const requests = await TransportRequest.find(query)
      .populate('requester', 'name phone preferredLanguage')
      .populate('farm', 'name')
      .populate('crop', 'name variety')
      .populate('acceptedOffer')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('[Transport Requests GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load transport requests.' }, { status: 500 });
  }
});

// POST /api/transport/requests — create new agricultural transport request
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const {
      farm,
      crop,
      cargo,
      pickup,
      destination,
      preferredDate,
      preferredTime,
      preferredVehicleType,
      estimatedDistance,
      isSharedTransport,
      notes,
    } = body;

    if (!cargo?.category || !cargo?.name || !cargo?.quantity?.value || !pickup?.address || !destination?.address || !preferredDate) {
      return NextResponse.json(
        { success: false, error: 'Cargo details, pickup address, destination address and preferred date are required.' },
        { status: 400 }
      );
    }

    // Calculate realistic estimated cost formula: base rate + distance rate + cold-chain factor
    let estCost = 0;
    const dist = Number(estimatedDistance?.value || 25);
    const weightInKg = cargo.quantity.unit === 'tonnes' ? Number(cargo.quantity.value) * 1000 : Number(cargo.quantity.value);
    
    // Transparent base estimation formula
    const baseRate = 500;
    const perKmRate = 18; // INR per km approx for agricultural loads
    const refrigerationMultiplier = cargo.requiresRefrigeration ? 1.4 : 1.0;
    estCost = Math.round((baseRate + (dist * perKmRate) + (weightInKg * 0.2)) * refrigerationMultiplier);

    await connectDB();

    const transportRequest = await TransportRequest.create({
      requester: user._id,
      farm: farm || undefined,
      crop: crop || undefined,
      cargo: {
        category: cargo.category,
        name: cargo.name.trim(),
        quantity: {
          value: Number(cargo.quantity.value),
          unit: cargo.quantity.unit || 'kg',
        },
        requiresRefrigeration: Boolean(cargo.requiresRefrigeration),
        handlingNotes: cargo.handlingNotes?.trim(),
      },
      pickup: {
        address: pickup.address.trim(),
        village: pickup.village?.trim(),
        district: pickup.district?.trim(),
        state: pickup.state?.trim(),
        coordinates: pickup.coordinates,
        contactName: pickup.contactName?.trim() || user.name,
        contactPhone: pickup.contactPhone?.trim() || user.phone,
      },
      destination: {
        type: destination.type || 'market',
        name: destination.name?.trim(),
        address: destination.address.trim(),
        district: destination.district?.trim(),
        state: destination.state?.trim(),
        coordinates: destination.coordinates,
        contactName: destination.contactName?.trim(),
        contactPhone: destination.contactPhone?.trim(),
      },
      preferredDate: new Date(preferredDate),
      preferredTime: preferredTime?.trim(),
      preferredVehicleType: preferredVehicleType || 'any',
      estimatedDistance: { value: dist, unit: 'km' },
      estimatedCost: {
        value: estCost,
        currency: 'INR',
        note: 'Estimated cost — final price will be determined by actual transporter offers received.',
      },
      status: 'open',
      isSharedTransport: Boolean(isSharedTransport),
      notes: notes?.trim(),
    });

    return NextResponse.json({ success: true, data: transportRequest }, { status: 201 });
  } catch (error) {
    console.error('[Transport Request POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create transport request.' }, { status: 500 });
  }
});
