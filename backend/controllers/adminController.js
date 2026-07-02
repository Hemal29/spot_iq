const { Op } = require('sequelize');
const {
  User, Booking, Parking, Review, Payment, Slot, Vehicle,
  Notification, Coupon, SupportTicket, ParkingOwner,
} = require('../models');
const AppError = require('../utils/AppError');
const { sequelize } = require('../config/db');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginatedResponse = (res, { rows, count }, page, limit) => {
  res.status(200).json({
    success: true,
    count: rows.length,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
    data: rows,
  });
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { isActive: true } });

  const totalBookings = await Booking.count();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const todayBookings = await Booking.count({ where: { createdAt: { [Op.gte]: todayStart } } });
  const monthlyBookings = await Booking.count({ where: { createdAt: { [Op.gte]: monthStart } } });

  const [revenueRow] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM Payments WHERE status='success'`
  );
  const totalRevenue = Number(revenueRow[0]?.total || 0);

  const [monthlyRevenueRow] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM Payments WHERE status='success' AND createdAt >= ?`,
    { replacements: [monthStart] }
  );
  const monthlyRevenue = Number(monthlyRevenueRow[0]?.total || 0);

  const totalParkings = await Parking.count();
  const [slotRow] = await sequelize.query(
    `SELECT COALESCE(SUM(totalSlots),0) AS total, COALESCE(SUM(availableSlots),0) AS available FROM Parkings`
  );
  const totalSlots = Number(slotRow[0]?.total || 0);
  const availableSlots = Number(slotRow[0]?.available || 0);

  const recentBookings = await Booking.findAll({
    include: [
      { model: User, attributes: ['name', 'email'] },
      { model: Parking, attributes: ['parkingName'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  const [topParkings] = await sequelize.query(
    `SELECT p.id, p.parkingName, p.city, COUNT(b.id) AS bookingCount, COALESCE(SUM(b.totalAmount),0) AS revenue
     FROM Parkings p LEFT JOIN Bookings b ON b.parkingId = p.id AND b.paymentStatus='paid'
     GROUP BY p.id ORDER BY revenue DESC LIMIT 5`
  );

  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const [weeklyTrends] = await sequelize.query(
    `SELECT DATE(createdAt) AS date, COUNT(*) AS count
     FROM Bookings WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(createdAt) ORDER BY date`
  );

  res.status(200).json({
    success: true,
    data: {
      users: { total: totalUsers, active: activeUsers },
      bookings: { total: totalBookings, today: todayBookings, monthly: monthlyBookings },
      revenue: { total: totalRevenue, monthly: monthlyRevenue },
      parkings: { total: totalParkings },
      slots: { total: totalSlots, available: availableSlots, occupied: totalSlots - availableSlots },
      recentBookings,
      topParkings,
      weeklyTrends,
    },
  });
});

// ─── Users ────────────────────────────────────────────────────────────────────

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { search } = req.query;

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { include: [
      [sequelize.literal(`(SELECT COUNT(*) FROM Bookings WHERE Bookings.userId = User.id)`), 'bookingCount'],
    ]},
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  paginatedResponse(res, { rows, count }, page, limit);
});

exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  const vehicles = await Vehicle.findAll({ where: { userId: user.id } });

  const bookings = await Booking.findAll({
    where: { userId: user.id },
    include: [{ model: Parking, attributes: ['parkingName', 'city'] }],
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  const [spentRow] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM Payments WHERE userId=? AND status='success'`,
    { replacements: [user.id] }
  );
  const totalSpent = Number(spentRow[0]?.total || 0);

  res.status(200).json({
    success: true,
    data: { ...user.toJSON(), vehicles, bookings, totalSpent },
  });
});

exports.suspendUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  user.isActive = false;
  await user.save();
  res.status(200).json({ success: true, message: 'User suspended successfully', data: user });
});

exports.activateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  user.isActive = true;
  await user.save();
  res.status(200).json({ success: true, message: 'User activated successfully', data: user });
});

// ─── Parkings ─────────────────────────────────────────────────────────────────

exports.getAllParkings = asyncHandler(async (req, res) => {
  const [parkings] = await sequelize.query(
    `SELECT p.*,
            COUNT(DISTINCT b.id) AS bookingCount,
            COALESCE(SUM(CASE WHEN b.paymentStatus='paid' THEN b.totalAmount ELSE 0 END),0) AS revenue
     FROM Parkings p
     LEFT JOIN Bookings b ON b.parkingId = p.id
     GROUP BY p.id
     ORDER BY p.createdAt DESC`
  );

  res.status(200).json({ success: true, count: parkings.length, data: parkings });
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

exports.getAllBookingsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status } = req.query;

  const where = {};
  if (status) where.bookingStatus = status;

  const { count, rows } = await Booking.findAndCountAll({
    where,
    include: [
      { model: User, attributes: ['name', 'email'] },
      { model: Parking, attributes: ['parkingName', 'city'] },
      { model: Slot, attributes: ['slotNumber'] },
      { model: Payment, attributes: ['amount', 'status', 'paymentMethod'] },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  paginatedResponse(res, { rows, count }, page, limit);
});

exports.cancelBookingAdmin = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.bookingStatus === 'cancelled') return next(new AppError('Booking is already cancelled', 400));
  if (booking.bookingStatus === 'completed') return next(new AppError('Cannot cancel a completed booking', 400));

  booking.bookingStatus = 'cancelled';
  await booking.save();

  if (booking.slotId) {
    await Slot.update(
      { status: 'available', currentBooking: null },
      { where: { id: booking.slotId } }
    );
  }

  await Parking.increment('availableSlots', { by: 1, where: { id: booking.parkingId } });

  if (booking.paymentStatus === 'paid') {
    await Payment.update({ status: 'refunded' }, { where: { bookingId: booking.id } });
    booking.paymentStatus = 'refunded';
    await booking.save();
  }

  res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
});

// ─── Payments ─────────────────────────────────────────────────────────────────

exports.getAllPayments = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status, startDate, endDate } = req.query;

  const where = {};
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [
      { model: User, attributes: ['name', 'email'] },
      { model: Booking, attributes: ['bookingStatus', 'totalAmount'] },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  paginatedResponse(res, { rows, count }, page, limit);
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

exports.getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { isApproved } = req.query;

  const where = {};
  if (isApproved !== undefined) where.isApproved = isApproved === 'true';

  const { count, rows } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, attributes: ['name', 'email'] },
      { model: Parking, attributes: ['parkingName'] },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  paginatedResponse(res, { rows, count }, page, limit);
});

exports.approveReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  review.isApproved = true;
  await review.save();

  const [ratingResult] = await sequelize.query(
    `SELECT AVG(rating) as avgRating, COUNT(*) as numReviews FROM Reviews WHERE parkingId = ? AND isApproved = true`,
    { replacements: [review.parkingId] }
  );
  await Parking.update(
    { rating: Number(ratingResult[0].avgRating || 0), numReviews: Number(ratingResult[0].numReviews || 0) },
    { where: { id: review.parkingId } }
  );

  res.status(200).json({ success: true, message: 'Review approved', data: review });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const parkingId = review.parkingId;
  await review.destroy();

  const [ratingResult] = await sequelize.query(
    `SELECT AVG(rating) as avgRating, COUNT(*) as numReviews FROM Reviews WHERE parkingId = ? AND isApproved = true`,
    { replacements: [parkingId] }
  );
  await Parking.update(
    { rating: Number(ratingResult[0].avgRating || 0), numReviews: Number(ratingResult[0].numReviews || 0) },
    { where: { id: parkingId } }
  );

  res.status(200).json({ success: true, message: 'Review deleted' });
});

// ─── Revenue ──────────────────────────────────────────────────────────────────

exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;

  let dateFormat;
  if (period === 'weekly') dateFormat = '%Y-%u';
  else if (period === 'monthly') dateFormat = '%Y-%m';
  else if (period === 'yearly') dateFormat = '%Y';
  else dateFormat = '%Y-%m-%d';

  const [revenue] = await sequelize.query(
    `SELECT DATE_FORMAT(createdAt, '${dateFormat}') AS period,
            SUM(amount) AS totalRevenue,
            COUNT(*) AS count
     FROM Payments WHERE status = 'success'
     GROUP BY period ORDER BY period DESC`
  );

  const totalRevenue = revenue.reduce((s, r) => s + Number(r.totalRevenue || 0), 0);

  res.status(200).json({ success: true, data: { period, totalRevenue, breakdown: revenue } });
});

exports.getBookingTrends = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));

  const [trends] = await sequelize.query(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS date,
            COUNT(*) AS total,
            SUM(CASE WHEN bookingStatus='completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN bookingStatus='cancelled' THEN 1 ELSE 0 END) AS cancelled,
            SUM(CASE WHEN bookingStatus='upcoming' THEN 1 ELSE 0 END) AS upcoming,
            SUM(CASE WHEN bookingStatus='active' THEN 1 ELSE 0 END) AS active
     FROM Bookings WHERE createdAt >= ?
     GROUP BY date ORDER BY date ASC`,
    { replacements: [since] }
  );

  res.status(200).json({
    success: true,
    data: { days: parseInt(days), totalBookings: trends.reduce((s, t) => s + Number(t.total), 0), trends },
  });
});

