const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT token
const sendTokenResponse = (user, statusCode, res, extraMessage = '') => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'eventstay_super_secret_jwt_key_2026_production_ready',
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    message: extraMessage || 'Authentication successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      businessName: user.businessName || '',
      wishlist: user.wishlist || [],
      ownerApprovalStatus: user.ownerApprovalStatus || 'approved',
      ownerRejectionReason: user.ownerRejectionReason || '',
      isBlocked: Boolean(user.isBlocked),
      passwordResetRequest: user.passwordResetRequest || { status: 'none' }
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, businessName } = req.body;

    // Disallow public admin registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Direct admin registration is disabled. Please submit an Admin Access Application for review by the platform administrator (Ved Prakash Pandey).'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const targetRole = role === 'owner' ? 'owner' : 'customer';
    // If hotel owner, default to pending admin approval
    const ownerApprovalStatus = targetRole === 'owner' ? 'pending' : 'approved';

    const user = await User.create({
      name,
      email,
      password,
      role: targetRole,
      phone: phone || '',
      businessName: businessName || '',
      ownerApprovalStatus
    });

    const msg = targetRole === 'owner'
      ? 'Hotel owner registration submitted! Awaiting Super Admin review & approval.'
      : 'Account created successfully!';

    sendTokenResponse(user, 201, res, msg);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is blocked by admin
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        message: user.blockReason
          ? `Account suspended by platform administrator: ${user.blockReason}`
          : 'Your account has been suspended by the platform administrator (Ved Prakash Pandey). Please contact admin support.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist/:propertyId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.indexOf(propertyId);
    if (index === -1) {
      user.wishlist.push(propertyId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick 1-Click Demo Login
// @route   POST /api/auth/demo-login
// @access  Public
exports.demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body; // 'customer', 'owner', 'admin'
    const targetRole = ['customer', 'owner', 'admin'].includes(role) ? role : 'customer';

    let user = await User.findOne({ role: targetRole });
    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${targetRole} not found` });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit password reset request for hotel owner (requires Admin approval)
// @route   POST /api/auth/owner-forgot-password
// @access  Public
exports.requestOwnerPasswordReset = async (req, res, next) => {
  try {
    const { email, requestedNewPassword, reason } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide registered hotel owner email' });
    }

    const owner = await User.findOne({ email: email.toLowerCase().trim(), role: 'owner' });
    if (!owner) {
      return res.status(404).json({ success: false, message: 'No registered hotel owner found with this email' });
    }

    owner.passwordResetRequest = {
      requested: true,
      requestedAt: new Date(),
      requestedNewPassword: requestedNewPassword || '',
      status: 'pending',
      adminNote: reason || 'Owner requested password reset via login portal'
    };

    await owner.save();

    res.status(200).json({
      success: true,
      message: 'Password reset request submitted! Super Admin (Ved Prakash Pandey) will review and approve your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit application to become platform administrator
// @route   POST /api/auth/apply-admin
// @access  Public
exports.applyForAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, reason } = req.body;

    if (!name || !email || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and reason for admin access application' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      user.adminApplication = {
        applied: true,
        appliedAt: new Date(),
        applicantName: name.trim(),
        applicantEmail: email.toLowerCase().trim(),
        applicantPhone: phone || '',
        reason: reason.trim(),
        status: 'pending',
        adminNote: ''
      };
      await user.save();
    } else {
      await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: 'AdminApplicantTemp123!',
        role: 'customer',
        phone: phone || '',
        adminApplication: {
          applied: true,
          appliedAt: new Date(),
          applicantName: name.trim(),
          applicantEmail: email.toLowerCase().trim(),
          applicantPhone: phone || '',
          reason: reason.trim(),
          status: 'pending',
          adminNote: ''
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin access application submitted successfully! Super Admin (Ved Prakash Pandey) will review your application.'
    });
  } catch (error) {
    next(error);
  }
};
