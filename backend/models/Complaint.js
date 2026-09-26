const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Billing', 'Service Quality', 'Cancellation/Refund', 'Facility Issue', 'Other'],
      default: 'Service Quality'
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved'],
      default: 'open'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
