const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide unit name (e.g. Grand Banquet Hall)'],
      trim: true
    },
    unitType: {
      type: String,
      enum: ['room', 'banquet_hall', 'lawn', 'conference_room', 'party_hall', 'suite'],
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      default: 100
    },
    pricePerUnit: {
      type: Number,
      required: true
    },
    priceType: {
      type: String,
      enum: ['per_day', 'per_night', 'per_event'],
      default: 'per_day'
    },
    sizeSqFt: {
      type: Number,
      default: 1500
    },
    amenities: [
      {
        type: String
      }
    ],
    images: [
      {
        type: String
      }
    ],
    totalCount: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Unit', unitSchema);
