const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    maxDiscount: {
      type: Number,
      default: 25000
    },
    minBookingAmount: {
      type: Number,
      default: 10000
    },
    description: {
      type: String,
      default: 'Special event promotion'
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
