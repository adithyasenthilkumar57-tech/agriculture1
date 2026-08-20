import mongoose from 'mongoose';

const transportRatingSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    cargoHandling: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.models.TransportRating || mongoose.model('TransportRating', transportRatingSchema);
