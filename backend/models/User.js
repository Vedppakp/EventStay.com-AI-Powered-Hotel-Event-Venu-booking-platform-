const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      default: 'customer'
    },
    phone: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
      }
    ],
    businessName: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    adminSecurityPin: {
      type: String,
      default: '998877'
    },
    adminBiometricEnabled: {
      type: Boolean,
      default: true
    },
    adminWebAuthnCredentials: [
      {
        credentialId: { type: String, required: true },
        publicKey: { type: String, default: '' },
        deviceName: { type: String, default: 'Platform Biometric Sensor' },
        enrolledAt: { type: Date, default: Date.now }
      }
    ],
    adminResetOtp: {
      type: String,
      default: ''
    },
    adminResetOtpExpires: {
      type: Date
    },
    adminRegistrationCompleted: {
      type: Boolean,
      default: false
    },
    ownerSecurityPin: {
      type: String,
      default: ''
    },
    ownerRegistrationCompleted: {
      type: Boolean,
      default: false
    },
    ownerResetOtp: {
      type: String,
      default: ''
    },
    ownerResetOtpExpires: {
      type: Date
    },
    ownerApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    ownerRejectionReason: {
      type: String,
      default: ''
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockReason: {
      type: String,
      default: ''
    },
    passwordResetRequest: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      requestedNewPassword: { type: String, default: '' },
      status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
      adminNote: { type: String, default: '' }
    },
    adminApplication: {
      applied: { type: Boolean, default: false },
      appliedAt: { type: Date },
      applicantName: { type: String, default: '' },
      applicantEmail: { type: String, default: '' },
      applicantPhone: { type: String, default: '' },
      reason: { type: String, default: '' },
      status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
      adminNote: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
