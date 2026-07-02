const sendEmail = require('../utils/sendEmail');
const generateQR = require('../utils/generateQR');

const sendBookingConfirmation = async (userEmail, bookingData) => {
  const qrCode = await generateQR(bookingData);

  const message = `
Dear Customer,

Your parking booking has been confirmed!

Booking Details:
- Parking: ${bookingData.parkingName || 'N/A'}
- Address: ${bookingData.address || 'N/A'}
- Date: ${bookingData.startTime ? new Date(bookingData.startTime).toLocaleString() : 'N/A'}
- Duration: ${bookingData.startTime && bookingData.endTime ? `${((new Date(bookingData.endTime) - new Date(bookingData.startTime)) / 3600000).toFixed(1)} hours` : 'N/A'}
- Amount Paid: ₹${bookingData.amount || 'N/A'}
- Booking ID: ${bookingData.id}

Please find your QR code attached for entry.

Thank you for choosing SpotIQ!
`;

  await sendEmail({
    email: userEmail,
    subject: 'Booking Confirmed - SpotIQ',
    message,
  });
};

const sendCancellationConfirmation = async (userEmail, bookingData) => {
  const message = `
Dear Customer,

Your parking booking has been cancelled successfully.

Booking Details:
- Parking: ${bookingData.parkingName || 'N/A'}
- Booking ID: ${bookingData.id}

If you made a payment, a refund will be processed within 5-7 business days.

Thank you,
SpotIQ Team
`;

  await sendEmail({
    email: userEmail,
    subject: 'Booking Cancelled - SpotIQ',
    message,
  });
};

const sendReminder = async (userEmail, bookingData) => {
  const message = `
Dear Customer,

Reminder: Your parking booking starts in 1 hour!

Booking Details:
- Parking: ${bookingData.parkingName || 'N/A'}
- Address: ${bookingData.address || 'N/A'}
- Start Time: ${bookingData.startTime ? new Date(bookingData.startTime).toLocaleString() : 'N/A'}
- Booking ID: ${bookingData.id}

Please arrive on time and have your QR code ready.

Thank you,
SpotIQ Team
`;

  await sendEmail({
    email: userEmail,
    subject: 'Booking Reminder - SpotIQ',
    message,
  });
};

const sendPasswordReset = async (userEmail, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const message = `
Dear User,

You requested a password reset. Please use the link below to reset your password:

${resetUrl}

This link will expire in 10 minutes.

If you did not request this, please ignore this email.

Thank you,
SpotIQ Team
`;

  await sendEmail({
    email: userEmail,
    subject: 'Password Reset - SpotIQ',
    message,
  });
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationConfirmation,
  sendReminder,
  sendPasswordReset,
};
