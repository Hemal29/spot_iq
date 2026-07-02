const { Op } = require('sequelize');
const { Parking, Slot, Booking, Payment, Review, User, Vehicle } = require('../models');
const { sequelize } = require('../config/db');
const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.createParking = asyncHandler(async (req, res, next) => {
  const {
    parkingName, address, city, state, zipCode,
    latitude, longitude, pricePerHour, totalSlots,
    availableSlots, amenities, description, operatingHours,
  } = req.body;

  const images = req.files ? req.files.map((file) => file.path) : [];

  const parking = await Parking.create({
    parkingName, address, city, state, zipCode,
    latitude, longitude, pricePerHour, totalSlots,
    availableSlots: availableSlots ?? totalSlots,
    amenities, images, description, operatingHours,
  });

  res.status(201).json({
    success: true,
    data: parking,
  });
});

exports.getAllParking = asyncHandler(async (req, res, next) => {
  const { city, minPrice, maxPrice, amenities, sort } = req.query;

  const where = { isActive: true };

  if (city) {
    where.city = { [Op.like]: `%${city}%` };
  }

  if (minPrice || maxPrice) {
    where.pricePerHour = {};
    if (minPrice) where.pricePerHour[Op.gte] = Number(minPrice);
    if (maxPrice) where.pricePerHour[Op.lte] = Number(maxPrice);
  }

  let order = [['createdAt', 'DESC']];
  if (sort === 'price_asc') order = [['pricePerHour', 'ASC']];
  else if (sort === 'price_desc') order = [['pricePerHour', 'DESC']];
  else if (sort === 'rating') order = [['rating', 'DESC']];

  let parkings = await Parking.findAll({ where, order });

  if (amenities) {
    const amenityList = amenities.split(',').map((a) => a.trim());
    parkings = parkings.filter((p) => {
      if (!p.amenities) return false;
      return amenityList.every((a) => p.amenities.includes(a));
    });
  }

  res.status(200).json({
    success: true,
    count: parkings.length,
    data: parkings,
  });
});

exports.getParkingById = asyncHandler(async (req, res, next) => {
  const parking = await Parking.findByPk(req.params.id);

  if (!parking) {
    return next(new AppError('Parking not found', 404));
  }

  const bookingCount = await Booking.count({ where: { parkingId: parking.id } });
  const [rev] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) as total FROM Payments WHERE bookingId IN (SELECT id FROM Bookings WHERE parkingId = ?) AND status='success'`,
    { replacements: [parking.id] }
  );

  res.status(200).json({
    success: true,
    data: { ...parking.toJSON(), bookingCount, totalRevenue: Number(rev[0]?.total || 0) },
  });
});

exports.getNearbyParking = asyncHandler(async (req, res, next) => {
  const { lat, lng, maxDistance = 5000 } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }

  const parkings = await Parking.findAll({
    where: {
      isActive: true,
      latitude: { [Op.ne]: null },
      longitude: { [Op.ne]: null },
    },
  });

  const withDistance = parkings
    .map((p) => {
      const R = 6371e3;
      const φ1 = (Number(lat) * Math.PI) / 180;
      const φ2 = (Number(p.latitude) * Math.PI) / 180;
      const Δφ = ((Number(p.latitude) - Number(lat)) * Math.PI) / 180;
      const Δλ = ((Number(p.longitude) - Number(lng)) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return { ...p.toJSON(), distance: R * c };
    })
    .filter((p) => p.distance <= Number(maxDistance))
    .sort((a, b) => a.distance - b.distance);

  res.status(200).json({
    success: true,
    count: withDistance.length,
    data: withDistance,
  });
});

exports.updateParking = asyncHandler(async (req, res, next) => {
  const parking = await Parking.findByPk(req.params.id);

  if (!parking) {
    return next(new AppError('Parking not found', 404));
  }

  Object.assign(parking, req.body);
  await parking.save();

  res.status(200).json({
    success: true,
    data: parking,
  });
});

exports.deleteParking = asyncHandler(async (req, res, next) => {
  const parking = await Parking.findByPk(req.params.id);
  if (!parking) {
    return next(new AppError('Parking not found', 404));
  }

  await Slot.destroy({ where: { parkingId: req.params.id } });
  await Parking.destroy({ where: { id: req.params.id } });

  res.status(200).json({
    success: true,
    message: 'Parking and associated slots deleted successfully',
  });
});

exports.uploadImages = asyncHandler(async (req, res, next) => {
  const parking = await Parking.findByPk(req.params.id);
  if (!parking) {
    return next(new AppError('Parking not found', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  const imagePaths = req.files.map((file) => file.path);
  const currentImages = parking.images || [];
  parking.images = [...currentImages, ...imagePaths];
  await parking.save();

  res.status(200).json({
    success: true,
    data: parking,
  });
});

exports.searchParking = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError('Please provide a search query', 400));
  }

  const parkings = await Parking.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { parkingName: { [Op.like]: `%${q}%` } },
        { city: { [Op.like]: `%${q}%` } },
        { address: { [Op.like]: `%${q}%` } },
      ],
    },
  });

  res.status(200).json({
    success: true,
    count: parkings.length,
    data: parkings,
  });
});

exports.getAllParkingsAdmin = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { search, status, city, sortBy } = req.query;

  const where = {};
  if (search) {
    where[Op.or] = [
      { parkingName: { [Op.like]: `%${search}%` } },
      { city: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } },
      { ownerName: { [Op.like]: `%${search}%` } },
    ];
  }
  if (status) where.status = status;
  if (city) where.city = { [Op.like]: `%${city}%` };

  let order = [['createdAt', 'DESC']];
  if (sortBy === 'name') order = [['parkingName', 'ASC']];
  else if (sortBy === 'revenue') order = [['createdAt', 'DESC']];

  const { count, rows } = await Parking.findAndCountAll({
    where, order, limit, offset,
  });

  const enriched = await Promise.all(rows.map(async (p) => {
    const bookingCount = await Booking.count({ where: { parkingId: p.id } });
    const [rev] = await sequelize.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM Payments WHERE bookingId IN (SELECT id FROM Bookings WHERE parkingId = ?) AND status='success'`,
      { replacements: [p.id] }
    );
    return { ...p.toJSON(), bookingCount, totalRevenue: Number(rev[0]?.total || 0) };
  }));

  res.json({ success: true, count: enriched.length, total: count, page, totalPages: Math.ceil(count / limit), data: enriched });
});

