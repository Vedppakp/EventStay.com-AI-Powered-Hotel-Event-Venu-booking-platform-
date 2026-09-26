const express = require('express');
const router = express.Router();
const {
  getOwnerStats,
  getOwnerProperties,
  getOwnerBookings,
  updateBookingStatus,
  getOwnerSecurityStatus,
  registerOwnerProfile,
  verifyOwnerSecurity,
  forgotOwnerPin,
  verifyOwnerResetOtpAndSetPin
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('owner', 'admin'));

// Security & PIN verification endpoints
router.get('/security-status', getOwnerSecurityStatus);
router.post('/register-owner', registerOwnerProfile);
router.post('/verify-security', verifyOwnerSecurity);
router.post('/forgot-pin', forgotOwnerPin);
router.post('/reset-pin-otp', verifyOwnerResetOtpAndSetPin);

// Management endpoints
router.get('/stats', getOwnerStats);
router.get('/properties', getOwnerProperties);
router.get('/bookings', getOwnerBookings);
router.put('/bookings/:id/status', updateBookingStatus);

module.exports = router;
