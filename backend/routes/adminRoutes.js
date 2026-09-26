const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProperties,
  toggleApproveProperty,
  getComplaints,
  updateComplaint,
  verifyAdminSecurity,
  getAdminSecurityStatus,
  updateAdminSecurityPin,
  resetAndTransferAdmin,
  getWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  getWebAuthnAuthOptions,
  deleteWebAuthnCredential,
  registerAdminProfile,
  forgotAdminPin,
  verifyResetOtpAndSetPin,
  getOwnerRequests,
  approveOwnerRequest,
  rejectOwnerRequest,
  changeUserPassword,
  toggleBlockUser,
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  getAdminApplications,
  reviewAdminApplication
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Admin biometric & PIN security gates
router.post('/verify-security', verifyAdminSecurity);
router.get('/security-status', getAdminSecurityStatus);
router.put('/update-pin', updateAdminSecurityPin);
router.post('/reset-handover', resetAndTransferAdmin);

// Admin Onboarding / Registration & Email Forgot PIN
router.post('/register-admin', registerAdminProfile);
router.post('/forgot-pin', forgotAdminPin);
router.post('/reset-pin-otp', verifyResetOtpAndSetPin);

// WebAuthn Biometrics Hardware Enrollment & Authentication
router.get('/webauthn/register-options', getWebAuthnRegistrationOptions);
router.post('/webauthn/register-verify', verifyWebAuthnRegistration);
router.get('/webauthn/auth-options', getWebAuthnAuthOptions);
router.delete('/webauthn/credentials/:id', deleteWebAuthnCredential);

// Hotel Owner Approvals & Management
router.get('/owner-requests', getOwnerRequests);
router.put('/owner-requests/:id/approve', approveOwnerRequest);
router.put('/owner-requests/:id/reject', rejectOwnerRequest);

// User Password & Suspension Management
router.put('/users/:id/change-password', changeUserPassword);
router.put('/users/:id/toggle-block', toggleBlockUser);

// Owner Password Reset Requests
router.get('/password-reset-requests', getPasswordResetRequests);
router.put('/password-reset-requests/:id/approve', approvePasswordResetRequest);
router.put('/password-reset-requests/:id/reject', rejectPasswordResetRequest);

// Admin Access Applications
router.get('/admin-applications', getAdminApplications);
router.put('/admin-applications/:id/review', reviewAdminApplication);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAllProperties);
router.put('/properties/:id/toggle-approve', toggleApproveProperty);
router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaint);

module.exports = router;
