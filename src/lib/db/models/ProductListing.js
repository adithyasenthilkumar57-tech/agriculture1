import mongoose from 'mongoose';

const productListingSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    title: { type: String, required: true, trim: true },
    cropName: { type: String, required: true },
    variety: String,
    category: {
      type: String,
      enum: ['grain', 'vegetable', 'fruit', 'pulse', 'oilseed', 'fiber', 'spice', 'flower', 'other'],
    },
    quantity: {
      available: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'tonnes', 'bags', 'crates', 'quintals'], default: 'kg' },
    },
    grade: { type: String, enum: ['A', 'B', 'C', 'organic', 'premium', 'standard'] },
    price: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'per_kg' },
      currency: { type: String, default: 'INR' },
      negotiable: { type: Boolean, default: true },
    },
    harvestDate: Date,
    availableFrom: Date,
    availableTill: Date,
    location: {
      address: String,
      district: { type: String, required: true },
      state: { type: String, required: true },
    },
    description: String,
    images: [String],
    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'expired', 'cancelled'],
      default: 'active',
    },
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productListingSchema.index({ farmer: 1, status: 1 });
productListingSchema.index({ category: 1, status: 1 });
productListingSchema.index({ 'location.state': 1, 'location.district': 1, status: 1 });

export default mongoose.models.ProductListing || mongoose.model('ProductListing', productListingSchema);
