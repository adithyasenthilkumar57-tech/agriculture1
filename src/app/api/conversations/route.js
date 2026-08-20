import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

// GET /api/conversations — list user's conversations
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const conversations = await Conversation.find({ user: user._id, isActive: true })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('[Conversations GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load conversations.' }, { status: 500 });
  }
});

// POST /api/conversations — start a new conversation
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { title, farmContext } = body;

    await connectDB();

    const conversation = await Conversation.create({
      user: user._id,
      title: title?.trim() || 'New Agricultural Conversation',
      farmContext: farmContext || { enabled: false },
    });

    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (error) {
    console.error('[Conversation POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create conversation.' }, { status: 500 });
  }
});
