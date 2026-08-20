import mongoose from 'mongoose';

const farmingTaskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', index: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    title: { type: String, required: true, trim: true },
    description: String,
    category: {
      type: String,
      enum: [
        'irrigation', 'inspection', 'soil_testing', 'pest_monitoring',
        'fertilizer', 'harvest_prep', 'harvesting', 'land_prep',
        'sowing', 'weeding', 'spraying', 'transport', 'maintenance', 'other',
      ],
      default: 'other',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    dueDate: { type: Date, required: true },
    reminderDate: Date,
    completedAt: Date,
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'], default: 'pending' },
    isRecurring: { type: Boolean, default: false },
    recurrence: {
      pattern: { type: String, enum: ['daily', 'weekly', 'fortnightly', 'monthly'] },
      endDate: Date,
    },
    notes: String,
  },
  { timestamps: true }
);

farmingTaskSchema.index({ owner: 1, status: 1, dueDate: 1 });
farmingTaskSchema.index({ farm: 1, status: 1 });

export default mongoose.models.FarmingTask || mongoose.model('FarmingTask', farmingTaskSchema);