exports.getRevenueByParking = asyncHandler(async (req, res) => {
  const [data] = await sequelize.query(
    `SELECT p.id, p.parkingName, p.city,
            COUNT(b.id) AS bookingCount,
            COALESCE(SUM(CASE WHEN b.paymentStatus='paid' THEN b.totalAmount ELSE 0 END),0) AS revenue
     FROM Parkings p
     LEFT JOIN Bookings b ON b.parkingId = p.id
     GROUP BY p.id
     ORDER BY revenue DESC`
  );

  res.status(200).json({ success: true, data });
});

// ─── Analytics ────────────────────────────────────────────────────────────────

exports.getAnalytics = asyncHandler(async (req, res) => {
  const [topParkings] = await sequelize.query(
    `SELECT p.id, p.parkingName, p.city, COUNT(b.id) AS bookings,
            COALESCE(SUM(CASE WHEN b.paymentStatus='paid' THEN b.totalAmount ELSE 0 END),0) AS revenue
     FROM Parkings p
     LEFT JOIN Bookings b ON b.parkingId = p.id
     GROUP BY p.id ORDER BY revenue DESC LIMIT 10`
  );

  const [peakHours] = await sequelize.query(
    `SELECT HOUR(startTime) AS hour, COUNT(*) AS count
     FROM Bookings GROUP BY hour ORDER BY count DESC LIMIT 6`
  );

  const [customerGrowth] = await sequelize.query(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month,
            COUNT(*) AS newCustomers
     FROM Users WHERE role='customer'
     GROUP BY month ORDER BY month ASC LIMIT 12`
  );

  const [revenueAnalysis] = await sequelize.query(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month,
            SUM(amount) AS revenue
     FROM Payments WHERE status='success'
     GROUP BY month ORDER BY month ASC LIMIT 12`
  );

  const totalSlots = await Slot.count();
  const bookedSlots = await Slot.count({ where: { status: 'booked' } });
  const maintenanceSlots = await Slot.count({ where: { status: 'maintenance' } });

  res.status(200).json({
    success: true,
    data: {
      topParkings,
      peakHours,
      customerGrowth,
      revenueAnalysis,
      occupancyRate: totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0,
      slotStats: { total: totalSlots, booked: bookedSlots, available: totalSlots - bookedSlots - maintenanceSlots, maintenance: maintenanceSlots },
    },
  });
});

