const mongoose = require('mongoose');

const eventServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide service name'],
      trim: true
    },
    category: {
      type: String,
      enum: ['catering', 'decoration', 'photography', 'music_dj', 'cake', 'makeup', 'lighting', 'invitation'],
      required: true,
      index: true
    },
    providerName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    pricingType: {
      type: String,
      enum: ['per_guest', 'fixed', 'hourly'],
      default: 'fixed'
    },
    basePrice: {
      type: Number,
      required: true
    },
    minGuests: {
      type: Number,
      default: 0
    },
    inclusions: [
      {
        type: String
      }
    ],
    images: [
      {
        type: String
      }
    ],
    rating: {
      type: Number,
      default: 4.8
    },
    numReviews: {
      type: Number,
      default: 0
    },
    city: {
      type: String,
      default: 'Janakpur',
      index: true
    },
    suitableFor: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventService', eventServiceSchema);
