import mongoose from 'mongoose';

const transportRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    cargo: {
      category: {
        type: String,
        enum: ['crops', 'vegetables', 'fruits', 'grains', 'seeds', 'fertilizers',
               'equipment', 'milk', 'flowers', 'animal_feed', 'other'],
        required: true,
      },
      name: { type: String, required: true },
      quantity: {
        value: { type: Number, required: true },
        unit: { type: String, enum: ['kg', 'tonnes', 'bags', 'crates', 'litres', 'custom'], default: 'kg' },
      },
      requiresRefrigeration: { type: Boolean, default: false },
      handlingNotes: String,
    },
    pickup: {
      address: { type: String, required: true },
      village: String,
      district: String,
      state: String,
      coordinates: { lat: Number, lon: Number },
      contactName: String,
      contactPhone: String,
    },
    destination: {
      type: { type: String, enum: ['market', 'mandi', 'buyer', 'warehouse', 'cold_storage', 'processing', 'collection_center', 'farm', 'other'] },
      name: String,
      address: { type: String, required: true },
      district: String,
      state: String,
      coordinates: { lat: Number, lon: Number },
      contactName: String,
      contactPhone: String,
    },
    preferredDate: { type: Date, required: true },
    preferredTime: String,
    preferredVehicleType: {
      type: String,
      enum: ['tractor', 'tractor_trolley', 'mini_truck', 'pickup', 'lcv', 'medium_truck', 'large_truck', 'refrigerated', 'any'],
      default: 'any',
    },
    estimatedDistance: { value: Number, unit: { type: String, default: 'km' } },
    estimatedCost: {
      value: Number,
      currency: { type: String, default: 'INR' },
      note: { type: String, default: 'Estimated — final price determined by transporter offer.' },
    },
    status: {
      type: String,
      enum: ['open', 'offers_received', 'accepted', 'cancelled', 'completed'],
      default: 'open',
    },
    acceptedOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportOffer' },
    isSharedTransport: { type: Boolean, default: false },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TransportRequest' }],
    aiAssisted: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

transportRequestSchema.index({ requester: 1, status: 1 });
transportRequestSchema.index({ status: 1, preferredDate: 1 });
transportRequestSchema.index({ 'pickup.district': 1, 'destination.district': 1 });

export default mongoose.models.TransportRequest || mongoose.model('TransportRequest', transportRequestSchema);
