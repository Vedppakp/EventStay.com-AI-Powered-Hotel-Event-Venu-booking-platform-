const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide property title'],
      trim: true
    },
    propertyType: {
      type: String,
      enum: ['hotel', 'venue', 'resort', 'banquet_hall', 'palace', 'conference_center'],
      required: true
    },
    category: {
      type: String,
      enum: ['hotel', 'venue', 'both'],
      default: 'venue'
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    state: {
      type: String,
      default: 'Bihar'
    },
    zipCode: {
      type: String,
      default: ''
    },
    location: {
      lat: {
        type: Number,
        required: true,
        default: 26.7288
      },
      lng: {
        type: Number,
        required: true,
        default: 85.9244
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    basePrice: {
      type: Number,
      required: true,
      default: 50000
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 300
    },
    suitableFor: [
      {
        type: String
      }
    ],
    policies: {
      cancellation: {
        type: String,
        default: 'Free cancellation up to 7 days before event'
      },
      checkIn: {
        type: String,
        default: '12:00 PM'
      },
      checkOut: {
        type: String,
        default: '11:00 AM'
      },
      decorPolicy: {
        type: String,
        default: 'In-house or panel decorators only'
      },
      cateringPolicy: {
        type: String,
        default: 'Vegetarian and non-vegetarian packages available'
      }
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for units / halls / rooms associated with property
propertySchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'property',
  justOne: false
});

module.exports = mongoose.model('Property', propertySchema);
