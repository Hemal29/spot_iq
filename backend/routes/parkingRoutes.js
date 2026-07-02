const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createParking,
  getAllParking,
  getParkingById,
  getNearbyParking,
  updateParking,
  deleteParking,
  uploadImages,
  searchParking,
  getAllParkingsAdmin,
  getParkingReviews,
  updateParkingStatus,
  getParkingSlots,
  getParkingAnalytics,
  getAllAnalytics,
} = require('../controllers/parkingController');

router.get('/analytics', protect, authorize('admin'), getAllAnalytics);
router.get('/', getAllParking);
router.get('/search', searchParking);
router.get('/nearby', getNearbyParking);
router.get('/admin/all', protect, authorize('admin'), getAllParkingsAdmin);
router.get('/:id/analytics', getParkingAnalytics);
router.get('/:id/reviews', getParkingReviews);
router.get('/:id/slots', getParkingSlots);
router.get('/:id', getParkingById);
router.patch('/:id/status', protect, authorize('admin'), updateParkingStatus);

router.post('/', protect, authorize('admin'), createParking);
router.put('/:id', protect, authorize('admin'), updateParking);
router.delete('/:id', protect, authorize('admin'), deleteParking);
router.put('/:id/images', protect, authorize('admin'), upload.array('images', 5), uploadImages);

module.exports = router;
