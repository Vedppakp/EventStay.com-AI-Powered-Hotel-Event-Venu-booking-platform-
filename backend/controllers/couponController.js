const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired promo coupon' });
    }

    const bookingAmount = Number(amount) || 0;
    if (bookingAmount < coupon.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum booking amount of ₹${coupon.minBookingAmount.toLocaleString()}`
      });
    }

    const calculatedDiscount = Math.round((bookingAmount * coupon.discountPercent) / 100);
    const discountAmount = Math.min(calculatedDiscount, coupon.maxDiscount);

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active coupons
// @route   GET /api/coupons
// @access  Public
exports.getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true, validUntil: { $gte: new Date() } });
    res.status(200).json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};
