const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createSlots, getSlotsByParking, getAvailableSlots, updateSlot, deleteSlot } = require('../controllers/slotController');

router.get('/parking/:parkingId', getSlotsByParking);
router.get('/parking/:parkingId/available', getAvailableSlots);

router.post('/bulk/:parkingId', protect, authorize('admin'), createSlots);
router.put('/:id', protect, authorize('admin'), updateSlot);
router.delete('/:id', protect, authorize('admin'), deleteSlot);

module.exports = router;
