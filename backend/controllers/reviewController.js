const { Op } = require('sequelize');
const { Review, Booking, Parking, User } = require('../models');
const AppError = require('../utils/AppError');
const { sequelize } = require('../config/db');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.createReview = asyncHandler(async (req, res, next) => {
  const { parkingId, bookingId, rating, comment } = req.body;

  if (!parkingId || !rating || !bookingId) {
    return next(
      new AppError('Please provide parkingId, bookingId, and rating', 400)
    );
  }

  const booking = await Booking.findOne({
    where: {
      id: bookingId,
      userId: req.user.id,
      parkingId,
      bookingStatus: { [Op.in]: ['completed', 'active'] },
    },
  });

  if (!booking) {
    return next(
      new AppError(
        'You can only review a parking you have booked and used',
        400
      )
    );
  }

  const existing = await Review.findOne({
    where: { userId: req.user.id, bookingId },
  });
  if (existing) {
    return next(new AppError('You have already reviewed this booking', 400));
  }

  const review = await Review.create({
    userId: req.user.id,
    parkingId,
    bookingId,
    rating,
    comment,
    isApproved: false,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

exports.getParkingReviews = asyncHandler(async (req, res, next) => {
  const { parkingId } = req.params;

  const reviews = await Review.findAll({
    where: { parkingId, isApproved: true },
    include: [
      { model: User, attributes: ['name'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findOne({ where: { id, userId: req.user.id } });
  if (!review) {
    return next(new AppError('Review not found or unauthorized', 404));
  }

  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  res.status(200).json({
    success: true,
    data: review,
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findByPk(id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (
    review.userId !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to delete this review', 403));
  }

  await Review.destroy({ where: { id } });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

exports.approveReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findByPk(id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  review.isApproved = true;
  await review.save();

  const [stats] = await sequelize.query(
    'SELECT AVG(rating) AS averageRating, COUNT(*) AS numReviews FROM Reviews WHERE parkingId = ? AND isApproved = 1',
    { replacements: [review.parkingId] }
  );

  if (stats.length > 0) {
    await Parking.update(
      {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews,
      },
      { where: { id: review.parkingId } }
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});
