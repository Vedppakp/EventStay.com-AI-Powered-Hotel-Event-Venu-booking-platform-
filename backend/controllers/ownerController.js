const Property = require('../models/Property');
const Unit = require('../models/Unit');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get owner analytics and dashboard overview
// @route   GET /api/owner/stats
// @access  Private (Owner/Admin)
exports.getOwnerStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // Find all properties of this owner
    const properties = await Property.find({ owner: ownerId });
    const propertyIds = properties.map((p) => p._id);

    // Find all bookings for these properties
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property', 'title city')
      .populate('user', 'name email phone')
      .sort({ eventDate: 1 });

    const totalProperties = properties.length;
    const totalBookings = bookings.length;

    const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.pricing.totalAmount || 0), 0);
    const platformCommission = Math.round(totalRevenue * 0.1);
    const netEarnings = totalRevenue - platformCommission;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBookings = bookings.filter(
      (b) => new Date(b.eventDate) >= today && b.bookingStatus !== 'cancelled'
    ).slice(0, 5);

    // Recent 5 bookings
    const recentBookings = [...bookings].reverse().slice(0, 5);

    // Monthly revenue simulation/grouping
    const monthlyRevenue = [
      { month: 'May', revenue: Math.round(totalRevenue * 0.1) },
      { month: 'Jun', revenue: Math.round(totalRevenue * 0.15) },
      { month: 'Jul', revenue: Math.round(totalRevenue * 0.12) },
      { month: 'Aug', revenue: Math.round(totalRevenue * 0.18) },
      { month: 'Sep', revenue: Math.round(totalRevenue * 0.25) },
      { month: 'Oct', revenue: Math.round(totalRevenue * 0.2) }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalProperties,
        totalBookings,
        confirmedCount: confirmedBookings.length,
        totalRevenue,
        platformCommission,
        netEarnings,
        upcomingBookings,
        recentBookings,
        monthlyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties belonging to logged in owner
// @route   GET /api/owner/properties
// @access  Private (Owner/Admin)
exports.getOwnerProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });

    // Fetch units for each property
    const propertiesWithUnits = await Promise.all(
      properties.map(async (prop) => {
        const units = await Unit.find({ property: prop._id });
        return {
          ...prop.toObject(),
          units
        };
      })
    );

    res.status(200).json({
      success: true,
      count: propertiesWithUnits.length,
      properties: propertiesWithUnits
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for owner's venues
// @route   GET /api/owner/bookings
// @access  Private (Owner/Admin)
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property', 'title city address images')
      .populate('unit', 'name unitType')
      .populate('user', 'name email phone avatar')
      .sort({ eventDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Accept / Complete / Cancel)
// @route   PUT /api/owner/bookings/:id/status
// @access  Private (Owner/Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('property');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    booking.bookingStatus = status;
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.payment.status = 'refunded';
    }
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner security status
// @route   GET /api/owner/security-status
// @access  Private (Owner/Admin)
exports.getOwnerSecurityStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      ownerName: user.name,
      ownerEmail: user.email,
      businessName: user.businessName || '',
      ownerRegistrationCompleted: Boolean(user.ownerRegistrationCompleted),
      hasCustomPin: Boolean(user.ownerSecurityPin)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register / Setup Owner Security PIN Profile
// @route   POST /api/owner/register-owner
// @access  Private (Owner/Admin)
exports.registerOwnerProfile = async (req, res, next) => {
  try {
    const { name, email, businessName, pin } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Owner privileges required' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (email && email.trim()) {
      user.email = email.trim().toLowerCase();
    }
    if (businessName !== undefined) {
      user.businessName = businessName.trim();
    }
    if (pin) {
      if (!/^\d{4,8}$/.test(pin.trim())) {
        return res.status(400).json({ success: false, message: 'Security PIN must be between 4 and 8 digits' });
      }
      user.ownerSecurityPin = pin.trim();
    }

    user.ownerRegistrationCompleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Owner profile registered successfully. Please verify your PIN to proceed.',
      owner: {
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        hasPin: Boolean(user.ownerSecurityPin)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Owner Security PIN or Password
// @route   POST /api/owner/verify-security
// @access  Private (Owner/Admin)
exports.verifyOwnerSecurity = async (req, res, next) => {
  try {
    const { pin, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Owner privileges required' });
    }

    const validPin = user.ownerSecurityPin;

    // 1. PIN verification
    if (validPin && pin && pin.trim() === validPin) {
      return res.status(200).json({
        success: true,
        verified: true,
        authType: 'pin',
        message: 'Owner Security PIN verified successfully',
        sessionExpiresIn: 1800
      });
    }

    // 2. Password verification fallback
    if (password) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        return res.status(200).json({
          success: true,
          verified: true,
          authType: 'password',
          message: 'Owner Password verified successfully',
          sessionExpiresIn: 1800
        });
      }
    }

    return res.status(401).json({
      success: false,
      verified: false,
      message: 'Invalid security PIN or password'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request Owner PIN reset OTP sent to registered Host Email
// @route   POST /api/owner/forgot-pin
// @access  Private (Owner/Admin)
exports.forgotOwnerPin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Owner privileges required' });
    }

    const crypto = require('crypto');
    const otp = crypto.randomInt(100000, 999999).toString();

    user.ownerResetOtp = otp;
    user.ownerResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    let emailSent = false;
    try {
      const nodemailer = require('nodemailer');
      let transporter;
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        const testAccount = await nodemailer.createTestAccount().catch(() => null);
        if (testAccount) {
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
        }
      }

      if (transporter) {
        await transporter.sendMail({
          from: `"EventStay Host Shield" <security@eventstay.com>`,
          to: user.email,
          subject: 'EventStay Host Security PIN Reset Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #ffffff; border-radius: 16px;">
              <h2 style="color: #818cf8; margin-bottom: 8px;">EventStay Venue Host Security</h2>
              <p style="font-size: 14px; color: #94a3b8;">Hello ${user.name || 'Venue Host'},</p>
              <p style="font-size: 14px; color: #cbd5e1;">A security PIN reset request was received for your host management account.</p>
              <div style="margin: 24px 0; padding: 18px; background: #1e293b; border-radius: 12px; text-align: center; border: 1px solid #334155;">
                <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">One-Time Reset Code</span>
                <span style="font-size: 32px; font-weight: 800; color: #818cf8; letter-spacing: 6px; font-family: monospace;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #94a3b8;">This code is valid for 10 minutes. If you did not request this, you can safely disregard this email.</p>
              <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 12px;">EventStay Platform Security Shield</p>
            </div>
          `
        });
        emailSent = true;
      }
    } catch (err) {
      console.error('Host email transport notice (SMTP offline or not configured):', err.message);
    }

    res.status(200).json({
      success: true,
      message: `A 6-digit PIN reset code has been sent to ${user.email}.`,
      recipientEmail: user.email,
      emailDispatched: emailSent,
      devPreviewOtp: otp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP from email and set new Owner Security PIN
// @route   POST /api/owner/reset-pin-otp
// @access  Private (Owner/Admin)
exports.verifyOwnerResetOtpAndSetPin = async (req, res, next) => {
  try {
    const { otp, newPin } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Owner privileges required' });
    }

    if (!otp || !user.ownerResetOtp || user.ownerResetOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    if (user.ownerResetOtpExpires && new Date() > new Date(user.ownerResetOtpExpires)) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new code.' });
    }

    if (!newPin || !/^\d{4,8}$/.test(newPin.trim())) {
      return res.status(400).json({ success: false, message: 'New Security PIN must be 4 to 8 digits' });
    }

    user.ownerSecurityPin = newPin.trim();
    user.ownerRegistrationCompleted = true;
    user.ownerResetOtp = '';
    user.ownerResetOtpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Host Security PIN reset successfully. You can now unlock using your new PIN.',
      newPinConfigured: true
    });
  } catch (error) {
    next(error);
  }
};
