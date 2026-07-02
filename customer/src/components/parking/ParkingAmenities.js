import React from 'react';
import {
  FaChargingStation, FaUmbrella, FaShieldAlt, FaVideo,
  FaAccessibleIcon, FaTint, FaCar,
} from 'react-icons/fa';

const amenityConfig = [
  { key: 'evCharging', label: 'EV Charging', icon: FaChargingStation },
  { key: 'covered', label: 'Covered', icon: FaUmbrella },
  { key: 'security', label: 'Security', icon: FaShieldAlt },
  { key: 'cctv', label: 'CCTV', icon: FaVideo },
  { key: 'wheelchair', label: 'Wheelchair Accessible', icon: FaAccessibleIcon },
  { key: 'carWash', label: 'Car Wash', icon: FaTint },
  { key: 'valet', label: 'Valet', icon: FaCar },
];

const ParkingAmenities = ({ amenities = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Amenities</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {amenityConfig.map(({ key, label, icon: Icon }) => {
          const available = amenities.includes(key);
          return (
            <div
              key={key}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                available
                  ? 'border-primary-200 bg-primary-50 text-primary-600'
                  : 'border-gray-100 bg-gray-50 text-gray-300'
              }`}
            >
              <Icon className={`text-2xl ${available ? 'text-primary-600' : 'text-gray-300'}`} />
              <span className={`text-xs font-medium text-center ${available ? 'text-primary-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParkingAmenities;
