import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Conversation' },
    farmContext: {
      enabled: { type: Boolean, default: false },
      farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
      crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
      snapshotData: mongoose.Schema.Types.Mixed,
    },
    messageCount: { type: Number, default: 0 },
    lastMessage: String,
    lastMessageAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, isActive: 1, updatedAt: -1 });

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
