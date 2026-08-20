import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    localName: String,
    variety: String,
    category: {
      type: String,
      enum: ['grain', 'vegetable', 'fruit', 'pulse', 'oilseed', 'fiber', 'spice', 'flower', 'fodder', 'other'],
    },
    plantingDate: Date,
    expectedHarvestDate: Date,
    actualHarvestDate: Date,
    stage: {
      type: String,
      enum: ['planning', 'planting', 'growth', 'flowering', 'fruiting', 'harvest', 'post_harvest'],
      default: 'planning',
    },
    cultivationMethod: {
      type: String,
      enum: ['conventional', 'organic', 'natural_farming', 'integrated', 'hydroponics', 'other'],
    },
    fieldArea: {
      value: Number,
      unit: { type: String, enum: ['acres', 'hectares', 'bigha', 'square_meters'], default: 'acres' },
    },
    estimatedYield: {
      value: Number,
      unit: { type: String, default: 'kg' },
    },
    actualYield: {
      value: Number,
      unit: { type: String, default: 'kg' },
    },
    seedSource: String,
    seedTreatment: String,
    notes: String,
    images: [String],
    isActive: { type: Boolean, default: true },
    season: { type: String, enum: ['kharif', 'rabi', 'zaid', 'perennial', 'other'] },
  },
  { timestamps: true }
);

cropSchema.index({ farm: 1, isActive: 1 });
cropSchema.index({ owner: 1, stage: 1 });

export default mongoose.models.Crop || mongoose.model('Crop', cropSchema);
