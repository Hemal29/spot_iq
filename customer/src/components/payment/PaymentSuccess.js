import React from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaDownload } from 'react-icons/fa';

const PaymentSuccess = ({ booking, parking }) => {
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0b]">
        <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FaCheckCircle className="text-primary-400 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#f9f0d7] mb-2">Payment Successful!</h2>
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-6">Your booking has been confirmed.</p>
          <Link to="/bookings" className="bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-semibold px-6 py-2.5 rounded-lg transition inline-block">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const qrData = JSON.stringify({
    bookingId: booking._id,
    parkingId: parking?._id,
    vehicleNumber: booking?.vehicle?.vehicleNumber || '',
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0b]">
      <div className="w-full max-w-lg bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl shadow-xl p-8 animate-slideUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#121214] dark:bg-[#121214] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-primary-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-[#f9f0d7]">Payment Successful!</h2>
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-1">Your booking is confirmed</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] p-3 rounded-xl shadow-md border border-[#e7c588]/25">
            <QRCodeCanvas value={qrData} size={160} level="H" />
          </div>
        </div>

        <div className="bg-[#0a0a0b] dark:bg-[#121214] rounded-xl p-5 space-y-3 mb-6">
          <h3 className="font-semibold text-[#f9f0d7] text-sm">Booking Details</h3>
          {booking.bookingId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 w-24">Booking ID:</span>
              <span className="text-[#f9f0d7] font-medium font-mono text-xs">#{booking.bookingId}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <FaMapMarkerAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Location:</span>
            <span className="text-[#f9f0d7] font-medium">{parking?.name || booking.parkingName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaCalendarAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Date:</span>
            <span className="text-[#f9f0d7] font-medium">{booking.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Time:</span>
            <span className="text-[#f9f0d7] font-medium">{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaCar className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Vehicle:</span>
            <span className="text-[#f9f0d7] font-medium">{booking?.vehicle?.vehicleNumber || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#e7c588]/25 dark:border-[#e7c588]/25 mt-2">
            <span className="text-[#f3e0ae] dark:text-[#e7c588]/80 font-medium">Amount Paid</span>
            <span className="text-xl font-bold text-primary-600">${(booking.totalPrice || booking.amount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/bookings"
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-semibold py-2.5 rounded-lg transition text-center text-sm"
          >
            View My Bookings
          </Link>
          <button
            onClick={() => {}}
            className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <FaDownload /> Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
