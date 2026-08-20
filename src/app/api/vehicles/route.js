import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Vehicle from '@/lib/db/models/Vehicle';
import Transporter from '@/lib/db/models/Transporter';

// GET /api/vehicles — list current transporter's vehicles
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const transporter = await Transporter.findOne({ user: user._id });
    if (!transporter && user.role !== 'admin') {
      return NextResponse.json({ success: true, data: [] });
    }

    const vehicles = await Vehicle.find({ transporter: transporter._id, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('[Vehicles GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load vehicles.' }, { status: 500 });
  }
}, { roles: ['transporter', 'admin'] });

// POST /api/vehicles — add vehicle
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const {
      registrationNumber,
      type,
      make,
      model,
      year,
      capacity,
      isRefrigerated,
      refrigerationTempRange,
      features,
    } = body;

    if (!registrationNumber?.trim() || !type || !capacity?.value) {
      return NextResponse.json(
        { success: false, error: 'Registration number, vehicle type and capacity are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    let transporter = await Transporter.findOne({ user: user._id });
    if (!transporter) {
      // Auto-create transporter profile if not exists yet
      transporter = await Transporter.create({
        user: user._id,
        businessName: `${user.name}'s Transport`,
        verificationStatus: 'pending',
      });
    }

    const vehicle = await Vehicle.create({
      transporter: transporter._id,
      owner: user._id,
      registrationNumber: registrationNumber.trim().toUpperCase(),
      type,
      make: make?.trim(),
      model: model?.trim(),
      year: year ? Number(year) : undefined,
      capacity: {
        value: Number(capacity.value),
        unit: capacity.unit || 'tonnes',
      },
      isRefrigerated: Boolean(isRefrigerated),
      refrigerationTempRange: isRefrigerated ? refrigerationTempRange : undefined,
      features: features || [],
      verificationStatus: 'pending',
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    console.error('[Vehicle POST]', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A vehicle with this registration number already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: 'Failed to add vehicle.' }, { status: 500 });
  }
}, { roles: ['transporter', 'admin'] });
