const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    bookingType: {
      type: String,
      enum: ['event_package', 'venue_only', 'hotel_stay'],
      default: 'event_package'
    },
    eventType: {
      type: String,
      default: 'Wedding'
    },
    eventDate: {
      type: Date,
      required: true,
      index: true
    },
    checkOutDate: {
      type: Date
    },
    guestsCount: {
      type: Number,
      required: true,
      default: 100
    },
    selectedServices: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'EventService'
        },
        name: String,
        category: String,
        price: Number,
        pricingType: String,
        quantity: {
          type: Number,
          default: 1
        },
        subtotal: Number
      }
    ],
    guestRoomsBooked: [
      {
        unit: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Unit'
        },
        roomName: String,
        roomsCount: {
          type: Number,
          default: 1
        },
        nights: {
          type: Number,
          default: 1
        },
        pricePerNight: Number,
        subtotal: Number
      }
    ],
    pricing: {
      venueBasePrice: {
        type: Number,
        required: true,
        default: 0
      },
      servicesTotal: {
        type: Number,
        default: 0
      },
      roomsTotal: {
        type: Number,
        default: 0
      },
      discountAmount: {
        type: Number,
        default: 0
      },
      taxAmount: {
        type: Number,
        default: 0
      },
      totalAmount: {
        type: Number,
        required: true
      }
    },
    couponApplied: {
      code: String,
      discountPercent: Number,
      discountAmount: Number
    },
    payment: {
      method: {
        type: String,
        default: 'Razorpay / Card'
      },
      transactionId: {
        type: String,
        default: () => 'TXN-' + Math.floor(10000000 + Math.random() * 90000000)
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'paid'
      },
      paidAt: {
        type: Date,
        default: Date.now
      }
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date
    },
    specialRequests: {
      type: String,
      default: ''
    },
    contactDetails: {
      name: String,
      email: String,
      phone: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
