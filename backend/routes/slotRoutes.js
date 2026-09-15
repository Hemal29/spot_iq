const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllSlots, getSlotsByParking, getSlotById, getAvailableSlots,
  getSlotStats,
  createSlot, updateSlot, deleteSlot,
  generateSlots, bulkDeleteSlots, bulkUpdateSlots,
} = require('../controllers/slotController');

// Public routes
router.get('/', getAllSlots);
router.get('/stats', getSlotStats);
router.get('/parking/:parkingId', getSlotsByParking);
router.get('/parking/:parkingId/available', getAvailableSlots);
router.get('/:id', getSlotById);

// Admin-only routes
router.post('/bulk/:parkingId', protect, authorize('admin'), generateSlots);
router.post('/', protect, authorize('admin'), createSlot);
router.put('/:id', protect, authorize('admin'), updateSlot);
router.delete('/bulk', protect, authorize('admin'), bulkDeleteSlots);
router.delete('/:id', protect, authorize('admin'), deleteSlot);
router.patch('/bulk', protect, authorize('admin'), bulkUpdateSlots);

module.exports = router;