// ─── Parking Owners ───────────────────────────────────────────────────────────

exports.getOwners = asyncHandler(async (req, res) => {
  const [owners] = await sequelize.query(
    `SELECT po.*, u.name AS userName, u.email AS userEmail, u.phone AS userPhone,
            COUNT(p.id) AS parkingCount
     FROM ParkingOwners po
     LEFT JOIN Users u ON u.id = po.userId
     LEFT JOIN Parkings p ON p.userId = po.userId
     GROUP BY po.id
     ORDER BY po.createdAt DESC`
  );

  res.status(200).json({ success: true, count: owners.length, data: owners });
});

exports.approveOwner = asyncHandler(async (req, res, next) => {
  const owner = await ParkingOwner.findByPk(req.params.id);
  if (!owner) return next(new AppError('Parking owner not found', 404));
  owner.isApproved = true;
  await owner.save();
  res.status(200).json({ success: true, message: 'Owner approved', data: owner });
});

exports.rejectOwner = asyncHandler(async (req, res, next) => {
  const owner = await ParkingOwner.findByPk(req.params.id);
  if (!owner) return next(new AppError('Parking owner not found', 404));
  owner.isApproved = false;
  await owner.save();
  res.status(200).json({ success: true, message: 'Owner rejected', data: owner });
});

// ─── Coupons ──────────────────────────────────────────────────────────────────

exports.getCoupons = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { count, rows } = await Coupon.findAndCountAll({
    order: [['createdAt', 'DESC']],
    offset, limit,
  });
  paginatedResponse(res, { rows, count }, page, limit);
});

