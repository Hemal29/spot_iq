import React from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import { QRCodeCanvas } from 'qrcode.react';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaTimes, FaEye, FaMoneyBillWave } from 'react-icons/fa';

const statusConfig = {
  upcoming: { bg: 'bg-[#121214]', text: 'text-[#f3e0ae]', dot: 'bg-[#0a0a0b]0' },
  active: { bg: 'bg-[#121214]', text: 'text-[#e7c588]/80', dot: 'bg-[#0a0a0b]0' },
  completed: { bg: 'bg-[#121214]', text: 'text-[#e7c588]/80', dot: 'bg-gray-400' },
  cancelled: { bg: 'bg-[#e7c588]', text: 'text-[#e7c588]', dot: 'bg-[#e7c588]' },
};

const paymentStatusConfig = {
  paid: { bg: 'bg-[#121214]', text: 'text-[#e7c588]/80' },
  pending: { bg: 'bg-[#121214]', text: 'text-[#e7c588]/80' },
  failed: { bg: 'bg-[#e7c588]', text: 'text-[#e7c588]' },
  refunded: { bg: 'bg-[#121214]', text: 'text-[#e7c588]/80' },
};

const BookingCard = ({ booking, onCancel, onUpdate }) => {
  const status = statusConfig[booking.status] || statusConfig.upcoming;
  const paymentStatus = paymentStatusConfig[booking.paymentStatus] || paymentStatusConfig.pending;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(booking._id);
      if (onCancel) onCancel(booking._id);
      if (onUpdate) onUpdate();
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  const qrData = JSON.stringify({
    bookingId: booking._id,
    parkingId: booking.parking?._id,
    vehicleNumber: booking.vehicle?.vehicleNumber || '',
  });

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#f9f0d7] text-sm truncate">
              {booking.parking?.name || booking.parkingName}
            </h4>
            <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 truncate flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="shrink-0" /> {booking.parking?.address || booking.parkingAddress}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className={`${status.bg} ${status.text} text-xs font-medium px-2.5 py-1 rounded-full capitalize`}>
              {booking.status}
            </span>
            <span className={`${paymentStatus.bg} ${paymentStatus.text} text-xs font-medium px-2.5 py-1 rounded-full`}>
              {booking.paymentStatus || 'pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-3">
          <div className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80" /> {booking.startDate}
          </div>
          <div className="flex items-center gap-1.5">
            <FaClock className="text-[#e7c588]/80 dark:text-[#e7c588]/80" /> {booking.startTime} - {booking.endTime}
          </div>
          {booking.vehicle?.vehicleNumber && (
            <div className="flex items-center gap-1.5">
              <FaCar className="text-[#e7c588]/80 dark:text-[#e7c588]/80" /> {booking.vehicle.vehicleNumber}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <FaMoneyBillWave className="text-[#e7c588]/80 dark:text-[#e7c588]/80" /> ${(booking.totalPrice || 0).toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(booking.status === 'upcoming' || booking.status === 'active') && (
            <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] p-1 rounded border border-[#e7c588]/25">
              <QRCodeCanvas value={qrData} size={48} level="M" />
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {booking.status === 'upcoming' && (
              <button onClick={handleCancel} className="flex items-center gap-1 text-xs text-[#e7c588] hover:text-[#e7c588] font-medium px-3 py-1.5 border border-[#e7c588]/40 rounded-lg hover:bg-[#e7c588] transition">
                <FaTimes /> Cancel
              </button>
            )}
            <Link to={`/bookings/${booking._id}`} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 border border-primary-200 rounded-lg hover:bg-primary-50 transition">
              <FaEye /> View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
