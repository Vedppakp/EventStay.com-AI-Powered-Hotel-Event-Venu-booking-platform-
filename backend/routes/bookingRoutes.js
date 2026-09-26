const express = require('express');
const router = express.Router();
const {
  checkAvailability,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  addReview
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/check-availability', checkAvailability);
router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/review', protect, addReview);

module.exports = router;
