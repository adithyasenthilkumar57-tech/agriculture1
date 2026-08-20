import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Notification from '@/lib/db/models/Notification';

// PUT /api/notifications/[id]/read — mark notification as read
export const PUT = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    if (id === 'all') {
      await Notification.updateMany({ user: user._id, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ success: false, error: 'Notification not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('[Notification Read PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification.' }, { status: 500 });
  }
});
