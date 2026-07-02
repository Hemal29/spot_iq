import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaChargingStation, FaUmbrella, FaShieldAlt, FaParking, FaMapMarkerAlt } from 'react-icons/fa';

const amenityIcons = {
  evCharging: FaChargingStation,
  covered: FaUmbrella,
  security: FaShieldAlt,
};

const ParkingCard = ({ parking }) => {
  const navigate = useNavigate();
  const {
    _id, name, address, city, pricePerHour, rating, totalSlots,
    availableSlots, images, amenities = [],
  } = parking;

  const availabilityPercent = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;

  return (
    <div
      onClick={() => navigate(`/parking/${_id}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group hover:-translate-y-1"
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <FaParking className="text-primary-500 text-5xl" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-primary-600 font-bold">${pricePerHour}/hr</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
            <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="text-gray-400 shrink-0" /> {address}
            </p>
            <p className="text-xs text-gray-400">{city}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} className={star <= Math.round(rating || 0) ? 'text-yellow-400' : 'text-gray-200'} size={14} />
            ))}
          </div>
          <span className="text-sm text-gray-500">({rating || 0})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {amenities.includes('evCharging') && <FaChargingStation className="text-green-600" title="EV Charging" />}
            {amenities.includes('covered') && <FaUmbrella className="text-primary-600" title="Covered" />}
            {amenities.includes('security') && <FaShieldAlt className="text-primary-600" title="Security" />}
            {amenities.length === 0 && <span className="text-xs text-gray-400">No amenities listed</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${availableSlots > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-xs font-medium ${availableSlots > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {availableSlots > 0 ? `${availableSlots} spots` : 'Full'}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/parking/${_id}`); }}
          className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ParkingCard;
