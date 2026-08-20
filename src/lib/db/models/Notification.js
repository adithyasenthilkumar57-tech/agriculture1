import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'transport_offer', 'transport_accepted', 'transport_assigned',
        'trip_update', 'delivery_completed', 'task_reminder', 'weather_alert',
        'ai_suggestion', 'marketplace_inquiry', 'verification_update', 'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    referenceId: mongoose.Schema.Types.ObjectId,
    referenceModel: String,
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
