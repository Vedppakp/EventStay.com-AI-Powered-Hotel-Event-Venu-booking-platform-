const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const EventService = require('../models/EventService');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');

// Helper to check date conflict
const checkDateConflict = async (propertyId, unitId, eventDate, checkOutDate = null, excludeBookingId = null) => {
  const targetDate = new Date(eventDate);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const query = {
    property: propertyId,
    bookingStatus: { $in: ['confirmed', 'pending'] },
    eventDate: { $gte: startOfDay, $lte: endOfDay }
  };

  if (unitId) {
    query.unit = unitId;
  }

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBooking = await Booking.findOne(query);
  return !!existingBooking;
};

// @desc    Check availability for date
// @route   POST /api/bookings/check-availability
// @access  Public
exports.checkAvailability = async (req, res, next) => {
  try {
    const { propertyId, unitId, date } = req.body;

    if (!propertyId || !date) {
      return res.status(400).json({ success: false, message: 'Property ID and Date are required' });
    }

    const isConflict = await checkDateConflict(propertyId, unitId, date);

    res.status(200).json({
      success: true,
      available: !isConflict,
      message: isConflict ? 'This date is already booked or reserved' : 'Date is available for booking'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const {
      propertyId,
      unitId,
      bookingType,
      eventType,
      eventDate,
      checkOutDate,
      guestsCount = 100,
      selectedServices = [],
      guestRoomsBooked = [],
      couponCode,
      paymentMethod = 'UPI / Online',
      specialRequests = '',
      contactDetails
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check availability conflict
    const isConflict = await checkDateConflict(propertyId, unitId, eventDate);
    if (isConflict) {
      return res.status(409).json({
        success: false,
        message: 'The selected date is already booked for this venue. Please pick another date.'
      });
    }

    // Determine Base Venue Price
    let venueBasePrice = property.basePrice;
    if (unitId) {
      const unit = await Unit.findById(unitId);
      if (unit) {
        venueBasePrice = unit.pricePerUnit;
      }
    }

    // Calculate Services Total
    let servicesTotal = 0;
    const validatedServices = [];

    for (const item of selectedServices) {
      const serviceDoc = await EventService.findById(item.serviceId || item.service);
      if (serviceDoc) {
        const qty = item.quantity || 1;
        let itemSubtotal = 0;
        if (serviceDoc.pricingType === 'per_guest') {
          itemSubtotal = serviceDoc.basePrice * Number(guestsCount);
        } else {
          itemSubtotal = serviceDoc.basePrice * qty;
        }

        servicesTotal += itemSubtotal;
        validatedServices.push({
          service: serviceDoc._id,
          name: serviceDoc.name,
          category: serviceDoc.category,
          price: serviceDoc.basePrice,
          pricingType: serviceDoc.pricingType,
          quantity: qty,
          subtotal: itemSubtotal
        });
      }
    }

    // Calculate Guest Rooms Total (if booking hotel rooms for guests alongside venue)
    let roomsTotal = 0;
    const validatedRooms = [];

    for (const r of guestRoomsBooked) {
      const roomUnit = await Unit.findById(r.unitId || r.unit);
      if (roomUnit) {
        const nights = r.nights || 1;
        const count = r.roomsCount || 1;
        const roomSubtotal = roomUnit.pricePerUnit * count * nights;
        roomsTotal += roomSubtotal;

        validatedRooms.push({
          unit: roomUnit._id,
          roomName: roomUnit.name,
          roomsCount: count,
          nights,
          pricePerNight: roomUnit.pricePerUnit,
          subtotal: roomSubtotal
        });
      }
    }

    const subtotal = venueBasePrice + servicesTotal + roomsTotal;

    // Apply Coupon if provided
    let discountAmount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validUntil: { $gte: new Date() }
      });

      if (coupon && subtotal >= coupon.minBookingAmount) {
        const calculatedDiscount = Math.round((subtotal * coupon.discountPercent) / 100);
        discountAmount = Math.min(calculatedDiscount, coupon.maxDiscount);
        couponApplied = {
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          discountAmount
        };
      }
    }

    // 12% GST/Platform Service Tax
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * 0.12);
    const totalAmount = taxableAmount + taxAmount;

    // Unique Booking Reference
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const datePrefix = new Date().getFullYear();
    const bookingNumber = `EVT-${datePrefix}-${randomSuffix}`;

    const booking = await Booking.create({
      bookingNumber,
      user: req.user._id,
      property: property._id,
      unit: unitId || undefined,
      bookingType: bookingType || 'event_package',
      eventType: eventType || 'Wedding',
      eventDate: new Date(eventDate),
      checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
      guestsCount: Number(guestsCount),
      selectedServices: validatedServices,
      guestRoomsBooked: validatedRooms,
      pricing: {
        venueBasePrice,
        servicesTotal,
        roomsTotal,
        discountAmount,
        taxAmount,
        totalAmount
      },
      couponApplied,
      payment: {
        method: paymentMethod,
        transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
        status: 'paid',
        paidAt: new Date()
      },
      bookingStatus: 'confirmed',
      specialRequests,
      contactDetails: contactDetails || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || ''
      }
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title address city images phone policies owner')
      .populate('unit', 'name unitType capacity')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings/my
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property', 'title address city images rating basePrice owner')
      .populate('unit', 'name unitType capacity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details (with invoice receipt)
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title address city state zipCode images phone policies owner location')
      .populate('unit', 'name unitType capacity pricePerUnit')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only booking owner, property owner, or admin can view
    const isCustomer = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'owner';

    if (!isCustomer && !isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date();
    booking.payment.status = 'refunded';

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully and refund initiated',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit review for property/booking
// @route   POST /api/bookings/:id/review
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment, eventType } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ booking: booking._id, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      user: req.user._id,
      property: booking.property,
      booking: booking._id,
      rating: Number(rating),
      comment,
      eventType: eventType || booking.eventType
    });

    // Update property rating
    const allReviews = await Review.find({ property: booking.property });
    const avgRating = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;

    await Property.findByIdAndUpdate(booking.property, {
      rating: Number(avgRating.toFixed(1)),
      numReviews: allReviews.length
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
