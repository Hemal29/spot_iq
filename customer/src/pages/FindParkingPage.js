import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FindParkingHero from '../components/parking/FindParkingHero';
import FindParkingFilters from '../components/parking/FindParkingFilters';
import ParkingResultCard from '../components/parking/ParkingResultCard';
import FindParkingExtras from '../components/parking/FindParkingExtras';
import { FaFilter, FaTimes, FaSortAmountDown, FaMapMarkedAlt, FaThList, FaTh, FaCar, FaSearch, FaSpinner } from 'react-icons/fa';

const MOCK_PARKINGS = [
  {
    _id: '1', parkingName: 'SG Highway Smart Parking', address: 'SG Highway, Near Palladium Mall', city: 'Ahmedabad',
    pricePerHour: 40, rating: 4.5, totalSlots: 120, availableSlots: 45, images: [],
    amenities: ['covered', 'cctv', 'evCharging'], latitude: 23.0225, longitude: 72.5714,
  },
  {
    _id: '2', parkingName: 'CG Road Premium Lot', address: 'CG Road, Near Law Garden', city: 'Ahmedabad',
    pricePerHour: 50, rating: 4.8, totalSlots: 80, availableSlots: 12, images: [],
    amenities: ['covered', 'cctv', 'valet', '247'], latitude: 23.0325, longitude: 72.5814,
  },
  {
    _id: '3', parkingName: 'Kankaria Lake Parking', address: 'Kankaria Lake, Maninagar', city: 'Ahmedabad',
    pricePerHour: 30, rating: 4.2, totalSlots: 200, availableSlots: 78, images: [],
    amenities: ['outdoor', 'cctv'], latitude: 23.0025, longitude: 72.6014,
  },
  {
    _id: '4', parkingName: 'Sabarmati Riverfront Parking', address: 'Riverfront, Near Gandhi Ashram', city: 'Ahmedabad',
    pricePerHour: 35, rating: 4.6, totalSlots: 150, availableSlots: 89, images: [],
    amenities: ['outdoor', '247', 'cctv'], latitude: 23.0525, longitude: 72.5714,
  },
  {
    _id: '5', parkingName: 'AlphaOne Mall Multi-Level', address: 'AlphaOne Mall, Vastrapur', city: 'Ahmedabad',
    pricePerHour: 60, rating: 4.7, totalSlots: 500, availableSlots: 120, images: [],
    amenities: ['covered', 'indoor', 'cctv', 'evCharging', 'valet', '247'], latitude: 23.0425, longitude: 72.5614,
  },
  {
    _id: '6', parkingName: 'Navrangpura Municipal Lot', address: 'Navrangpura, Ahmedabad', city: 'Ahmedabad',
    pricePerHour: 25, rating: 4.0, totalSlots: 60, availableSlots: 3, images: [],
    amenities: ['outdoor'], latitude: 23.0125, longitude: 72.5514,
  },
  {
    _id: '7', parkingName: 'Vastrapur Lake Parking', address: 'Vastrapur Lake', city: 'Ahmedabad',
    pricePerHour: 30, rating: 4.3, totalSlots: 90, availableSlots: 55, images: [],
    amenities: ['outdoor', 'cctv'], latitude: 23.0475, longitude: 72.5414,
  },
  {
    _id: '8', parkingName: 'Bodakdev Secure Parking', address: 'Bodakdev, Ahmedabad', city: 'Ahmedabad',
    pricePerHour: 45, rating: 4.4, totalSlots: 75, availableSlots: 30, images: [],
    amenities: ['covered', 'cctv', '247', 'evCharging'], latitude: 23.0625, longitude: 72.5214,
  },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'priceLow', label: 'Price: Low to High' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'availability', label: 'Availability' },
];

const FindParkingPage = () => {
  const [searchParams] = useSearchParams();
  const [parkings, setParkings] = useState(MOCK_PARKINGS);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParkings(MOCK_PARKINGS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setFilteredCount(parkings.length);
  }, [parkings]);

  const handleSort = (value) => {
    setSortBy(value);
    const sorted = [...parkings];
    switch (value) {
      case 'priceLow': sorted.sort((a, b) => a.pricePerHour - b.pricePerHour); break;
      case 'priceHigh': sorted.sort((a, b) => b.pricePerHour - a.pricePerHour); break;
      case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
      case 'availability': sorted.sort((a, b) => b.availableSlots / b.totalSlots - a.availableSlots / a.totalSlots); break;
      default: break;
    }
    setParkings(sorted);
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <FindParkingHero />

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-gray-300 border border-white/10 hover:border-orange-500/30'}`}
            >
              <FaFilter />
              Filters
              <span className="text-[10px] bg-orange-500/20 px-1.5 py-0.5 rounded-full text-orange-400">3</span>
            </button>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">{filteredCount}</span> parking spots
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sort */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-orange-500/30 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#1E293B]">{opt.label}</option>
                ))}
              </select>
              <FaSortAmountDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <FaThList />
              </button>
            </div>
          </div>
        </div>

        {/* Content: Sidebar + Results */}
        <div className="flex gap-6">
          {/* Filters sidebar */}
          {showFilters && (
            <div className="w-72 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <FindParkingFilters onClose={() => setShowFilters(false)} />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              /* Loading skeleton */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#1E293B] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-800" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-800 rounded w-3/4" />
                      <div className="h-4 bg-gray-800 rounded w-1/2" />
                      <div className="h-4 bg-gray-800 rounded w-full" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-800 rounded-full w-16" />
                        <div className="h-6 bg-gray-800 rounded-full w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : parkings.length > 0 ? (
              <div className={viewMode === 'grid'
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {parkings.map((parking, index) => (
                  <div key={parking._id} className={viewMode === 'list' ? 'flex' : ''}>
                    <ParkingResultCard parking={parking} />
                  </div>
                ))}
              </div>
            ) : (
              /* No results */
              <div className="text-center py-20">
                <FaCar className="text-6xl text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No parking spots found</h3>
                <p className="text-gray-400">Try adjusting your filters or search in a different area</p>
                <button
                  onClick={() => setParkings(MOCK_PARKINGS)}
                  className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0F172A] border-l border-white/10 p-6 overflow-y-auto">
            <FindParkingFilters onClose={() => setShowFilters(false)} />
          </div>
        </div>
      )}

      <FindParkingExtras />
    </div>
  );
};

export default FindParkingPage;
