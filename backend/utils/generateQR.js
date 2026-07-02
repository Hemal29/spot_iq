const QRCode = require('qrcode');

const generateQR = async (bookingData) => {
  const qrData = JSON.stringify({ bookingId: bookingData.id });
  const dataUrl = await QRCode.toDataURL(qrData);
  return dataUrl;
};

module.exports = generateQR;
