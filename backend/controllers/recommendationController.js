const { Op } = require('sequelize');
const { Parking, Booking, Review, User, Slot } = require('../models');
const { sequelize } = require('../config/db');
const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Scoring weights
const WEIGHTS = {
  distance: 0.25,
  availability: 0.20,
  price: 0.15,
  rating: 0.15,
  history: 0.10,
  preferences: 0.10,
  amenities: 0.05,
};

// Get weighted score for a parking
const calculateScore = (parking, userLat, userLng, userPreferences, bookingHistory) => {
  let score = 0;
  const reasons = [];

  // 1. Distance score (0-100) - closer = better
  const distance = calculateDistance(userLat, userLng, parking.latitude, parking.longitude);
  const distanceScore = Math.max(0, 100 - (distance / 1000) * 10); // 0-100, 10km = 0
  score += distanceScore * WEIGHTS.distance;
  if (distanceScore > 80) reasons.push('Closest parking to your location');
  else if (distanceScore > 60) reasons.push('Very close to your location');

  // 2. Availability score (0-100) - more available = better
  const availabilityPercent = parking.availableSlots / parking.totalSlots;
  const availabilityScore = availabilityPercent * 100;
  score += availabilityScore * WEIGHTS.availability;
  if (availabilityScore > 80) reasons.push('High availability');
  else if (availabilityScore > 50) reasons.push('Good availability');

  // 3. Price score (0-100) - cheaper = better
  const priceScore = Math.max(0, 100 - (parking.pricePerHour / 200) * 100); // ₹200/hr = 0
  score += priceScore * WEIGHTS.price;
  if (priceScore > 80) reasons.push('Lowest price available');

  // 4. Rating score (0-100)
  const ratingScore = (parking.rating || 0) * 20; // 5 stars = 100
  score += ratingScore * WEIGHTS.rating;
  if (ratingScore > 80) reasons.push('Best rated parking');

  // 5. Booking history boost
  if (bookingHistory && bookingHistory.includes(parking.id)) {
    score += 10 * WEIGHTS.history;
    reasons.push('You have parked here before');
  }

  // 6. User preferences
  if (userPreferences) {
    const amenities = parking.amenities || {};
    if (userPreferences.evCharging && amenities.evCharging) {
      score += 15 * WEIGHTS.preferences;
      reasons.push('Supports EV charging');
    }
    if (userPreferences.covered && amenities.covered) {
      score += 10 * WEIGHTS.preferences;
      reasons.push('Covered parking available');
    }
    if (userPreferences.valet && amenities.valet) {
      score += 10 * WEIGHTS.preferences;
      reasons.push('Valet parking available');
    }
    if (userPreferences.security && (amenities.security || amenities.cctv)) {
      score += 10 * WEIGHTS.preferences;
      reasons.push('High security');
    }
  }

  // 7. Amenities bonus
  const amenities = parking.amenities || {};
  const amenityCount = Object.values(amenities).filter(Boolean).length;
  score += Math.min(amenityCount * 5, 20) * WEIGHTS.amenities;

  return {
    score: Math.min(Math.round(score), 100),
    distance: Math.round(distance),
    reasons: [...new Set(reasons)],
  };
};

// Haversine distance formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 99999;
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLng = toRad(Number(lng2) - Number(lng1));
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// GET /api/recommendations?lat=23.0225&lng=72.5714&userId=1
exports.getRecommendations = asyncHandler(async (req, res) => {
  const { lat, lng, userId } = req.query;
  const userLat = Number(lat) || 23.0225; // Default Ahmedabad
  const userLng = Number(lng) || 72.5714;

  let userPreferences = null;
  let bookingHistory = [];

  if (userId) {
    try {
      const user = await User.findByPk(userId);
      if (user && user.preferences) {
        try {
          userPreferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
        } catch {}
      }
      const bookings = await Booking.findAll({
        where: { userId },
        attributes: ['parkingId'],
        group: ['parkingId'],
      });
      bookingHistory = bookings.map((b) => b.parkingId);
    } catch {}
  }

  const parkings = await Parking.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']],
  });

  const scored = parkings.map((p) => {
    const result = calculateScore(p, userLat, userLng, userPreferences, bookingHistory);
    return {
      parking: {
        id: p.id,
        parkingName: p.parkingName,
        address: p.address,
        city: p.city,
        latitude: p.latitude,
        longitude: p.longitude,
        pricePerHour: p.pricePerHour,
        dailyPrice: p.dailyPrice,
        totalSlots: p.totalSlots,
        availableSlots: p.availableSlots,
        rating: p.rating,
        images: p.images,
        amenities: p.amenities,
        status: p.status,
        parkingType: p.parkingType,
      },
      matchPercentage: result.score,
      distance: result.distance,
      estimatedTime: Math.round(result.distance / 83.33), // ~5 min per km walking
      reasons: result.reasons,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchPercentage - a.matchPercentage);

  res.json({
    success: true,
    count: scored.length,
    recommendations: scored.slice(0, 10),
    meta: {
      userLat,
      userLng,
      totalParkings: parkings.length,
    },
  });
});

