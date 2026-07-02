const { Op } = require('sequelize');
const { Booking, Parking, Slot, Vehicle, Payment, User } = require('../models');
const AppError = require('../utils/AppError');
const generateQR = require('../utils/generateQR');
const {
  sendBookingConfirmation,
  sendCancellationConfirmation,
} = require('../services/emailService');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.createBooking = asyncHandler(async (req, res, next) => {
  const { parkingId, slotId, startTime, endTime, vehicleId, paymentMethod } =
    req.body;

  if (!parkingId || !startTime || !endTime || !vehicleId) {
    return next(
      new AppError(
        'Please provide parkingId, startTime, endTime, and vehicleId',
        400
      )
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return next(new AppError('End time must be after start time', 400));
  }

  if (start < new Date()) {
    return next(new AppError('Start time cannot be in the past', 400));
  }

  const parking = await Parking.findByPk(parkingId);
  if (!parking || !parking.isActive) {
    return next(new AppError('Parking not found or inactive', 404));
  }

  if (parking.availableSlots <= 0) {
    return next(new AppError('No available slots at this parking', 400));
  }

  const vehicle = await Vehicle.findOne({
    where: { id: vehicleId, userId: req.user.id },
  });
  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  let slot = null;
  if (slotId) {
    slot = await Slot.findOne({ where: { id: slotId, parkingId } });
    if (!slot) {
      return next(new AppError('Slot not found for this parking', 404));
    }

    const conflicting = await Booking.findOne({
      where: {
        slotId,
        bookingStatus: { [Op.in]: ['upcoming', 'active'] },
        startTime: { [Op.lt]: end },
        endTime: { [Op.gt]: start },
      },
    });

    if (conflicting) {
      return next(new AppError('Slot is already booked for this time range', 409));
    }
  }

  const hours = Math.ceil((end - start) / (1000 * 60 * 60));
  const totalAmount = hours * Number(parking.pricePerHour);

  const booking = await Booking.create({
    userId: req.user.id,
    parkingId,
    slotId: slot ? slot.id : null,
    vehicleId,
    startTime: start,
    endTime: end,
    totalAmount,
    paymentMethod: paymentMethod || 'razorpay',
    paymentStatus: 'pending',
    bookingStatus: 'upcoming',
  });

  const qrCode = await generateQR(booking);
  booking.qrCode = qrCode;
  await booking.save();

  if (slot) {
    slot.status = 'booked';
    slot.currentBooking = booking.id;
    await slot.save();
  }

  parking.availableSlots = Math.max(0, parking.availableSlots - 1);
  await parking.save();

  try {
    await sendBookingConfirmation(req.user.email, {
      ...booking.toJSON(),
      parkingName: parking.parkingName,
      address: parking.address,
      amount: totalAmount,
    });
  } catch (err) {
  }

  const populated = await Booking.findByPk(booking.id, {
    include: [
      { model: Parking, attributes: ['parkingName', 'address', 'city'] },
      { model: Slot, attributes: ['slotNumber'] },
      { model: Vehicle, attributes: ['vehicleNumber', 'vehicleType'] },
    ],
  });

  res.status(201).json({
    success: true,
    data: populated,
  });
});

exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const where = { userId: req.user.id };
  if (status) {
    where.bookingStatus = status;
  }

  let order = [['createdAt', 'DESC']];
  if (status === 'upcoming') {
    order = [['startTime', 'ASC']];
  }

  const bookings = await Booking.findAll({
    where,
    include: [
      { model: Parking, attributes: ['parkingName', 'address', 'city', 'pricePerHour'] },
      { model: Slot, attributes: ['slotNumber'] },
      { model: Vehicle, attributes: ['vehicleNumber', 'vehicleType'] },
    ],
    order,
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

exports.getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      { model: Parking },
      { model: Slot },
      { model: Vehicle },
    ],
  });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (
    booking.userId !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to view this booking', 403));
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (
    booking.userId !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to cancel this booking', 403));
  }

  if (booking.bookingStatus === 'cancelled') {
    return next(new AppError('Booking is already cancelled', 400));
  }

  if (booking.bookingStatus === 'completed') {
    return next(new AppError('Cannot cancel a completed booking', 400));
  }

  booking.bookingStatus = 'cancelled';
  await booking.save();

  if (booking.slotId) {
    await Slot.update(
      { status: 'available', currentBooking: null },
      { where: { id: booking.slotId } }
    );
  }

  await Parking.increment('availableSlots', {
    by: 1,
    where: { id: booking.parkingId },
  });

  if (booking.paymentStatus === 'paid') {
    await Payment.update(
      { status: 'refunded' },
      { where: { bookingId: booking.id } }
    );

    booking.paymentStatus = 'refunded';
    await booking.save();
  }

  try {
    const parking = await Parking.findByPk(booking.parkingId);
    await sendCancellationConfirmation(req.user.email, {
      ...booking.toJSON(),
      parkingName: parking?.parkingName || 'N/A',
      address: parking?.address || 'N/A',
    });
  } catch (err) {
  }

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking,
  });
});

exports.getBookingHistory = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.findAll({
    where: {
      userId: req.user.id,
      bookingStatus: { [Op.in]: ['completed', 'cancelled'] },
    },
    include: [
      { model: Parking, attributes: ['parkingName', 'address', 'city'] },
      { model: Slot, attributes: ['slotNumber'] },
      { model: Vehicle, attributes: ['vehicleNumber', 'vehicleType'] },
    ],
    order: [['endTime', 'DESC']],
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});
