import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaParking, FaMapMarkerAlt, FaWalking, FaChargingStation, FaUmbrella, FaShieldAlt, FaClock, FaArrowRight } from 'react-icons/fa';

const ParkingResultCard = ({ parking }) => {
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    _id, parkingName = 'Unnamed Parking', name, address, city,
    pricePerHour = 0, rating = 0, totalSlots = 0, availableSlots = 0,
    images, amenities = [], latitude, longitude,
  } = parking;

  const displayName = parkingName || name;
  const availabilityPercent = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;
  const walkingTime = Math.floor(Math.random() * 8) + 2;

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/parking/${_id}`);
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/booking/${_id}`);
  };

  return (
    <div
      onClick={() => navigate(`/parking/${_id}`)}
      className="group cursor-pointer bg-[#1E293B] border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {images && images.length > 0 ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                <FaParking className="text-gray-600 text-4xl" />
              </div>
            )}
            <img
              src={images[0]}
              alt={displayName}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-gray-900">
            <FaParking className="text-orange-400/30 text-6xl" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl">
          <span className="text-white font-bold text-sm">₹{pricePerHour}</span>
          <span className="text-gray-400 text-xs">/hr</span>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); setFavorited(!favorited); }}
          className="absolute top-3 left-3 w-9 h-9 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          {favorited ? (
            <FaHeart className="text-red-400 transition-all duration-300 scale-110" />
          ) : (
            <FaRegHeart className="text-gray-300" />
          )}
        </button>

        {/* Availability bar */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 font-medium">{availableSlots} / {totalSlots} available</span>
            <span className={availabilityPercent > 30 ? 'text-green-400' : 'text-orange-400'}>
              {availabilityPercent}%
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${availabilityPercent > 50 ? 'bg-green-500' : availabilityPercent > 20 ? 'bg-orange-500' : 'bg-red-500'}`}
              style={{ width: `${availabilityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name + Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors truncate">{displayName}</h3>
          <div className="flex items-center gap-1 text-yellow-400 text-sm ml-2 flex-shrink-0">
            <FaStar />
            <span className="text-white font-medium">{rating || '—'}</span>
          </div>
        </div>

        {/* Address */}
        <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-3">
          <FaMapMarkerAlt className="text-orange-400/70 flex-shrink-0" />
          <span className="truncate">{address || 'Ahmedabad'}</span>
          {city && <span className="text-gray-600">· {city}</span>}
        </p>

        {/* Quick info chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 bg-white/5 rounded-full text-gray-400 flex items-center gap-1">
            <FaWalking className="text-green-400" /> {walkingTime} min
          </span>
          {amenities?.includes('evCharging') && (
            <span className="text-xs px-2.5 py-1 bg-green-500/10 rounded-full text-green-400 flex items-center gap-1">
              <FaChargingStation /> EV
            </span>
          )}
          {amenities?.includes('covered') && (
            <span className="text-xs px-2.5 py-1 bg-blue-500/10 rounded-full text-blue-400 flex items-center gap-1">
              <FaUmbrella /> Covered
            </span>
          )}
          {amenities?.includes('cctv') && (
            <span className="text-xs px-2.5 py-1 bg-purple-500/10 rounded-full text-purple-400 flex items-center gap-1">
              <FaShieldAlt /> CCTV
            </span>
          )}
          <span className="text-xs px-2.5 py-1 bg-orange-500/10 rounded-full text-orange-400 flex items-center gap-1">
            <FaClock /> 24/7
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-all"
          >
            View Details
          </button>
          <button
            onClick={handleBookNow}
            className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1"
          >
            Book Now <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkingResultCard;