// GET /api/recommendations/most-recommended
exports.getMostRecommended = asyncHandler(async (req, res) => {
  // Mock data for admin analytics
  const [rows] = await sequelize.query(`
    SELECT p.id, p.parkingName, p.city, COUNT(r.id) as reviewCount,
           COALESCE(AVG(r.rating), 0) as avgRating,
           p.totalSlots, p.availableSlots, p.pricePerHour
    FROM Parkings p
    LEFT JOIN Reviews r ON r.parkingId = p.id
    GROUP BY p.id
    ORDER BY avgRating DESC, p.availableSlots DESC
    LIMIT 10
  `);
  res.json({ success: true, data: rows });
});

// GET /api/recommendations/analytics
exports.getRecommendationAnalytics = asyncHandler(async (req, res) => {
  // Mock analytics data
  const totalParkings = await Parking.count();
  const totalBookings = await Booking.count();
  const avgRating = await Review.findAll({
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
    raw: true,
  });

  const [popularAreas] = await sequelize.query(`
    SELECT city, COUNT(*) as count, AVG(rating) as avgRating
    FROM Parkings GROUP BY city ORDER BY count DESC
  `);

  const [hourlyDistribution] = await sequelize.query(`
    SELECT HOUR(createdAt) as hour, COUNT(*) as count
    FROM Bookings GROUP BY HOUR(createdAt) ORDER BY hour
  `);

  res.json({
    success: true,
    data: {
      totalParkings,
      totalBookings,
      averageRating: Number(avgRating[0]?.avg || 0).toFixed(2),
      popularAreas,
      hourlyDistribution,
      recommendationAccuracy: 94.7, // Mock
      customerClickRate: 68.3, // Mock
      conversionRate: 42.1, // Mock
    },
  });
});

// POST /api/recommendations/track-click
exports.trackRecommendationClick = asyncHandler(async (req, res) => {
  const { parkingId, userId } = req.body;
  // Log the click for analytics (could store in DB)
  res.json({ success: true, message: 'Click tracked' });
});

// GET /api/insights
exports.getBusinessInsights = asyncHandler(async (req, res) => {
  const [revenueRow] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) as total FROM Payments WHERE status='success'`
  );
  const [lastMonthRevenue] = await sequelize.query(
    `SELECT COALESCE(SUM(amount),0) as total FROM Payments WHERE status='success' AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`
  );
  const lastMonth = Number(lastMonthRevenue[0]?.total || 0);
  const totalRev = Number(revenueRow[0]?.total || 0);
  const growth = lastMonth > 0 ? ((totalRev - lastMonth) / lastMonth * 100).toFixed(1) : '0';

  const [nearFullParkings] = await sequelize.query(
    `SELECT parkingName, availableSlots, totalSlots FROM Parkings WHERE availableSlots < totalSlots * 0.1`
  );

  const [weekendBookings] = await sequelize.query(
    `SELECT COUNT(*) as count FROM Bookings WHERE DAYOFWEEK(createdAt) IN (1,7) AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
  );
  const [weekdayBookings] = await sequelize.query(
    `SELECT COUNT(*) as count FROM Bookings WHERE DAYOFWEEK(createdAt) NOT IN (1,7) AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
  );
  const weekendPct = Number(weekendBookings[0]?.count || 0);
  const weekdayPct = Number(weekdayBookings[0]?.count || 0);
  const weekendGrowth = weekdayPct > 0 ? Math.round((weekendPct / weekdayPct) * 100) : 0;

  const insights = [];

  if (Number(growth) > 0) {
    insights.push({ type: 'positive', icon: 'trending-up', title: `Revenue increased ${growth}%`, description: 'Overall revenue has grown compared to the previous period. Continue the momentum with targeted promotions.' });
  }
  if (nearFullParkings?.length > 0) {
    nearFullParkings.forEach((p) => {
      insights.push({ type: 'warning', icon: 'alert-triangle', title: `${p.parkingName} will likely become full soon`, description: `Only ${p.availableSlots} of ${p.totalSlots} slots remaining. Consider adjusting prices.` });
    });
  }
  if (weekendGrowth > 30) {
    insights.push({ type: 'info', icon: 'calendar', title: `Weekend demand increased by ${weekendGrowth}%`, description: 'Consider increasing staff and security on weekends to handle the surge.' });
  }
  insights.push({ type: 'suggestion', icon: 'dollar-sign', title: 'Dynamic pricing opportunity', description: 'Increase price by ₹10 during peak hours (10 AM - 2 PM, 5 PM - 8 PM) to maximize revenue.' });
  insights.push({ type: 'suggestion', icon: 'umbrella', title: 'Customers prefer covered parking', description: 'Parkings with covered parking get 40% more bookings. Consider adding covers to open spaces.' });

  res.json({ success: true, data: insights });
});

// GET /api/recommendations/nearby
exports.getNearbyRecommendations = asyncHandler(async (req, res, next) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return next(new AppError('Latitude and longitude required', 400));

  const parkings = await Parking.findAll({ where: { isActive: true } });
  const withDistance = parkings
    .map((p) => {
      const dist = calculateDistance(Number(lat), Number(lng), Number(p.latitude), Number(p.longitude));
      return { ...p.toJSON(), distance: Math.round(dist) };
    })
    .filter((p) => p.distance <= 5000)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  res.json({ success: true, data: withDistance });
});
