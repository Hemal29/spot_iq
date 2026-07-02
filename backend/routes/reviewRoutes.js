const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createReview, getParkingReviews, updateReview, deleteReview, approveReview } = require('../controllers/reviewController');

router.get('/parking/:parkingId', getParkingReviews);

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/approve', protect, authorize('admin'), approveReview);

module.exports = router;
