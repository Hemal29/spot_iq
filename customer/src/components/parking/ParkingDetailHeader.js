import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaClock, FaChevronLeft, FaChevronRight, FaParking } from 'react-icons/fa';

const ParkingDetailHeader = ({ parking }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const {
    name, address, city, pricePerHour, rating, images = [],
    operatingHours, availableSlots, totalSlots,
  } = parking || {};

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-64 md:h-96 bg-gray-200">
        {images.length > 0 ? (
          <>
            <img src={images[currentImage]} alt={name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition">
                  <FaChevronLeft className="text-gray-700" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition">
                  <FaChevronRight className="text-gray-700" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition ${i === currentImage ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <FaParking className="text-primary-500 text-6xl" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium shadow ${
            availableSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {availableSlots > 0 ? `${availableSlots} spots available` : 'Fully booked'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{name}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-1">
              <FaMapMarkerAlt className="text-gray-400" /> {address}, {city}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className={star <= Math.round(rating || 0) ? 'text-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({rating || 0})</span>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end gap-2">
            <span className="text-3xl font-bold text-primary-600">${pricePerHour}</span>
            <span className="text-sm text-gray-500">per hour</span>
          </div>
        </div>

        {operatingHours && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <FaClock className="text-primary-500" />
              <span className="text-sm font-medium">Operating Hours:</span>
              <span className="text-sm text-gray-500">{operatingHours}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingDetailHeader;
