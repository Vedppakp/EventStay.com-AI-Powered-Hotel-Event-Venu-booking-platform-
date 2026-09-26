const Booking = require('../models/Booking');

// @desc    Get monthly availability calendar data for a property/unit
// @route   GET /api/availability/:propertyId
// @access  Public
exports.getPropertyAvailability = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { year, month, unitId } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const query = {
      property: propertyId,
      bookingStatus: { $in: ['confirmed', 'pending'] },
      eventDate: { $gte: startDate, $lte: endDate }
    };

    if (unitId) {
      query.unit = unitId;
    }

    const bookings = await Booking.find(query).select('eventDate eventType guestsCount bookingNumber bookingStatus');

    // Generate date map
    const bookedDates = bookings.map((b) => {
      const d = new Date(b.eventDate);
      return {
        dateStr: d.toISOString().split('T')[0],
        eventType: b.eventType,
        guestsCount: b.guestsCount,
        bookingNumber: b.bookingNumber
      };
    });

    res.status(200).json({
      success: true,
      year: currentYear,
      month: currentMonth + 1,
      bookedDates
    });
  } catch (error) {
    next(error);
  }
};
