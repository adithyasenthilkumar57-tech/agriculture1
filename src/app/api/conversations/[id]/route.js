import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

// GET /api/conversations/[id]
export const GET = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const conversation = await Conversation.findOne({ _id: id, user: user._id, isActive: true }).lean();
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found.' }, { status: 404 });
    }

    const messages = await Message.find({ conversation: id }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: { ...conversation, messages },
    });
  } catch (error) {
    console.error('[Conversation GET by ID]', error);
    return NextResponse.json({ success: false, error: 'Failed to load conversation.' }, { status: 500 });
  }
});

// DELETE /api/conversations/[id]
export const DELETE = withAuth(async (request, context, user) => {
  try {
    const { id } = await context.params;
    await connectDB();

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Conversation deleted.' });
  } catch (error) {
    console.error('[Conversation DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete conversation.' }, { status: 500 });
  }
});
