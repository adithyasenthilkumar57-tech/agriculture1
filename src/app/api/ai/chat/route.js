import { NextResponse } from 'next/server';
import { withAuth, withOptionalAuth } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongoose';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';
import Farm from '@/lib/db/models/Farm';
import Crop from '@/lib/db/models/Crop';
import { sendChatMessage, isAIConfigured } from '@/lib/services/ai';

// POST /api/ai/chat
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { message, conversationId, useFarmContext, farmId, cropId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty.' }, { status: 400 });
    }

    await connectDB();

    // 1. Get or create conversation
    let conv;
    if (conversationId) {
      conv = await Conversation.findOne({ _id: conversationId, user: user._id });
    }

    if (!conv) {
      conv = await Conversation.create({
        user: user._id,
        title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        farmContext: { enabled: Boolean(useFarmContext) },
      });
    }

    // 2. Build farm context snapshot if enabled & permitted
    let farmContextSnapshot = null;
    if (useFarmContext) {
      let farmDoc = null;
      let cropDoc = null;

      if (farmId) {
        farmDoc = await Farm.findOne({ _id: farmId, owner: user._id });
      } else {
        farmDoc = await Farm.findOne({ owner: user._id, isActive: true });
      }

      if (cropId) {
        cropDoc = await Crop.findOne({ _id: cropId, owner: user._id });
      } else if (farmDoc) {
        cropDoc = await Crop.findOne({ farm: farmDoc._id, owner: user._id, isActive: true });
      }

      if (farmDoc || cropDoc) {
        farmContextSnapshot = {
          farmName: farmDoc?.name,
          location: farmDoc?.location?.address || farmDoc?.location?.district,
          soilType: farmDoc?.soilType,
          irrigationType: farmDoc?.irrigationType,
          cropName: cropDoc?.name,
          cropVariety: cropDoc?.variety,
          cropStage: cropDoc?.stage,
          plantingDate: cropDoc?.plantingDate ? new Date(cropDoc.plantingDate).toLocaleDateString() : null,
        };
      }
    }

    // 3. Save user's message
    const userMsg = await Message.create({
      conversation: conv._id,
      user: user._id,
      role: 'user',
      content: message.trim(),
    });

    // 4. Retrieve conversation history for context (last 10 messages)
    const history = await Message.find({ conversation: conv._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const formattedMessages = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 5. Call AI service
    const aiResponse = await sendChatMessage({
      messages: formattedMessages,
      farmContext: {
        enabled: Boolean(useFarmContext),
        snapshotData: farmContextSnapshot,
      },
    });

    if (aiResponse.error && !aiResponse.content) {
      // If AI key is not configured or service is temporarily down
      const fallbackMsg = isAIConfigured()
        ? 'AI service is temporarily unavailable. Please try again in a few moments.'
        : 'AI service API key is not configured on this server. Please configure AI_API_KEY in environment variables to enable live AI responses.';

      const assistantMsg = await Message.create({
        conversation: conv._id,
        user: user._id,
        role: 'assistant',
        content: fallbackMsg,
        sourceStatus: 'general_knowledge',
      });

      return NextResponse.json({
        success: true,
        data: {
          conversationId: conv._id,
          message: assistantMsg,
          suggestedActions: [],
          isConfigured: isAIConfigured(),
        },
      });
    }

    // 6. Save assistant message
    const assistantMsg = await Message.create({
      conversation: conv._id,
      user: user._id,
      role: 'assistant',
      content: aiResponse.content,
      suggestedActions: aiResponse.suggestedActions,
      sourceStatus: useFarmContext && farmContextSnapshot ? 'user_data' : 'ai_generated',
    });

    // 7. Update conversation metadata
    await Conversation.findByIdAndUpdate(conv._id, {
      lastMessage: aiResponse.content.slice(0, 100),
      lastMessageAt: new Date(),
      $inc: { messageCount: 2 },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conv._id,
        message: assistantMsg,
        suggestedActions: aiResponse.suggestedActions,
        isConfigured: isAIConfigured(),
      },
    });
  } catch (error) {
    console.error('[AI Chat POST]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process AI chat message.' },
      { status: 500 }
    );
  }
});
