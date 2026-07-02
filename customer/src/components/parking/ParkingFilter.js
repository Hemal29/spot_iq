import React, { useState, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import { FaSearch, FaSlidersH, FaTimes, FaSortAmountDown } from 'react-icons/fa';

const amenitiesList = [
  { value: 'evCharging', label: 'EV Charging' },
  { value: 'covered', label: 'Covered' },
  { value: 'security', label: 'Security' },
  { value: 'cctv', label: 'CCTV' },
  { value: 'carWash', label: 'Car Wash' },
  { value: 'valet', label: 'Valet' },
];

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
];

const ParkingFilter = () => {
  const { filters, setFilters, clearFilters } = useParking();
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleAmenityToggle = (value) => {
    const updated = localFilters.amenities.includes(value)
      ? localFilters.amenities.filter((a) => a !== value)
      : [...localFilters.amenities, value];
    setLocalFilters({ ...localFilters, amenities: updated });
  };

  const handleApply = () => {
    setFilters(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({ city: '', minPrice: '', maxPrice: '', amenities: [], sortBy: '' });
    clearFilters();
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search by City</label>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Enter city name"
            value={localFilters.city}
            onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number" placeholder="Min" min="0"
            value={localFilters.minPrice}
            onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number" placeholder="Max" min="0"
            value={localFilters.maxPrice}
            onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="space-y-2">
          {amenitiesList.map((item) => (
            <label key={item.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.amenities.includes(item.value)}
                onChange={() => handleAmenityToggle(item.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FaSortAmountDown className="inline mr-1" /> Sort By
        </label>
        <select
          value={localFilters.sortBy}
          onChange={(e) => setLocalFilters({ ...localFilters, sortBy: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-white"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={handleClear} className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
          Clear Filters
        </button>
        <button onClick={handleApply} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium">
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition"
      >
        <FaSlidersH />
      </button>

      <div className="hidden lg:block w-72 shrink-0">
        <div className="bg-white rounded-xl shadow-md p-5 sticky top-24">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          {filterContent}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 animate-slideUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
};

export default ParkingFilter;
