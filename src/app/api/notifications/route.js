import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Notification from '@/lib/db/models/Notification';

// GET /api/notifications — list current user's notifications
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: user._id, isRead: false });

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error('[Notifications GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load notifications.' }, { status: 500 });
  }
});
