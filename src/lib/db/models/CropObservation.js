import mongoose from 'mongoose';

const cropObservationSchema = new mongoose.Schema(
  {
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true, index: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    observationDate: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['health_check', 'pest_sighting', 'disease_symptom', 'growth_milestone', 'general', 'weather_damage'],
      default: 'general',
    },
    description: { type: String, required: true },
    symptoms: [String],
    affectedArea: {
      type: String,
      enum: ['isolated', 'scattered', 'widespread', 'entire_field'],
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    images: [String],
    aiAnalysis: {
      performed: { type: Boolean, default: false },
      possibleIssues: [String],
      confidence: String,
      severity: String,
      generalGuidance: [String],
      disclaimer: {
        type: String,
        default: 'AI-assisted screening — not a guaranteed diagnosis. Consult an agriculture expert for confirmation.',
      },
      analyzedAt: Date,
    },
    followUpRequired: { type: Boolean, default: false },
    expertConsultationRequested: { type: Boolean, default: false },
    resolvedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.CropObservation || mongoose.model('CropObservation', cropObservationSchema);
