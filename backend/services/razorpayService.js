const crypto = require('crypto');

const createOrder = async (amount, currency = 'INR', receipt) => {
  const razorpay = require('../config/razorpay')();
  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt,
  };

  const order = await razorpay.orders.create(options);
  return order;
};

const verifyPayment = (orderId, paymentId, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

const getPaymentById = async (paymentId) => {
  const razorpay = require('../config/razorpay')();
  const payment = await razorpay.payments.fetch(paymentId);
  return payment;
};

module.exports = { createOrder, verifyPayment, getPaymentById };
