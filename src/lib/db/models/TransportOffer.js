import mongoose from 'mongoose';

const transportOfferSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRequest', required: true, index: true },
    transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    price: {
      value: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      includes: String,
    },
    estimatedPickupTime: Date,
    estimatedDeliveryTime: Date,
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
      default: 'pending',
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

transportOfferSchema.index({ request: 1, status: 1 });
transportOfferSchema.index({ transporter: 1, status: 1 });

export default mongoose.models.TransportOffer || mongoose.model('TransportOffer', transportOfferSchema);
