const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
  getAllParkings,
  getAllBookingsAdmin,
  cancelBookingAdmin,
  getAllPayments,
  getAllReviewsAdmin,
  approveReview,
  deleteReview,
  getRevenueReport,
  getBookingTrends,
  getRevenueByParking,
  getAnalytics,
  getOwners,
  approveOwner,
  rejectOwner,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  getTickets,
  updateTicketStatus,
  assignTicket,
  getReports,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);

router.get('/parkings', getAllParkings);

router.get('/bookings', getAllBookingsAdmin);
router.put('/bookings/:id/cancel', cancelBookingAdmin);

router.get('/payments', getAllPayments);

router.get('/reviews', getAllReviewsAdmin);
router.put('/reviews/:id/approve', approveReview);
router.delete('/reviews/:id', deleteReview);

router.get('/revenue', getRevenueReport);
router.get('/trends', getBookingTrends);
router.get('/revenue/by-parking', getRevenueByParking);

router.get('/analytics', getAnalytics);

router.get('/owners', getOwners);
router.put('/owners/:id/approve', approveOwner);
router.put('/owners/:id/reject', rejectOwner);

router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllRead);
router.delete('/notifications/:id', deleteNotification);

router.get('/tickets', getTickets);
router.put('/tickets/:id/status', updateTicketStatus);
router.put('/tickets/:id/assign', assignTicket);

router.get('/reports', getReports);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
