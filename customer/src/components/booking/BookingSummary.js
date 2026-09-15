import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaArrowRight } from 'react-icons/fa';

const BookingSummary = ({ booking, parking, onConfirm, loading }) => {
  const navigate = useNavigate();

  const {
    startDate, startTime, endTime, duration, totalPrice, vehicleId, slot,
  } = booking || {};

  const vehicle = booking?.vehicle || {};

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-[#f9f0d7] mb-4">Booking Summary</h3>

      {parking && (
        <div className="flex items-start gap-3 pb-4 border-b border-[#e7c588]/25">
          <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt className="text-primary-600 text-xl" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#f9f0d7] text-sm">{parking.name}</p>
            <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 truncate">{parking.address}</p>
          </div>
        </div>
      )}

      <div className="space-y-3 py-4 border-b border-[#e7c588]/25">
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Date:</span>
          <span className="text-[#f9f0d7] font-medium ml-auto">{startDate || '-'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaClock className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Time:</span>
          <span className="text-[#f9f0d7] font-medium ml-auto">{startTime} - {endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FaClock className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Duration:</span>
          <span className="text-[#f9f0d7] font-medium ml-auto">{duration} hour{duration !== 1 ? 's' : ''}</span>
        </div>
        {vehicle.vehicleNumber && (
          <div className="flex items-center gap-2 text-sm">
            <FaCar className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Vehicle:</span>
            <span className="text-[#f9f0d7] font-medium ml-auto">{vehicle.vehicleNumber}</span>
          </div>
        )}
        {slot && (
          <div className="flex items-center gap-2 text-sm">
            <FaMapMarkerAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80 w-4" />
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Slot:</span>
            <span className="text-[#f9f0d7] font-medium ml-auto">{slot.label || slot}</span>
          </div>
        )}
      </div>

      <div className="pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Rate</span>
          <span className="text-[#f9f0d7]">${parking?.pricePerHour?.toFixed(2) || '0.00'} / hr</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Hours</span>
          <span className="text-[#f9f0d7]">{duration || 0}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#e7c588]/25">
          <span className="font-semibold text-[#f9f0d7]">Total Amount</span>
          <span className="text-xl font-bold text-primary-600">${totalPrice?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Confirm Booking'}
        {!loading && <FaArrowRight />}
      </button>
    </div>
  );
};

export default BookingSummary;
