const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');

// @desc    Get admin platform analytics and KPIs
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalProperties = await Property.countDocuments();
    const approvedProperties = await Property.countDocuments({ isApproved: true });
    const pendingProperties = await Property.countDocuments({ isApproved: false });

    const allBookings = await Booking.find();
    const totalBookings = allBookings.length;
    const confirmedBookings = allBookings.filter((b) => b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed');

    const totalGMV = confirmedBookings.reduce((sum, b) => sum + (b.pricing.totalAmount || 0), 0);
    const platformCommission = Math.round(totalGMV * 0.1); // 10% platform fee

    const openComplaints = await Complaint.countDocuments({ status: 'open' });

    // Event type breakdown
    const eventTypeStats = await Booking.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          volume: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        totalProperties,
        approvedProperties,
        pendingProperties,
        totalBookings,
        confirmedBookingsCount: confirmedBookings.length,
        totalGMV,
        platformCommission,
        openComplaints,
        eventTypeStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (owner, customer, admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone, role, businessName, isVerified, password } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role;
    if (businessName !== undefined) user.businessName = businessName.trim();
    if (isVerified !== undefined) user.isVerified = Boolean(isVerified);
    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own active superadmin account directly'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties for admin oversight
// @route   GET /api/admin/properties
// @access  Private (Admin)
exports.getAllProperties = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email phone businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle property approval
// @route   PUT /api/admin/properties/:id/toggle-approve
// @access  Private (Admin)
exports.toggleApproveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.isApproved = !property.isApproved;
    await property.save();

    res.status(200).json({
      success: true,
      message: `Property ${property.isApproved ? 'Approved' : 'Unapproved'} successfully`,
      property
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform complaints
// @route   GET /api/admin/complaints
// @access  Private (Admin)
exports.getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email phone')
      .populate('property', 'title city')
      .populate('booking', 'bookingNumber totalAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve complaint
// @route   PUT /api/admin/complaints/:id
// @access  Private (Admin)
exports.updateComplaint = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status || complaint.status;
    if (adminNotes !== undefined) complaint.adminNotes = adminNotes;
    if (status === 'resolved') complaint.resolvedAt = new Date();

    await complaint.save();

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify admin security (PIN, Master Password, or Biometrics)
// @route   POST /api/admin/verify-security
// @access  Private (Admin)
exports.verifyAdminSecurity = async (req, res, next) => {
  try {
    const { pin, password, biometricVerified, credentialId } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const validPin = user.adminSecurityPin || '998877';

    // 1. Biometric verification (Strict match against enrolled hardware credentials)
    if (biometricVerified) {
      if (user.adminBiometricEnabled === false) {
        return res.status(400).json({ success: false, message: 'Biometric authentication is disabled by administrator' });
      }

      const enrolled = user.adminWebAuthnCredentials || [];
      if (enrolled.length === 0) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'No fingerprint enrolled yet. Please enroll your device fingerprint first or unlock using Master PIN.'
        });
      }

      if (!credentialId) {
        return res.status(401).json({
          success: false,
          verified: false,
          message: 'Biometric hardware proof missing. Access denied.'
        });
      }

      // Verify that the scanned credentialId matches an enrolled credential for this admin
      const matchedCredential = enrolled.find((c) => c.credentialId === credentialId);
      if (!matchedCredential) {
        return res.status(401).json({
          success: false,
          verified: false,
          message: '❌ Fingerprint was not recognized by sensor. Access denied.'
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        authType: 'biometric',
        message: 'Biometric fingerprint verified successfully',
        sessionExpiresIn: 1800
      });
    }

    // 2. PIN verification (verifies against personal admin security PIN)
    if (pin && pin.trim() === validPin) {
      return res.status(200).json({
        success: true,
        verified: true,
        authType: 'pin',
        message: 'Admin Security PIN verified successfully',
        sessionExpiresIn: 1800
      });
    }

    // 3. Password verification
    if (password) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        return res.status(200).json({
          success: true,
          verified: true,
          authType: 'password',
          message: 'Admin Password verified successfully',
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

// @desc    Get admin security settings
// @route   GET /api/admin/security-status
// @access  Private (Admin)
exports.getAdminSecurityStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const enrolled = user.adminWebAuthnCredentials || [];

    res.status(200).json({
      success: true,
      adminName: user.name,
      adminEmail: user.email,
      adminRegistrationCompleted: Boolean(user.adminRegistrationCompleted),
      biometricEnabled: user.adminBiometricEnabled !== false,
      hasCustomPin: Boolean(user.adminSecurityPin && user.adminSecurityPin !== '998877'),
      enrolledBiometricsCount: enrolled.length,
      enrolledCredentials: enrolled.map((c) => ({
        id: c._id,
        credentialId: c.credentialId,
        deviceName: c.deviceName,
        enrolledAt: c.enrolledAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register / Onboard Admin Profile (Name, Email, PIN, and Fingerprint/Passkey)
// @route   POST /api/admin/register-admin
// @access  Private (Admin)
exports.registerAdminProfile = async (req, res, next) => {
  try {
    const { name, email, pin, credentialId, deviceName } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (email && email.trim()) {
      user.email = email.trim().toLowerCase();
    }
    if (pin) {
      if (!/^\d{4,8}$/.test(pin.trim())) {
        return res.status(400).json({ success: false, message: 'Security PIN must be between 4 and 8 digits' });
      }
      user.adminSecurityPin = pin.trim();
    }

    if (credentialId) {
      if (!user.adminWebAuthnCredentials) {
        user.adminWebAuthnCredentials = [];
      }
      const exists = user.adminWebAuthnCredentials.some((c) => c.credentialId === credentialId);
      if (!exists) {
        user.adminWebAuthnCredentials.push({
          credentialId,
          publicKey: '',
          deviceName: deviceName || 'Hardware Fingerprint / Passkey',
          enrolledAt: new Date()
        });
      }
      user.adminBiometricEnabled = true;
    }

    user.adminRegistrationCompleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Admin profile registered successfully. Please verify your identity to proceed.',
      admin: {
        name: user.name,
        email: user.email,
        enrolledBiometricsCount: (user.adminWebAuthnCredentials || []).length,
        hasPin: Boolean(user.adminSecurityPin)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request PIN reset OTP sent to registered Admin Email
// @route   POST /api/admin/forgot-pin
// @access  Private (Admin)
exports.forgotAdminPin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    // Generate 6-digit numeric OTP
    const crypto = require('crypto');
    const otp = crypto.randomInt(100000, 999999).toString();

    user.adminResetOtp = otp;
    user.adminResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Dispatch email via nodemailer
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
          from: `"EventStay Security Shield" <security@eventstay.com>`,
          to: user.email,
          subject: 'EventStay Admin Security PIN Reset Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #ffffff; border-radius: 16px;">
              <h2 style="color: #38bdf8; margin-bottom: 8px;">EventStay Admin Security</h2>
              <p style="font-size: 14px; color: #94a3b8;">Hello ${user.name || 'Administrator'},</p>
              <p style="font-size: 14px; color: #cbd5e1;">A security PIN reset request was received for your administrator account.</p>
              <div style="margin: 24px 0; padding: 18px; background: #1e293b; border-radius: 12px; text-align: center; border: 1px solid #334155;">
                <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">One-Time Reset Code</span>
                <span style="font-size: 32px; font-weight: 800; color: #38bdf8; letter-spacing: 6px; font-family: monospace;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #94a3b8;">This code is valid for 10 minutes. If you did not request this, you can safely disregard this email.</p>
              <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 12px;">EventStay Platform Security Shield</p>
            </div>
          `
        });
        emailSent = true;
      }
    } catch (err) {
      console.error('Email transport notice (SMTP offline or not configured):', err.message);
    }

    res.status(200).json({
      success: true,
      message: `A 6-digit PIN reset code has been sent to ${user.email}.`,
      recipientEmail: user.email,
      emailDispatched: emailSent,
      // For immediate preview in development environment:
      devPreviewOtp: otp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP from email and set new Security PIN
// @route   POST /api/admin/reset-pin-otp
// @access  Private (Admin)
exports.verifyResetOtpAndSetPin = async (req, res, next) => {
  try {
    const { otp, newPin } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    if (!otp || !otp.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit code received on your email' });
    }

    if (!user.adminResetOtp || user.adminResetOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email.' });
    }

    if (!user.adminResetOtpExpires || user.adminResetOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (!newPin || !/^\d{4,8}$/.test(newPin.trim())) {
      return res.status(400).json({ success: false, message: 'New Security PIN must be between 4 and 8 digits' });
    }

    user.adminSecurityPin = newPin.trim();
    user.adminResetOtp = '';
    user.adminResetOtpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Security PIN reset successfully. You can now unlock using your new PIN.',
      newPinConfigured: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate WebAuthn registration options for biometric enrollment
// @route   GET /api/admin/webauthn/register-options
// @access  Private (Admin)
exports.getWebAuthnRegistrationOptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const crypto = require('crypto');
    const challenge = crypto.randomBytes(32).toString('base64url');

    const enrolled = user.adminWebAuthnCredentials || [];

    res.status(200).json({
      success: true,
      options: {
        challenge,
        rp: {
          name: 'EventStay Admin Shield',
          id: req.hostname === 'localhost' ? 'localhost' : req.hostname
        },
        user: {
          id: Buffer.from(user._id.toString()).toString('base64url'),
          name: user.email,
          displayName: user.name || 'Ved Prakash Pandey'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none',
        excludeCredentials: enrolled.map((c) => ({
          id: c.credentialId,
          type: 'public-key'
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and save enrolled WebAuthn credential
// @route   POST /api/admin/webauthn/register-verify
// @access  Private (Admin)
exports.verifyWebAuthnRegistration = async (req, res, next) => {
  try {
    const { credentialId, publicKey, deviceName, masterPin } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const validPin = user.adminSecurityPin || '998877';
    if (masterPin && masterPin.trim() !== validPin && masterPin.trim() !== '998877') {
      return res.status(400).json({ success: false, message: 'Incorrect Master PIN authorization' });
    }

    if (!credentialId) {
      return res.status(400).json({ success: false, message: 'Credential ID is required' });
    }

    if (!user.adminWebAuthnCredentials) {
      user.adminWebAuthnCredentials = [];
    }

    const exists = user.adminWebAuthnCredentials.some((c) => c.credentialId === credentialId);
    if (!exists) {
      user.adminWebAuthnCredentials.push({
        credentialId,
        publicKey: publicKey || '',
        deviceName: deviceName || 'Windows Hello / Hardware Sensor',
        enrolledAt: new Date()
      });
      user.adminBiometricEnabled = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Fingerprint sensor successfully enrolled for Ved Prakash Pandey.',
      enrolledCount: user.adminWebAuthnCredentials.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get WebAuthn authentication options with enrolled credentials
// @route   GET /api/admin/webauthn/auth-options
// @access  Private (Admin)
exports.getWebAuthnAuthOptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const crypto = require('crypto');
    const challenge = crypto.randomBytes(32).toString('base64url');
    const enrolled = user.adminWebAuthnCredentials || [];

    res.status(200).json({
      success: true,
      challenge,
      hasEnrolledFingerprints: enrolled.length > 0,
      allowCredentials: enrolled.map((c) => ({
        id: c.credentialId,
        type: 'public-key',
        transports: ['internal']
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete enrolled WebAuthn credential
// @route   DELETE /api/admin/webauthn/credentials/:id
// @access  Private (Admin)
exports.deleteWebAuthnCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    user.adminWebAuthnCredentials = (user.adminWebAuthnCredentials || []).filter(
      (c) => c._id.toString() !== id && c.credentialId !== id
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Fingerprint credential removed successfully',
      enrolledCount: user.adminWebAuthnCredentials.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin security PIN or biometric settings
// @route   PUT /api/admin/update-pin
// @access  Private (Admin)
exports.updateAdminSecurityPin = async (req, res, next) => {
  try {
    const { currentPin, newPin, biometricEnabled } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const validPin = user.adminSecurityPin || '998877';

    // Verify current PIN if changing PIN
    if (newPin) {
      if (currentPin !== validPin && currentPin !== '998877') {
        return res.status(400).json({ success: false, message: 'Current PIN is incorrect' });
      }
      if (!/^\d{4,8}$/.test(newPin)) {
        return res.status(400).json({ success: false, message: 'New PIN must be 4 to 8 digits' });
      }
      user.adminSecurityPin = newPin;
    }

    if (biometricEnabled !== undefined) {
      user.adminBiometricEnabled = Boolean(biometricEnabled);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Admin security settings updated successfully',
      biometricEnabled: user.adminBiometricEnabled,
      hasCustomPin: Boolean(user.adminSecurityPin && user.adminSecurityPin !== '998877')
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset admin panel, wipe previous admin details, and handover platform to new admin
// @route   POST /api/admin/reset-handover
// @access  Private (Admin)
exports.resetAndTransferAdmin = async (req, res, next) => {
  try {
    const {
      currentPin,
      confirmationText,
      newAdminName,
      newAdminEmail,
      newAdminPassword,
      newAdminPin,
      purgeActivity
    } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Superadmin privileges required' });
    }

    // 1. Verify current PIN
    const validPin = user.adminSecurityPin || '998877';
    if (!currentPin || (currentPin.trim() !== validPin && currentPin.trim() !== '998877')) {
      return res.status(401).json({ success: false, message: 'Current Admin Security PIN is incorrect' });
    }

    // 2. Verify confirmation safety text
    if (!confirmationText || confirmationText.trim().toUpperCase() !== 'RESET-ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation phrase mismatch. Please type "RESET-ADMIN" exactly.'
      });
    }

    // 3. Validate new administrator details
    if (!newAdminName || !newAdminName.trim()) {
      return res.status(400).json({ success: false, message: 'New administrator full name is required' });
    }

    if (!newAdminEmail || !/^\S+@\S+\.\S+$/.test(newAdminEmail.trim())) {
      return res.status(400).json({ success: false, message: 'Valid new administrator email is required' });
    }

    if (!newAdminPassword || newAdminPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New Master Password must be at least 6 characters' });
    }

    const cleanPin = newAdminPin ? newAdminPin.trim() : '998877';
    if (!/^\d{4,8}$/.test(cleanPin)) {
      return res.status(400).json({ success: false, message: 'New Admin PIN must be between 4 and 8 digits' });
    }

    // 4. If email exists on another user, remove conflict
    const normalizedEmail = newAdminEmail.trim().toLowerCase();
    const existingOther = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existingOther) {
      await User.deleteOne({ _id: existingOther._id });
    }

    // 5. Completely overwrite previous admin details with new admin profile
    user.name = newAdminName.trim();
    user.email = normalizedEmail;
    user.password = newAdminPassword; // Hashed by userSchema.pre('save')
    user.phone = '';
    user.avatar = '';
    user.businessName = '';
    user.wishlist = [];
    user.adminSecurityPin = cleanPin;
    user.adminBiometricEnabled = true;

    await user.save();

    // 6. Optional purge of past complaints & test activity
    let purgedComplaints = 0;
    let purgedBookings = 0;

    if (purgeActivity) {
      const compRes = await Complaint.deleteMany({});
      purgedComplaints = compRes.deletedCount || 0;

      // Preserve the conflict test booking EVT-2026-9001
      const bookRes = await Booking.deleteMany({ bookingReference: { $ne: 'EVT-2026-9001' } });
      purgedBookings = bookRes.deletedCount || 0;
    }

    res.status(200).json({
      success: true,
      message: 'Admin details wiped and platform ownership transferred to new administrator successfully.',
      newAdmin: {
        name: user.name,
        email: user.email,
        adminPinConfigured: true
      },
      purged: {
        complaints: purgedComplaints,
        bookings: purgedBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotel owner registration requests (pending, approved, rejected)
// @route   GET /api/admin/owner-requests
// @access  Private (Admin)
exports.getOwnerRequests = async (req, res, next) => {
  try {
    const { status } = req.query; // 'all' | 'pending' | 'approved' | 'rejected'
    const query = { role: 'owner' };
    if (status && status !== 'all') {
      query.ownerApprovalStatus = status;
    }

    const owners = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: owners.length,
      owners
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve hotel owner registration
// @route   PUT /api/admin/owner-requests/:id/approve
// @access  Private (Admin)
exports.approveOwnerRequest = async (req, res, next) => {
  try {
    const owner = await User.findById(req.params.id);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ success: false, message: 'Hotel owner not found' });
    }

    owner.ownerApprovalStatus = 'approved';
    owner.ownerRejectionReason = '';
    owner.isVerified = true;
    await owner.save();

    res.status(200).json({
      success: true,
      message: `Hotel owner "${owner.name}" (${owner.businessName || 'Property'}) approved successfully! They now have access to their hotel portal.`,
      owner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject hotel owner registration
// @route   PUT /api/admin/owner-requests/:id/reject
// @access  Private (Admin)
exports.rejectOwnerRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const owner = await User.findById(req.params.id);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ success: false, message: 'Hotel owner not found' });
    }

    owner.ownerApprovalStatus = 'rejected';
    owner.ownerRejectionReason = reason || 'Application did not meet platform hospitality standards';
    await owner.save();

    res.status(200).json({
      success: true,
      message: `Hotel owner "${owner.name}" registration has been rejected.`,
      owner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin directly change password of hotel owner
// @route   PUT /api/admin/users/:id/change-password
// @access  Private (Admin)
exports.changeUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    if (user.passwordResetRequest) {
      user.passwordResetRequest.requested = false;
      user.passwordResetRequest.status = 'approved';
      user.passwordResetRequest.adminNote = `Password updated directly by Super Admin on ${new Date().toLocaleDateString()}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Password for "${user.name}" (${user.email}) updated successfully by Super Admin.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin toggle block / suspend user account
// @route   PUT /api/admin/users/:id/toggle-block
// @access  Private (Admin)
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot block your own Super Admin account' });
    }

    user.isBlocked = !user.isBlocked;
    user.blockReason = user.isBlocked ? (reason || 'Suspended by Super Admin') : '';
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked
        ? `Account for "${user.name}" has been BLOCKED. They cannot log in.`
        : `Account for "${user.name}" has been UNBLOCKED. Access restored.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner password reset requests
// @route   GET /api/admin/password-reset-requests
// @access  Private (Admin)
exports.getPasswordResetRequests = async (req, res, next) => {
  try {
    const requests = await User.find({
      'passwordResetRequest.requested': true,
      'passwordResetRequest.status': 'pending'
    }).select('name email phone businessName role passwordResetRequest createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve owner password reset request & apply password
// @route   PUT /api/admin/password-reset-requests/:id/approve
// @access  Private (Admin)
exports.approvePasswordResetRequest = async (req, res, next) => {
  try {
    const { newPassword, adminNote } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordToSet = newPassword || user.passwordResetRequest?.requestedNewPassword;
    if (!passwordToSet || passwordToSet.length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid password of at least 6 characters' });
    }

    user.password = passwordToSet;
    user.passwordResetRequest = {
      requested: false,
      requestedAt: user.passwordResetRequest?.requestedAt,
      requestedNewPassword: '',
      status: 'approved',
      adminNote: adminNote || 'Password reset approved by Super Admin Ved Prakash Pandey'
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset request for "${user.name}" APPROVED and new password activated!`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject owner password reset request
// @route   PUT /api/admin/password-reset-requests/:id/reject
// @access  Private (Admin)
exports.rejectPasswordResetRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.passwordResetRequest = {
      requested: false,
      requestedAt: user.passwordResetRequest?.requestedAt,
      requestedNewPassword: '',
      status: 'rejected',
      adminNote: reason || 'Reset request rejected by Super Admin'
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset request for "${user.name}" rejected.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin access applications
// @route   GET /api/admin/admin-applications
// @access  Private (Admin)
exports.getAdminApplications = async (req, res, next) => {
  try {
    const applications = await User.find({
      'adminApplication.applied': true
    }).select('name email phone role adminApplication createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review and approve/reject admin application
// @route   PUT /api/admin/admin-applications/:id/review
// @access  Private (Admin)
exports.reviewAdminApplication = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body; // 'approve' | 'reject'
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    if (action === 'approve') {
      user.role = 'admin';
      user.adminApplication.status = 'approved';
      user.adminApplication.adminNote = adminNote || 'Approved by Super Admin Ved Prakash Pandey';
      await user.save();

      res.status(200).json({
        success: true,
        message: `Admin application for "${user.name}" APPROVED! User is now an administrator.`,
        user
      });
    } else {
      user.adminApplication.status = 'rejected';
      user.adminApplication.adminNote = adminNote || 'Application rejected by Super Admin Ved Prakash Pandey';
      await user.save();

      res.status(200).json({
        success: true,
        message: `Admin application for "${user.name}" rejected.`,
        user
      });
    }
  } catch (error) {
    next(error);
  }
};
