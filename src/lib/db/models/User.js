import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['farmer', 'transporter', 'buyer', 'expert', 'admin'],
      default: 'farmer',
    },
    preferredLanguage: { type: String, enum: ['en', 'hi', 'ta'], default: 'en' },
    location: {
      address: String,
      district: String,
      state: String,
      country: { type: String, default: 'India' },
      coordinates: {
        lat: Number,
        lon: Number,
      },
    },
    profileImage: String,
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never expose password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
