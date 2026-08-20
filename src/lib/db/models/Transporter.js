import mongoose from 'mongoose';

const transporterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: String,
    operatingAreas: [
      {
        state: String,
        districts: [String],
      },
    ],
    serviceRadius: { value: Number, unit: { type: String, default: 'km' } },
    specializations: [
      {
        type: String,
        enum: ['crops', 'vegetables', 'fruits', 'grains', 'seeds', 'fertilizers',
               'equipment', 'milk', 'flowers', 'cold_chain', 'general'],
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: [
      {
        type: { type: String },
        fileUrl: String,
        uploadedAt: Date,
      },
    ],
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    isAvailable: { type: Boolean, default: true },
    averageRating: { type: Number, min: 0, max: 5, default: null },
    totalTrips: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    description: String,
    yearsOfExperience: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Transporter || mongoose.model('Transporter', transporterSchema);
