import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaTh,
  FaThList,
  FaTimes,
  FaParking,
  FaWifi,
  FaShieldAlt,
  FaClock,
  FaCar,
  FaCamera,
  FaBolt,
  FaBuilding,
  FaWheelchair,
  FaRedo,
} from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import parkingService from '../services/parkingService';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import PageTransition from '../components/common/PageTransition';
import PageHero from '../components/common/PageHero';

const mockParkings = [
  { id: 1, parkingName: 'City Center Hub', city: 'Ahmedabad', address: 'MG Road, Ahmedabad', totalSlots: 200, availableSlots: 45, pricePerHour: 25, rating: 4.8, numReviews: 342, amenities: ['cctv', 'ev', 'covered', 'security', '24x7'], parkingType: 'multi-level', status: 'active', images: [] },
  { id: 2, parkingName: 'Airport Terminal A', city: 'Ahmedabad', address: 'Sardar Patel Airport', totalSlots: 500, availableSlots: 120, pricePerHour: 40, rating: 4.6, numReviews: 189, amenities: ['cctv', 'security', '24x7', 'handicapped'], parkingType: 'airport', status: 'active', images: [] },
  { id: 3, parkingName: 'Mall Plaza South', city: 'Ahmedabad', address: 'SG Highway, Ahmedabad', totalSlots: 350, availableSlots: 80, pricePerHour: 30, rating: 4.7, numReviews: 256, amenities: ['cctv', 'ev', 'covered', '24x7'], parkingType: 'mall', status: 'active', images: [] },
  { id: 4, parkingName: 'Railway Station Parking', city: 'Ahmedabad', address: 'Kalupur, Ahmedabad', totalSlots: 150, availableSlots: 22, pricePerHour: 20, rating: 4.5, numReviews: 421, amenities: ['cctv', 'security'], parkingType: 'street', status: 'active', images: [] },
  { id: 5, parkingName: 'Hospital Complex Lot', city: 'Ahmedabad', address: 'Civil Hospital Road', totalSlots: 100, availableSlots: 35, pricePerHour: 15, rating: 4.3, numReviews: 178, amenities: ['cctv', 'handicapped', '24x7'], parkingType: 'hospital', status: 'active', images: [] },
  { id: 6, parkingName: 'Tech Park Premium', city: 'Ahmedabad', address: 'Science City Road', totalSlots: 250, availableSlots: 95, pricePerHour: 35, rating: 4.9, numReviews: 89, amenities: ['cctv', 'ev', 'covered', 'security', '24x7', 'handicapped'], parkingType: 'commercial', status: 'active', images: [] },
];

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'availability', label: 'Availability' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ev', label: 'EV Charging' },
  { value: 'covered', label: 'Covered' },
  { value: '24x7', label: '24/7' },
  { value: 'cctv', label: 'CCTV' },
];

const QUICK_FILTERS = [
  { key: 'near-work', label: '🏢 Near Work', filter: 'covered' },
  { key: 'near-home', label: '🏠 Near Home', filter: '24x7' },
  { key: 'ev', label: '⚡ EV', filter: 'ev' },
  { key: 'night-safe', label: '🌙 Night Safe', filter: 'cctv' },
  { key: 'safest', label: '🛡️ Safest', filter: 'security' },
  { key: 'cheapest', label: '💰 Cheapest', sort: 'price' },
  { key: 'top-rated', label: '⭐ Top Rated', sort: 'rating' },
];

const AMENITY_CONFIG = {
  ev: { icon: FaBolt, label: 'EV', color: 'text-primary-400 bg-primary-500/10' },
  cctv: { icon: FaCamera, label: 'CCTV', color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#e7c588]/10' },
  '24x7': { icon: FaClock, label: '24/7', color: 'text-primary-400 bg-primary-500/10' },
  security: { icon: FaShieldAlt, label: 'Security', color: 'text-primary-400 bg-primary-500/10' },
  covered: { icon: FaBuilding, label: 'Covered', color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#e7c588]/10' },
  handicapped: { icon: FaWheelchair, label: 'Handicapped', color: 'text-primary-400 bg-primary-500/10' },
};

const SLOT_COLOR_THRESHOLD = { green: 30, yellow: 60 };

const getSlotColor = (available, total) => {
  const pct = (available / total) * 100;
  if (pct > 50) return 'bg-[#0a0a0b]0';
  if (pct > SLOT_COLOR_THRESHOLD.green) return 'bg-[#0a0a0b]0';
  return 'bg-[#e7c588]';
};

const getSlotBadgeColor = (available, total) => {
  const pct = (available / total) * 100;
  if (pct > 50) return 'bg-[#0a0a0b]0/20 text-primary-400 border-primary-300/30';
  if (pct > SLOT_COLOR_THRESHOLD.green) return 'bg-[#0a0a0b]0/20 text-primary-400 border-primary-300/30';
  return 'bg-[#e7c588]/20 text-[#e7c588] border-[#e7c588]/40';
};

const renderStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const partial = rating - full;
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<FaStar key={i} className="text-primary-400 text-xs" />);
    } else if (i === full && partial >= 0.3) {
      stars.push(
        <span key={i} className="relative inline-block w-3 h-3">
          <FaStar className="absolute text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-xs" />
          <span className="absolute overflow-hidden w-[50%]">
            <FaStar className="text-primary-400 text-xs" />
          </span>
        </span>
      );
    } else {
      stars.push(<FaStar key={i} className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-xs" />);
    }
  }
  return stars;
};

