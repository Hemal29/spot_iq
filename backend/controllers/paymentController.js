const { Payment, Booking, Parking } = require('../models');
const AppError = require('../utils/AppError');
const razorpayService = require('../services/razorpayService');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.createPaymentOrder = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return next(new AppError('Booking ID is required', 400));
  }

  const booking = await Booking.findOne({
    where: { id: bookingId, userId: req.user.id },
  });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.paymentStatus === 'paid') {
    return next(new AppError('Booking is already paid', 400));
  }

  const existingPayment = await Payment.findOne({
    where: { bookingId, status: 'pending' },
  });
  if (existingPayment) {
    return res.status(200).json({
      success: true,
      data: existingPayment,
    });
  }

  const receipt = `rcpt_${booking.id}_${Date.now()}`;
  const order = await razorpayService.createOrder(
    Number(booking.totalAmount),
    'INR',
    receipt
  );

  const payment = await Payment.create({
    bookingId,
    userId: req.user.id,
    amount: booking.totalAmount,
    paymentMethod: 'razorpay',
    razorpayOrderId: order.id,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      paymentId: payment.id,
    },
  });
});

exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return next(
      new AppError(
        'Please provide orderId, paymentId, and signature',
        400
      )
    );
  }

  const isValid = razorpayService.verifyPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    await Payment.update(
      { status: 'failed' },
      { where: { razorpayOrderId } }
    );

    return next(new AppError('Payment verification failed', 400));
  }

  const [affected] = await Payment.update(
    {
      razorpayPaymentId,
      status: 'success',
      transactionId: razorpayPaymentId,
    },
    { where: { razorpayOrderId } }
  );

  if (affected === 0) {
    return next(new AppError('Payment record not found', 404));
  }

  const payment = await Payment.findOne({ where: { razorpayOrderId } });

  await Booking.update(
    { paymentStatus: 'paid' },
    { where: { id: payment.bookingId } }
  );

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: payment,
  });
});

exports.getMyPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Booking,
        attributes: ['parkingId', 'startTime', 'endTime', 'totalAmount', 'bookingStatus'],
        include: [
          { model: Parking, attributes: ['parkingName'] },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
});

exports.getAllPayments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { count, rows: payments } = await Payment.findAndCountAll({
    include: [
      { model: require('../models').User, attributes: ['name', 'email'] },
      {
        model: Booking,
        attributes: ['parkingId', 'startTime', 'endTime', 'totalAmount', 'bookingStatus'],
      },
    ],
    order: [['createdAt', 'DESC']],
    offset: skip,
    limit,
  });

  res.status(200).json({
    success: true,
    count: payments.length,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
    data: payments,
  });
});
