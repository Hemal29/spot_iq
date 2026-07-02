const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createBooking, getMyBookings, getBookingById, cancelBooking, getBookingHistory } = require('../controllers/bookingController');
const { bookingValidation } = require('../middleware/validation');

router.use(protect);

router.post('/', bookingValidation, createBooking);
router.get('/', getMyBookings);
router.get('/history', getBookingHistory);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