const ParkingCard = ({ parking, index, viewMode }) => {
  const navigate = useNavigate();
  const availabilityPct = Math.round((parking.availableSlots / parking.totalSlots) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group bg-[#0a0a0b]/80   rounded-2xl border border-[#e7c588]/25  overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-400/10 hover:border-[#e7c588]/30:border-[#e7c588]/20 ${
        viewMode === 'list' ? 'flex flex-row' : ''
      }`}
    >
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
        {parking.images && parking.images[0] ? (
          <img
            src={parking.images[0]}
            alt={parking.parkingName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400/20 to-[#e7c588]/20 flex items-center justify-center">
            <FaParking className="text-5xl text-[#e7c588]/40 group-hover:text-[#e7c588]/60 transition-colors duration-300" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#0a0a0b]0/20 text-[#e7c588]/80 border border-[#e7c588]/30 ">
            2.3 km away
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border  ${getSlotBadgeColor(parking.availableSlots, parking.totalSlots)}`}>
            {parking.availableSlots} slots
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  truncate">
            {parking.parkingName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  text-sm mb-2">
          <FaMapMarkerAlt className="text-xs flex-shrink-0" />
          <span className="truncate">{parking.city}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">{renderStars(parking.rating)}</div>
          <span className="text-sm font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">
            ({parking.rating})
          </span>
          <span className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">
            {parking.numReviews.toLocaleString()} reviews
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl font-extrabold text-[#e7c588]/80">
            ₹{parking.pricePerHour}
          </span>
          <span className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">/hr</span>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">
              {parking.availableSlots}/{parking.totalSlots} slots
            </span>
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">{availabilityPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${availabilityPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.08 + 0.3 }}
              className={`h-full rounded-full ${getSlotColor(parking.availableSlots, parking.totalSlots)}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {parking.amenities.map((amenity) => {
            const config = AMENITY_CONFIG[amenity];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <span
                key={amenity}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${config.color}`}
              >
                <Icon className="text-[10px]" />
                {config.label}
              </span>
            );
          })}
        </div>

        <button
          onClick={() => navigate(`/parking/${parking.id}`)}
          className="mt-auto w-full py-2.5 rounded-xl font-semibold text-sm text-[#f9f0d7] bg-primary-500 hover:bg-primary-600 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary-400/20"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
};

const FindParkingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('distance');
  const [filterBy, setFilterBy] = useState('all');
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);

  const fetchParkings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await parkingService.getAllParking({
        city: searchParams.get('city') || undefined,
        sort: sortBy,
      });
      const items = res.data?.data || [];
      if (items.length === 0) {
        setParkings(mockParkings);
      } else {
        setParkings(items.map((p) => ({ ...p, _id: p.id })));
      }
    } catch (err) {
      setParkings(mockParkings);
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortBy]);

  useEffect(() => {
    fetchParkings();
  }, [fetchParkings]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchParkings();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await parkingService.searchParking(searchQuery.trim());
      const items = res.data?.data || [];
      setParkings(items.length > 0 ? items.map((p) => ({ ...p, _id: p.id })) : []);
    } catch {
      setParkings([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, fetchParkings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleQuickFilter = useCallback(
    (qf) => {
      if (activeQuickFilter === qf.key) {
        setActiveQuickFilter(null);
        setFilterBy('all');
        setSortBy('distance');
      } else {
        setActiveQuickFilter(qf.key);
        if (qf.filter) {
          setFilterBy(qf.filter);
        } else if (qf.sort) {
          setSortBy(qf.sort);
        }
      }
    },
    [activeQuickFilter]
  );

  const removeFilter = useCallback((filter) => {
    if (filter === 'sort') {
      setSortBy('distance');
    } else if (filter === 'type') {
      setFilterBy('all');
    } else if (filter === 'quick') {
      setActiveQuickFilter(null);
    } else if (filter === 'search') {
      setSearchQuery('');
    }
  }, []);

  const filteredParkings = useMemo(() => {
    let result = [...parkings];

    if (filterBy !== 'all') {
      result = result.filter((p) => p.amenities && p.amenities.includes(filterBy));
    }

    switch (sortBy) {
      case 'price':
        result.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'availability':
        result.sort(
          (a, b) => b.availableSlots / b.totalSlots - a.availableSlots / a.totalSlots
        );
        break;
      default:
        break;
    }

    return result;
  }, [parkings, sortBy, filterBy]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (searchQuery.trim()) {
      chips.push({ key: 'search', label: `"${searchQuery.trim()}"`, type: 'search' });
    }
    if (sortBy !== 'distance') {
      const opt = SORT_OPTIONS.find((o) => o.value === sortBy);
      chips.push({ key: 'sort', label: opt?.label || sortBy, type: 'sort' });
    }
    if (filterBy !== 'all') {
      const opt = FILTER_OPTIONS.find((o) => o.value === filterBy);
      chips.push({ key: 'type', label: opt?.label || filterBy, type: 'type' });
    }
    if (activeQuickFilter) {
      const qf = QUICK_FILTERS.find((q) => q.key === activeQuickFilter);
      if (qf) {
        chips.push({ key: 'quick', label: qf.label, type: 'quick' });
      }
    }
    return chips;
  }, [searchQuery, sortBy, filterBy, activeQuickFilter]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0b]">
        <PageHero
          badge={<><FaParking className="text-[#e7c588]" /> 200+ Ahmedabad locations</>}
          title="Find"
          highlight="Parking"
          subtitle="Discover the best parking spots near you — live availability across Ahmedabad"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GlassCard className="p-4 sm:p-5 mb-6" hover={false}>
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm" />
                  <input
                    type="text"
                    placeholder="Search parking locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0a0a0b]/60  border border-[#e7c588]/25 dark:border-[#e7c588]/25  text-[#f9f0d7] dark:text-[#f9f0d7]  placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-300 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#0a0a0b]/60  border border-[#e7c588]/25 dark:border-[#e7c588]/25  text-[#f3e0ae] dark:text-[#e7c588]/80  text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-400/30 cursor-pointer transition-all"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="appearance-none bg-[#0a0a0b]/60  border border-[#e7c588]/25 dark:border-[#e7c588]/25  text-[#f3e0ae] dark:text-[#e7c588]/80  text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-400/30 cursor-pointer transition-all"
                  >
                    {FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="hidden sm:flex bg-[#0a0a0b]/60  border border-[#e7c588]/25 dark:border-[#e7c588]/25  rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-[#0a0a0b]0/20 text-[#e7c588]/80'
                          : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 '
                      }`}
                    >
                      <FaTh />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-[#0a0a0b]0/20 text-[#e7c588]/80'
                          : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 '
                      }`}
                    >
                      <FaThList />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {activeFilterChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-5"
            >
              {activeFilterChips.map((chip) => (
                <motion.span
                  key={chip.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0a0a0b]0/10 text-primary-400 border border-[#e7c588]/20"
                >
                  {chip.label}
                  <button
                    onClick={() => removeFilter(chip.type)}
                    className="p-0.5 rounded-full hover:bg-[#0a0a0b]0/20 transition-colors"
                  >
                    <FaTimes className="text-[10px]" />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {QUICK_FILTERS.map((qf) => {
                const isActive = activeQuickFilter === qf.key;
                return (
                  <motion.button
                    key={qf.key}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleQuickFilter(qf)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-[#f9f0d7] shadow-lg shadow-primary-400/25 border border-[#e7c588]/30'
                        : 'bg-[#0a0a0b]/80   text-[#f3e0ae] dark:text-[#e7c588]/80  border border-[#e7c588]/25 dark:border-[#e7c588]/25  hover:border-[#e7c588]/30 hover:text-primary-400 '
                    }`}
                  >
                    {qf.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <div className="mb-6">
            <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">
              <span className="font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">
                {filteredParkings.length}
              </span>{' '}
              parking spots found
            </p>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={6} />
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#e7c588]/10 flex items-center justify-center mx-auto mb-6">
                <FaCar className="text-4xl text-[#e7c588]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-2">
                Something went wrong
              </h3>
              <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-6">{error}</p>
              <button
                onClick={fetchParkings}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-[#f9f0d7] rounded-xl font-medium transition-all shadow-lg shadow-primary-400/20"
              >
                <FaRedo className="text-sm" />
                Try Again
              </button>
            </div>
          ) : filteredParkings.length === 0 ? (
            <EmptyState
              icon={FaParking}
              title="No parking spots found"
              description="Try adjusting your filters or search in a different area"
              action={
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBy('all');
                    setSortBy('distance');
                    setActiveQuickFilter(null);
                    fetchParkings();
                  }}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-[#f9f0d7] rounded-xl font-medium transition-all shadow-lg shadow-primary-400/20"
                >
                  Reset Filters
                </button>
              }
            />
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'
                    : 'grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6'
                }
              >
                {filteredParkings.map((parking, index) => (
                  <ParkingCard
                    key={parking.id || parking._id}
                    parking={parking}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {hasMore && filteredParkings.length >= 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex justify-center mt-10"
                >
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-8 py-3 rounded-xl font-semibold text-sm text-[#f3e0ae] dark:text-[#e7c588]/80  bg-[#0a0a0b]/80   border border-[#e7c588]/25 dark:border-[#e7c588]/25  hover:border-[#e7c588]/30 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-all duration-200 shadow-sm hover:shadow-lg"
                  >
                    Load More
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default FindParkingPage;
