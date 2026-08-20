import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Farm from '@/lib/db/models/Farm';
import Crop from '@/lib/db/models/Crop';
import Transporter from '@/lib/db/models/Transporter';
import Vehicle from '@/lib/db/models/Vehicle';
import TransportRequest from '@/lib/db/models/TransportRequest';
import Trip from '@/lib/db/models/Trip';
import ProductListing from '@/lib/db/models/ProductListing';
import { isAIConfigured } from '@/lib/services/ai';

// GET /api/admin — system overview & stats
export const GET = withAdmin(async (request, context, user) => {
  try {
    await connectDB();

    const [
      totalUsers,
      totalFarmers,
      totalTransporters,
      totalBuyers,
      totalFarms,
      totalCrops,
      totalTransportRequests,
      totalTrips,
      totalListings,
      pendingTransporters,
      pendingVehicles,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'transporter' }),
      User.countDocuments({ role: 'buyer' }),
      Farm.countDocuments({ isActive: true }),
      Crop.countDocuments({ isActive: true }),
      TransportRequest.countDocuments(),
      Trip.countDocuments(),
      ProductListing.countDocuments({ status: 'active' }),
      Transporter.find({ verificationStatus: 'pending' }).populate('user', 'name email phone').lean(),
      Vehicle.find({ verificationStatus: 'pending' }).populate('owner', 'name phone').lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalFarmers,
        totalTransporters,
        totalBuyers,
        totalFarms,
        totalCrops,
        totalTransportRequests,
        totalTrips,
        totalListings,
      },
      verificationQueue: {
        transporters: pendingTransporters,
        vehicles: pendingVehicles,
      },
      systemHealth: {
        databaseConnected: true,
        aiConfigured: isAIConfigured(),
        weatherService: 'Open-Meteo (Live)',
      },
    });
  } catch (error) {
    console.error('[Admin GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load admin stats.' }, { status: 500 });
  }
});

// POST /api/admin — verify transporter or vehicle
export const POST = withAdmin(async (request, context, user) => {
  try {
    const body = await request.json();
    const { action, targetId, status } = body; // action: 'verify_transporter' | 'verify_vehicle'

    await connectDB();

    if (action === 'verify_transporter') {
      const transporter = await Transporter.findByIdAndUpdate(
        targetId,
        {
          verificationStatus: status || 'verified',
          verifiedAt: status === 'verified' ? new Date() : undefined,
          verifiedBy: user._id,
        },
        { new: true }
      );
      return NextResponse.json({ success: true, data: transporter });
    }

    if (action === 'verify_vehicle') {
      const vehicle = await Vehicle.findByIdAndUpdate(
        targetId,
        { verificationStatus: status || 'verified' },
        { new: true }
      );
      return NextResponse.json({ success: true, data: vehicle });
    }

    return NextResponse.json({ success: false, error: 'Invalid admin action.' }, { status: 400 });
  } catch (error) {
    console.error('[Admin POST]', error);
    return NextResponse.json({ success: false, error: 'Admin action failed.' }, { status: 500 });
  }
});