exports.createCoupon = asyncHandler(async (req, res, next) => {
  const exists = await Coupon.findOne({ where: { code: req.body.code } });
  if (exists) return next(new AppError('Coupon code already exists', 400));
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));
  await coupon.update(req.body);
  res.status(200).json({ success: true, data: coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));
  await coupon.destroy();
  res.status(200).json({ success: true, message: 'Coupon deleted' });
});

// ─── Notifications ────────────────────────────────────────────────────────────

exports.getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.isRead !== undefined) where.isRead = req.query.isRead === 'true';

  const { count, rows } = await Notification.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['name', 'email'] }],
    order: [['createdAt', 'DESC']],
    offset, limit,
  });
  paginatedResponse(res, { rows, count }, page, limit);
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { userId, sendToAll, type, title, message } = req.body;

  if (sendToAll) {
    const users = await User.findAll({ attributes: ['id'] });
    const notifications = users.map((u) => ({
      userId: u.id, type: type || 'system', title, message, sendToAll: true,
    }));
    await Notification.bulkCreate(notifications);
    return res.status(201).json({
      success: true, message: `Notification sent to ${users.length} users`,
    });
  }

  const notification = await Notification.create({ userId, type, title, message });
  res.status(201).json({ success: true, data: notification });
});

exports.markNotificationRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) return next(new AppError('Notification not found', 404));
  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, data: notification });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.update({ isRead: true }, { where: { isRead: false } });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// ─── Support Tickets ──────────────────────────────────────────────────────────

exports.getTickets = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status, priority } = req.query;

  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const { count, rows } = await SupportTicket.findAndCountAll({
    where,
    include: [
      { model: User, as: 'customer', attributes: ['name', 'email'] },
      { model: User, as: 'assignee', attributes: ['name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
    offset, limit,
  });
  paginatedResponse(res, { rows, count }, page, limit);
});

exports.updateTicketStatus = asyncHandler(async (req, res, next) => {
  const { status, resolution } = req.body;
  const ticket = await SupportTicket.findByPk(req.params.id);
  if (!ticket) return next(new AppError('Ticket not found', 404));
  ticket.status = status || ticket.status;
  if (resolution) ticket.resolution = resolution;
  await ticket.save();
  res.status(200).json({ success: true, data: ticket });
});

exports.assignTicket = asyncHandler(async (req, res, next) => {
  const { assignedTo } = req.body;
  const ticket = await SupportTicket.findByPk(req.params.id);
  if (!ticket) return next(new AppError('Ticket not found', 404));
  ticket.assignedTo = assignedTo;
  ticket.status = 'assigned';
  await ticket.save();
  res.status(200).json({ success: true, data: ticket });
});

// ─── Reports ──────────────────────────────────────────────────────────────────

exports.getReports = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || '2000-01-01';
  const end = endDate || '2099-12-31';

  const [bookingsReport] = await sequelize.query(
    `SELECT DATE(createdAt) AS date, COUNT(*) AS total,
            SUM(CASE WHEN bookingStatus='completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN bookingStatus='cancelled' THEN 1 ELSE 0 END) AS cancelled
     FROM Bookings WHERE createdAt BETWEEN ? AND ?
     GROUP BY date ORDER BY date`,
    { replacements: [start, end] }
  );

  const [revenueReport] = await sequelize.query(
    `SELECT DATE(createdAt) AS date, SUM(amount) AS revenue, COUNT(*) AS transactions
     FROM Payments WHERE status='success' AND createdAt BETWEEN ? AND ?
     GROUP BY date ORDER BY date`,
    { replacements: [start, end] }
  );

  const totalCustomers = await User.count({ where: { role: 'customer', createdAt: { [Op.between]: [start, end] } } });
  const totalParkingsCount = await Parking.count();
  const activeParkingsCount = await Parking.count({ where: { isActive: true } });

  res.status(200).json({
    success: true,
    data: {
      bookings: bookingsReport,
      revenue: revenueReport,
      customers: { total: totalCustomers },
      parkings: { total: totalParkingsCount, active: activeParkingsCount },
    },
  });
});

// ─── Admin Profile ────────────────────────────────────────────────────────────

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const user = await User.findByPk(req.user.id);

  if (email && email !== user.email) {
    const exists = await User.findOne({ where: { email } });
    if (exists) return next(new AppError('Email already in use', 400));
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  await user.save();

  res.status(200).json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.scope('withPassword').findByPk(req.user.id);
  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});
