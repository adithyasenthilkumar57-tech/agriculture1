import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    category: {
      type: String,
      enum: ['seeds', 'fertilizer', 'pesticide', 'irrigation', 'labour', 'transport',
             'equipment', 'land_rent', 'storage', 'marketing', 'other'],
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    date: { type: Date, required: true },
    vendor: String,
    receiptImage: String,
    notes: String,
  },
  { timestamps: true }
);

expenseSchema.index({ owner: 1, farm: 1, date: -1 });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
