import { NextResponse } from 'next/server';
import { withAuth, withOptionalAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Transporter from '@/lib/db/models/Transporter';
import Vehicle from '@/lib/db/models/Vehicle';

// GET /api/transporters — search/list verified transporters or current user's profile
export const GET = withOptionalAuth(async (request, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const selfOnly = searchParams.get('self');

    await connectDB();

    if (selfOnly && user) {
      const transporter = await Transporter.findOne({ user: user._id })
        .populate('user', 'name email phone preferredLanguage')
        .lean();
      
      const vehicles = transporter ? await Vehicle.find({ transporter: transporter._id, isActive: true }).lean() : [];
      return NextResponse.json({ success: true, data: transporter, vehicles });
    }

    // List verified transporters
    const query = { verificationStatus: 'verified', isAvailable: true };
    const transporters = await Transporter.find(query)
      .populate('user', 'name phone')
      .lean();

    return NextResponse.json({ success: true, data: transporters });
  } catch (error) {
    console.error('[Transporters GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load transporters.' }, { status: 500 });
  }
});

// POST /api/transporters — register/update transporter profile
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { businessName, operatingAreas, serviceRadius, specializations, description, yearsOfExperience } = body;

    await connectDB();

    let transporter = await Transporter.findOne({ user: user._id });

    if (transporter) {
      transporter = await Transporter.findByIdAndUpdate(
        transporter._id,
        {
          $set: {
            businessName: businessName?.trim(),
            operatingAreas,
            serviceRadius,
            specializations,
            description: description?.trim(),
            yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
          },
        },
        { new: true }
      );
    } else {
      transporter = await Transporter.create({
        user: user._id,
        businessName: businessName?.trim() || `${user.name}'s Transport`,
        operatingAreas: operatingAreas || [],
        serviceRadius,
        specializations: specializations || ['general'],
        description: description?.trim(),
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
        verificationStatus: 'pending',
      });
    }

    return NextResponse.json({ success: true, data: transporter }, { status: 200 });
  } catch (error) {
    console.error('[Transporter POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to save transporter profile.' }, { status: 500 });
  }
}, { roles: ['transporter', 'admin'] });