exports.getParkingReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reviews = await Review.findAll({
    where: { parkingId: id },
    include: [{ model: User, attributes: ['name', 'email', 'avatar'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, count: reviews.length, data: reviews });
});

exports.updateParkingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const parking = await Parking.findByPk(id);
  if (!parking) {
    return next(new AppError('Parking not found', 404));
  }
  parking.status = status;
  await parking.save();
  res.json({ success: true, data: parking });
});

exports.getParkingSlots = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const slots = await Slot.findAll({
    where: { parkingId: id },
    order: [['type', 'ASC'], ['slotNumber', 'ASC']],
  });
  const grouped = slots.reduce((acc, slot) => {
    const type = slot.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(slot);
    return acc;
  }, {});
  res.json({ success: true, data: grouped });
});

exports.getParkingAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [revenueData] = await sequelize.query(
    `SELECT DATE(p.createdAt) as date, SUM(p.amount) as revenue
     FROM Payments p
     JOIN Bookings b ON p.bookingId = b.id
     WHERE b.parkingId = ? AND p.status = 'success'
       AND p.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY DATE(p.createdAt) ORDER BY date`,
    { replacements: [id] }
  );

  const [occupancyData] = await sequelize.query(
    `SELECT DATE(b.createdAt) as date,
       COUNT(b.id) as totalBookings,
       ROUND((COUNT(b.id) / NULLIF(p.totalSlots, 0)) * 100, 2) as occupancyRate
     FROM Bookings b
     JOIN Parkings p ON b.parkingId = p.id
     WHERE b.parkingId = ? AND b.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY DATE(b.createdAt), p.totalSlots ORDER BY date`,
    { replacements: [id] }
  );

  const [bookingTrends] = await sequelize.query(
    `SELECT DATE(createdAt) as date, COUNT(*) as count
     FROM Bookings WHERE parkingId = ?
       AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY DATE(createdAt) ORDER BY date`,
    { replacements: [id] }
  );

  const [peakHours] = await sequelize.query(
    `SELECT HOUR(createdAt) as hour, COUNT(*) as count
     FROM Bookings WHERE parkingId = ?
     GROUP BY HOUR(createdAt) ORDER BY hour`,
    { replacements: [id] }
  );

  const [vehicleDist] = await sequelize.query(
    `SELECT v.vehicleType, COUNT(*) as count
     FROM Bookings b
     JOIN Vehicles v ON b.vehicleId = v.id
     WHERE b.parkingId = ?
     GROUP BY v.vehicleType`,
    { replacements: [id] }
  );

  const [monthlyRevenue] = await sequelize.query(
    `SELECT DATE_FORMAT(p.createdAt, '%Y-%m') as month, SUM(p.amount) as revenue
     FROM Payments p
     JOIN Bookings b ON p.bookingId = b.id
     WHERE b.parkingId = ? AND p.status = 'success'
       AND p.createdAt >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(p.createdAt, '%Y-%m') ORDER BY month`,
    { replacements: [id] }
  );

  const [topDays] = await sequelize.query(
    `SELECT DATE(p.createdAt) as date, SUM(p.amount) as revenue
     FROM Payments p
     JOIN Bookings b ON p.bookingId = b.id
     WHERE b.parkingId = ? AND p.status = 'success'
     GROUP BY DATE(p.createdAt) ORDER BY revenue DESC LIMIT 10`,
    { replacements: [id] }
  );

  const [avgStay] = await sequelize.query(
    `SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, startTime, endTime)), 0) as avgStayMinutes
     FROM Bookings WHERE parkingId = ? AND bookingStatus != 'cancelled'`,
    { replacements: [id] }
  );

  const [cancelData] = await sequelize.query(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN bookingStatus = 'cancelled' THEN 1 ELSE 0 END) as cancelled
     FROM Bookings WHERE parkingId = ?`,
    { replacements: [id] }
  );

  const total = Number(cancelData[0]?.total || 0);
  const cancelled = Number(cancelData[0]?.cancelled || 0);

  res.json({
    success: true,
    data: {
      revenueData,
      occupancyData,
      bookingTrends,
      peakHours,
      vehicleDistribution: vehicleDist,
      monthlyRevenue,
      topPerformingDays: topDays,
      averageStayDuration: Number(avgStay[0]?.avgStayMinutes || 0),
      cancellationRate: total > 0 ? Number(((cancelled / total) * 100).toFixed(2)) : 0,
    },
  });
});

exports.getAllAnalytics = asyncHandler(async (req, res) => {
  const [[{ totalRevenue }]] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) as totalRevenue FROM Payments WHERE status='success'`
  );
  const [[{ currentMonthRevenue }]] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) as currentMonthRevenue FROM Payments
     WHERE status='success' AND MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())`
  );
  const [[{ totalBookings }]] = await sequelize.query(
    `SELECT COUNT(*) as totalBookings FROM Bookings`
  );
  const [[{ currentMonthBookings }]] = await sequelize.query(
    `SELECT COUNT(*) as currentMonthBookings FROM Bookings
     WHERE MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())`
  );
  const [[{ todayBookings }]] = await sequelize.query(
    `SELECT COUNT(*) as todayBookings FROM Bookings WHERE DATE(createdAt) = CURDATE()`
  );
  const [[{ activeParkings }]] = await sequelize.query(
    `SELECT COUNT(*) as activeParkings FROM Parkings WHERE isActive = true`
  );
  const [[{ avgOccupancy }]] = await sequelize.query(
    `SELECT COALESCE(ROUND(AVG(occupancyRate), 2), 0) as avgOccupancy FROM
     (SELECT (COUNT(*) / NULLIF(p.totalSlots, 0)) * 100 as occupancyRate
      FROM Bookings b JOIN Parkings p ON b.parkingId = p.id
      WHERE DATE(b.createdAt) = CURDATE() AND b.bookingStatus != 'cancelled'
      GROUP BY b.parkingId, p.totalSlots) sub`
  );

  const [revenueByParking] = await sequelize.query(
    `SELECT park.id, park.parkingName, COALESCE(SUM(pay.amount),0) as revenue
     FROM Parkings park
     LEFT JOIN Bookings b ON b.parkingId = park.id
     LEFT JOIN Payments pay ON pay.bookingId = b.id AND pay.status = 'success'
     GROUP BY park.id, park.parkingName
     ORDER BY revenue DESC LIMIT 10`
  );

  const [monthlyTrends] = await sequelize.query(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month,
       COUNT(*) as bookings,
       COALESCE(SUM(totalAmount),0) as revenue
     FROM Bookings
     WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(createdAt, '%Y-%m') ORDER BY month`
  );

  const [bookingStatusDist] = await sequelize.query(
    `SELECT bookingStatus, COUNT(*) as count FROM Bookings GROUP BY bookingStatus`
  );

  res.json({
    success: true,
    data: {
      totalRevenue: Number(totalRevenue),
      currentMonthRevenue: Number(currentMonthRevenue),
      totalBookings: Number(totalBookings),
      currentMonthBookings: Number(currentMonthBookings),
      todayBookings: Number(todayBookings),
      activeParkings: Number(activeParkings),
      averageOccupancyRate: Number(avgOccupancy),
      revenueByParking,
      monthlyTrends,
      bookingStatusDistribution: bookingStatusDist,
    },
  });
});
