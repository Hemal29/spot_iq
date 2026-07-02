import React, { useState } from 'react';
import { FaSlidersH, FaTimes, FaCar, FaChargingStation, FaUmbrella, FaShieldAlt, FaClock, FaBuilding, FaTree } from 'react-icons/fa';

const FilterToggle = ({ label, icon: Icon, checked, onChange }) => (
  <label className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
    <span className="flex items-center gap-2.5 text-sm text-gray-300 group-hover:text-white transition-colors">
      {Icon && <Icon className="text-orange-400/70 text-sm" />}
      {label}
    </span>
    <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${checked ? 'bg-orange-500' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </div>
  </label>
);

const FindParkingFilters = ({ filters, setFilters, onClose }) => {
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [distance, setDistance] = useState(5);

  const toggles = [
    { key: 'availableOnly', label: 'Available Only', icon: FaCar },
    { key: 'covered', label: 'Covered Parking', icon: FaUmbrella },
    { key: 'evCharging', label: 'EV Charging', icon: FaChargingStation },
    { key: 'cctv', label: 'CCTV', icon: FaShieldAlt },
    { key: 'valet', label: 'Valet Parking', icon: FaCar },
    { key: '247', label: '24×7 Open', icon: FaClock },
    { key: 'indoor', label: 'Indoor Parking', icon: FaBuilding },
    { key: 'outdoor', label: 'Outdoor Parking', icon: FaTree },
  ];

  const [togglesState, setTogglesState] = useState({});

  const handleToggle = (key) => {
    setTogglesState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FaSlidersH className="text-orange-400 text-sm" />
          <h3 className="text-white font-semibold text-sm">Filters</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FaTimes />
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Price per hour</span>
          <span className="text-sm text-white font-semibold">₹{priceRange[0]} — ₹{priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* Distance */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Distance</span>
          <span className="text-sm text-white font-semibold">{distance} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={distance}
          onChange={(e) => setDistance(parseInt(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-0.5">
        {toggles.map((t) => (
          <FilterToggle
            key={t.key}
            label={t.label}
            icon={t.icon}
            checked={togglesState[t.key] || false}
            onChange={() => handleToggle(t.key)}
          />
        ))}
      </div>

      {/* Apply Button */}
      <button className="w-full mt-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20 text-sm">
        Apply Filters
      </button>
    </div>
  );
};

export default FindParkingFilters;
