import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    status: {
      type: String,
      enum: [
        'booking_confirmed',
        'transporter_assigned',
        'en_route_to_farm',
        'pickup_completed',
        'in_transit',
        'arrived',
        'delivery_completed',
      ],
      default: 'booking_confirmed',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    gpsTracking: {
      isEnabled: { type: Boolean, default: false },
      lastLocation: {
        lat: Number,
        lon: Number,
        updatedAt: Date,
      },
    },
    actualPickupTime: Date,
    actualDeliveryTime: Date,
    deliveryProofImage: String,
    receiverName: String,
    receiverSignature: String,
    notes: String,
  },
  { timestamps: true }
);

tripSchema.index({ farmer: 1, status: 1 });
tripSchema.index({ transporter: 1, status: 1 });

export default mongoose.models.Trip || mongoose.model('Trip', tripSchema);
