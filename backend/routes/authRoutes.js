const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  toggleWishlist,
  demoLogin,
  requestOwnerPasswordReset,
  applyForAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/owner-forgot-password', requestOwnerPasswordReset);
router.post('/apply-admin', applyForAdmin);
router.get('/me', protect, getMe);
router.post('/wishlist/:propertyId', protect, toggleWishlist);

module.exports = router;
