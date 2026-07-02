import React from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaDownload } from 'react-icons/fa';

const PaymentSuccess = ({ booking, parking }) => {
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">Your booking has been confirmed.</p>
          <Link to="/bookings" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg transition inline-block">
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 animate-slideUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
          <p className="text-gray-500 mt-1">Your booking is confirmed</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
            <QRCodeCanvas value={qrData} size={160} level="H" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
          <h3 className="font-semibold text-gray-800 text-sm">Booking Details</h3>
          {booking.bookingId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24">Booking ID:</span>
              <span className="text-gray-800 font-medium font-mono text-xs">#{booking.bookingId}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <FaMapMarkerAlt className="text-gray-400 w-4" />
            <span className="text-gray-500">Location:</span>
            <span className="text-gray-800 font-medium">{parking?.name || booking.parkingName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaCalendarAlt className="text-gray-400 w-4" />
            <span className="text-gray-500">Date:</span>
            <span className="text-gray-800 font-medium">{booking.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-gray-400 w-4" />
            <span className="text-gray-500">Time:</span>
            <span className="text-gray-800 font-medium">{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaCar className="text-gray-400 w-4" />
            <span className="text-gray-500">Vehicle:</span>
            <span className="text-gray-800 font-medium">{booking?.vehicle?.vehicleNumber || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
            <span className="text-gray-700 font-medium">Amount Paid</span>
            <span className="text-xl font-bold text-primary-600">${(booking.totalPrice || booking.amount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/bookings"
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition text-center text-sm"
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
