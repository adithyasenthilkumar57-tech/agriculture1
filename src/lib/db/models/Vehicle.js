import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['tractor', 'tractor_trolley', 'mini_truck', 'pickup', 'lcv', 'medium_truck', 'large_truck', 'refrigerated', 'other'],
      required: true,
    },
    make: String,
    model: String,
    year: Number,
    capacity: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'tonnes', 'bags', 'crates'], default: 'tonnes' },
    },
    isRefrigerated: { type: Boolean, default: false },
    refrigerationTempRange: {
      min: Number,
      max: Number,
      unit: { type: String, default: '°C' },
    },
    features: [String],
    insuranceExpiry: Date,
    fitnessExpiry: Date,
    permitExpiry: Date,
    images: [String],
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    isActive: { type: Boolean, default: true },
    currentLocation: {
      coordinates: { lat: Number, lon: Number },
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ transporter: 1, isActive: 1 });
vehicleSchema.index({ type: 1, verificationStatus: 1 });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
