import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    location: {
      address: { type: String, required: true },
      village: String,
      district: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lon: Number,
      },
    },
    size: {
      value: { type: Number },
      unit: { type: String, enum: ['acres', 'hectares', 'bigha', 'guntha', 'square_meters'], default: 'acres' },
    },
    soilType: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'silt', 'clay_loam', 'sandy_loam', 'silty_clay', 'other'],
    },
    irrigationType: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'furrow', 'rain_fed', 'canal', 'borewell', 'other'],
    },
    waterAvailability: {
      type: String,
      enum: ['abundant', 'adequate', 'limited', 'scarce', 'seasonal'],
    },
    description: String,
    images: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

farmSchema.index({ owner: 1, isActive: 1 });
farmSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.models.Farm || mongoose.model('Farm', farmSchema);
