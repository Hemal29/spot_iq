const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  testEmailSettings,
} = require('../controllers/settingsController');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-email', testEmailSettings);

module.exports = router;
