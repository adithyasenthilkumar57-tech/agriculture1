import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRequest', required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportOffer', required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    agreedPrice: {
      value: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled_farmer', 'cancelled_transporter', 'completed'],
      default: 'confirmed',
    },
    cancellationReason: String,
    cancelledAt: Date,
    confirmedAt: { type: Date, default: Date.now },
    specialInstructions: String,
  },
  { timestamps: true }
);

bookingSchema.index({ farmer: 1, status: 1 });
bookingSchema.index({ transporter: 1, status: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
