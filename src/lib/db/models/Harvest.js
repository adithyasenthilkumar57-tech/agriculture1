import mongoose from 'mongoose';

const harvestSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
    harvestDate: { type: Date, required: true },
    quantity: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'tonnes', 'quintals', 'bags'], default: 'kg' },
    },
    grade: { type: String, enum: ['A', 'B', 'C', 'mixed'] },
    storageLocation: String,
    soldQuantity: { type: Number, default: 0 },
    revenueReceived: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    notes: String,
    images: [String],
  },
  { timestamps: true }
);

harvestSchema.index({ owner: 1, crop: 1 });

export default mongoose.models.Harvest || mongoose.model('Harvest', harvestSchema);
