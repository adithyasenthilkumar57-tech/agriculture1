import mongoose from 'mongoose';

const soilRecordSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testDate: Date,
    testLab: String,
    reportFile: String,
    ph: { type: Number, min: 0, max: 14 },
    nitrogen: { value: Number, unit: { type: String, default: 'kg/ha' } },
    phosphorus: { value: Number, unit: { type: String, default: 'kg/ha' } },
    potassium: { value: Number, unit: { type: String, default: 'kg/ha' } },
    organicMatter: { value: Number, unit: { type: String, default: '%' } },
    moisture: { value: Number, unit: { type: String, default: '%' } },
    electricalConductivity: { value: Number, unit: { type: String, default: 'dS/m' } },
    soilTexture: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'silt', 'clay_loam', 'sandy_loam', 'silty_clay', 'other'],
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.SoilRecord || mongoose.model('SoilRecord', soilRecordSchema);
