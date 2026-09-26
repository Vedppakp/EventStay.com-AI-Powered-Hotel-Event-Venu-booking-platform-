const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true
    },
    eventType: {
      type: String,
      default: 'General'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
