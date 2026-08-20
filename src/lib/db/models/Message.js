import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    images: [String],
    suggestedActions: [
      {
        label: String,
        action: String,
        payload: mongoose.Schema.Types.Mixed,
      },
    ],
    sourceStatus: {
      type: String,
      enum: ['general_knowledge', 'user_data', 'live_api', 'ai_generated'],
    },
    isStreaming: { type: Boolean, default: false },
    tokens: {
      prompt: Number,
      completion: Number,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
