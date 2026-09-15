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
      className="group cursor-pointer bg-[#121214] border border-[#e7c588]/25 rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary-400/30 hover:shadow-2xl hover:shadow-primary-400/10 hover:-translate-y-1 h-full flex flex-col"
    >
      {/* Image */}
      <div className="relative h-36 sm:h-44 xl:h-48 bg-gradient-to-br from-[#121214] to-black overflow-hidden">
        {images && images.length > 0 ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#121214] animate-pulse flex items-center justify-center">
                <FaParking className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-4xl" />
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0a0b]/40 to-black">
            <FaParking className="text-[#e7c588]/30 text-6xl" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-[#0a0a0b]/10  border border-[#e7c588]/25 px-3 py-1.5 rounded-xl">
          <span className="text-[#f9f0d7] font-bold text-sm">₹{pricePerHour}</span>
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-xs">/hr</span>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); setFavorited(!favorited); }}
          className="absolute top-3 left-3 w-9 h-9 bg-[#0a0a0b]/10  border border-[#e7c588]/25 rounded-full flex items-center justify-center hover:bg-[#0a0a0b]/20 transition-all"
        >
          {favorited ? (
            <FaHeart className="text-[#e7c588] transition-all duration-300 scale-110" />
          ) : (
            <FaRegHeart className="text-[#e7c588]/80" />
          )}
        </button>

        {/* Availability bar */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#e7c588]/80 font-medium">{availableSlots} / {totalSlots} available</span>
            <span className={availabilityPercent > 30 ? 'text-primary-400' : 'text-[#e7c588]/80'}>
              {availabilityPercent}%
            </span>
          </div>
          <div className="h-1 bg-[#0a0a0b]/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${availabilityPercent > 50 ? 'bg-[#0a0a0b]0' : availabilityPercent > 20 ? 'bg-[#0a0a0b]0' : 'bg-[#e7c588]'}`}
              style={{ width: `${availabilityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Name + Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-[#f9f0d7] group-hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors truncate">{displayName}</h3>
          <div className="flex items-center gap-1 text-primary-400 text-xs sm:text-sm ml-2 flex-shrink-0">
            <FaStar />
            <span className="text-[#f9f0d7] font-medium">{rating || '—'}</span>
          </div>
        </div>

        {/* Address */}
        <div className="mb-3">
          <p className="text-xs sm:text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-[#e7c588]/70 flex-shrink-0 mt-0.5" />
            <span className="truncate">{address || 'Ahmedabad'}</span>
          </p>
          {city && (
            <p className="text-[11px] sm:text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ml-5 mt-0.5">{city}</p>
          )}
        </div>

        {/* Quick info chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4">
          <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#0a0a0b]/5 rounded-full text-[#e7c588]/80 dark:text-[#e7c588]/80 flex items-center gap-1">
            <FaWalking className="text-primary-400 text-[10px] sm:text-xs" /> {walkingTime} min
          </span>
          {amenities?.includes('evCharging') && (
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#0a0a0b]0/10 rounded-full text-primary-400 flex items-center gap-1">
              <FaChargingStation className="text-[10px] sm:text-xs" /> EV
            </span>
          )}
          {amenities?.includes('covered') && (
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#0a0a0b]0/10 rounded-full text-[#e7c588]/80 dark:text-[#e7c588]/80 flex items-center gap-1">
              <FaUmbrella className="text-[10px] sm:text-xs" /> Covered
            </span>
          )}
          {amenities?.includes('cctv') && (
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#0a0a0b]0/10 rounded-full text-primary-400 flex items-center gap-1">
              <FaShieldAlt className="text-[10px] sm:text-xs" /> CCTV
            </span>
          )}
          <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#0a0a0b]0/10 rounded-full text-[#e7c588]/80 dark:text-[#e7c588]/80 flex items-center gap-1">
            <FaClock className="text-[10px] sm:text-xs" /> 24/7
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={handleViewDetails}
            className="flex-1 py-2 sm:py-2.5 bg-[#0a0a0b]/5 hover:bg-[#0a0a0b]/10 border border-[#e7c588]/25 text-[#e7c588]/80 hover:text-[#f9f0d7] rounded-xl text-xs sm:text-sm font-medium transition-all"
          >
            View Details
          </button>
          <button
            onClick={handleBookNow}
            className="flex-1 py-2 sm:py-2.5 bg-primary-500 hover:bg-primary-600 text-[#f9f0d7] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-primary-400/20 flex items-center justify-center gap-1"
          >
            Book Now <FaArrowRight className="text-[10px] sm:text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkingResultCard;
