import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import recommendationService from '../services/recommendationService';
import { toast } from 'react-toastify';
import {
  FaMapMarkerAlt, FaClock, FaRupeeSign, FaStar, FaLocationArrow,
  FaFilter, FaSortAmountDown, FaBolt, FaUmbrella, FaConciergeBell,
  FaSun, FaCheckCircle, FaTimes, FaSearch, FaRobot,
} from 'react-icons/fa';

const SORT_OPTIONS = [
  { value: 'bestMatch', label: 'Best Match' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'highestRated', label: 'Highest Rated' },
];

const QUICK_FILTERS = [
  { key: 'evCharging', label: 'EV Charging', icon: FaBolt },
  { key: 'covered', label: 'Covered', icon: FaUmbrella },
  { key: 'valet', label: 'Valet', icon: FaConciergeBell },
  { key: 'allHours', label: '24x7', icon: FaSun },
];

const MOCK_RECOMMENDATIONS = [
  {
    _id: 'rec_1', parkingName: 'SG Highway Smart Parking', address: 'SG Highway, Near Palladium Mall', city: 'Ahmedabad',
    pricePerHour: 40, rating: 4.5, totalSlots: 120, availableSlots: 45, distance: 350, estimatedTime: 4,
    latitude: 23.0225, longitude: 72.5714, matchPercentage: 96,
    images: ['https://images.unsplash.com/photo-1506521781260-d2b2f1aaa3f9?w=600&q=80'],
    amenities: { cctv: true, evCharging: true, covered: true, security: true, valet: false },
    reasons: ['Close to your current location (350m)', 'Best value price in this area', 'High availability with 45 spots open', 'EV charging available for your vehicle'],
  },
  {
    _id: 'rec_2', parkingName: 'CG Road Premium Lot', address: 'CG Road, Near Law Garden', city: 'Ahmedabad',
    pricePerHour: 50, rating: 4.8, totalSlots: 80, availableSlots: 12, distance: 1200, estimatedTime: 8,
    latitude: 23.0325, longitude: 72.5814, matchPercentage: 92,
    images: ['https://images.unsplash.com/photo-1590674899484-d5640d0f7b3f?w=600&q=80'],
    amenities: { cctv: true, evCharging: false, covered: true, security: true, valet: true },
    reasons: ['Top-rated parking with 4.8 stars', 'Valet service included', 'Very secure with 24x7 CCTV monitoring', 'Covered parking protects your vehicle'],
  },
  {
    _id: 'rec_3', parkingName: 'Kankaria Lake Parking', address: 'Kankaria Lake, Maninagar', city: 'Ahmedabad',
    pricePerHour: 30, rating: 4.2, totalSlots: 200, availableSlots: 78, distance: 2800, estimatedTime: 12,
    latitude: 23.0025, longitude: 72.6014, matchPercentage: 85,
    images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80'],
    amenities: { cctv: true, evCharging: false, covered: false, security: true, valet: false },
    reasons: ['Budget-friendly at just ₹30/hr', 'Ample availability with 78 free spots', 'Near popular tourist attraction', 'Open-air parking with security'],
  },
  {
    _id: 'rec_4', parkingName: 'Sabarmati Riverfront Parking', address: 'Riverfront, Near Gandhi Ashram', city: 'Ahmedabad',
    pricePerHour: 35, rating: 4.6, totalSlots: 150, availableSlots: 89, distance: 1800, estimatedTime: 9,
    latitude: 23.0525, longitude: 72.5714, matchPercentage: 88,
    images: ['https://images.unsplash.com/photo-1573342212426-3156b16c2e2a?w=600&q=80'],
    amenities: { cctv: true, evCharging: false, covered: false, security: true, valet: false },
    reasons: ['Scenic riverside parking experience', 'Great value with high capacity', 'Security patrolled area', 'Easy access to Riverfront attractions'],
  },
  {
    _id: 'rec_5', parkingName: 'AlphaOne Mall Multi-Level', address: 'AlphaOne Mall, Vastrapur', city: 'Ahmedabad',
    pricePerHour: 60, rating: 4.7, totalSlots: 500, availableSlots: 120, distance: 900, estimatedTime: 5,
    latitude: 23.0425, longitude: 72.5614, matchPercentage: 94,
    images: ['https://images.unsplash.com/photo-1621879797414-1eb99b52f642?w=600&q=80'],
    amenities: { cctv: true, evCharging: true, covered: true, security: true, valet: true },
    reasons: ['Multi-level covered parking with 500 spots', 'EV charging stations available', 'Valet service for premium experience', 'Mall connected with direct access', '24x7 security and CCTV coverage'],
  },
  {
    _id: 'rec_6', parkingName: 'Navrangpura Municipal Lot', address: 'Navrangpura, Ahmedabad', city: 'Ahmedabad',
    pricePerHour: 25, rating: 4.0, totalSlots: 60, availableSlots: 3, distance: 2200, estimatedTime: 10,
    latitude: 23.0125, longitude: 72.5514, matchPercentage: 72,
    images: ['https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=600&q=80'],
    amenities: { cctv: false, evCharging: false, covered: false, security: false, valet: false },
    reasons: ['Lowest price in the area at ₹25/hr', 'Central municipal location', 'Very limited spots remaining, book fast'],
  },
  {
    _id: 'rec_7', parkingName: 'Vastrapur Lake Parking', address: 'Vastrapur Lake', city: 'Ahmedabad',
    pricePerHour: 30, rating: 4.3, totalSlots: 90, availableSlots: 55, distance: 650, estimatedTime: 3,
    latitude: 23.0475, longitude: 72.5414, matchPercentage: 90,
    images: ['https://images.unsplash.com/photo-1506521781260-d2b2f1aaa3f9?w=600&q=80'],
    amenities: { cctv: true, evCharging: false, covered: false, security: true, valet: false },
    reasons: ['Very close at just 650m walk', 'Good availability with 55 spots', 'Peaceful lakeside location', 'Monitored security cameras'],
  },
  {
    _id: 'rec_8', parkingName: 'Bodakdev Secure Parking', address: 'Bodakdev, Ahmedabad', city: 'Ahmedabad',
    pricePerHour: 45, rating: 4.4, totalSlots: 75, availableSlots: 30, distance: 1500, estimatedTime: 7,
    latitude: 23.0625, longitude: 72.5214, matchPercentage: 82,
    images: ['https://images.unsplash.com/photo-1590674899484-d5640d0f7b3f?w=600&q=80'],
    amenities: { cctv: true, evCharging: true, covered: true, security: true, valet: false },
    reasons: ['Secure covered parking with EV charging', 'Mid-range pricing at ₹45/hr', '30 spots still available', 'Great for extended parking'],
  },
];

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const RecommendationCard = ({ parking, index }) => {
  const { distance, estimatedTime } = parking;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-[#0a0a0b] dark:bg-[#0a0a0b]   rounded-2xl border border-[#e7c588]/25 dark:border-[#e7c588]/25  shadow-sm overflow-hidden group h-full flex flex-col"
    >
      <div className="relative h-36 sm:h-44 xl:h-48 overflow-hidden">
        <img
          src={parking.images?.[0] || '/placeholder.jpg'}
          alt={parking.parkingName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3 px-3 py-1 bg-[#0a0a0b]0 text-[#f9f0d7] text-sm font-bold rounded-full shadow-lg">
          {parking.matchPercentage}% Match
        </div>
        <div className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded-full shadow-md"
          style={{
            backgroundColor: parking.availableSlots > 20 ? '#22C55E' : parking.availableSlots > 5 ? '#F97316' : '#EF4444',
            color: 'white',
          }}
        >
          {parking.availableSlots} {parking.availableSlots === 1 ? 'slot' : 'slots'} left
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  leading-tight">{parking.parkingName}</h3>
          <div className="flex items-center gap-1 text-primary-400 shrink-0">
            <FaStar className="text-xs sm:text-sm" />
            <span className="text-xs sm:text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 ">{parking.rating || 'N/A'}</span>
          </div>
        </div>

        <div className="-mt-1 space-y-0.5">
          <p className="text-[11px] sm:text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-[#e7c588]/70 text-[9px] sm:text-[10px] flex-shrink-0" />
            <span className="truncate">{parking.address || 'Ahmedabad'}</span>
          </p>
          {parking.city && (
            <p className="text-[10px] sm:text-[11px] text-[#e7c588]/80 dark:text-[#e7c588]/80  ml-5">{parking.city}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">
          <span className="flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[9px] sm:text-[10px]" />
            {distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`}
          </span>
          <span className="flex items-center gap-1.5">
            <FaClock className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[9px] sm:text-[10px]" />
            ~{estimatedTime} min
          </span>
          <span className="flex items-center gap-1.5 ml-auto font-semibold text-[#e7c588]/80">
            <FaRupeeSign className="text-[10px] sm:text-xs" />
            {parking.pricePerHour}/hr
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-1">
            <span>Available: {parking.availableSlots}/{parking.totalSlots}</span>
            <span>{Math.round((1 - parking.availableSlots / parking.totalSlots) * 100)}% full</span>
          </div>
          <div className="h-1.5 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(1 - parking.availableSlots / parking.totalSlots) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="h-full bg-gradient-to-r from-[#0a0a0b] to-primary-400 rounded-full"
            />
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {parking.amenities?.cctv && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#121214] dark:bg-[#121214]  rounded-lg text-[10px] sm:text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 " title="CCTV">
              📹 CCTV
            </span>
          )}
          {parking.amenities?.evCharging && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#121214] dark:bg-[#121214]  rounded-lg text-[10px] sm:text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 " title="EV Charging">
              ⚡ EV
            </span>
          )}
          {parking.amenities?.covered && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#121214] dark:bg-[#121214]  rounded-lg text-[10px] sm:text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 " title="Covered">
              🏠 Covered
            </span>
          )}
          {parking.amenities?.security && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#121214] dark:bg-[#121214]  rounded-lg text-[10px] sm:text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 " title="Security">
              🛡️ Secure
            </span>
          )}
          {parking.amenities?.valet && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#121214] dark:bg-[#121214]  rounded-lg text-[10px] sm:text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 " title="Valet">
              🎩 Valet
            </span>
          )}
        </div>

        <div className="p-3 bg-[#0a0a0b]/5 rounded-xl border border-[#e7c588]/25/10">
          <p className="text-xs font-semibold text-primary-400 mb-1.5 flex items-center gap-1.5">
            <FaRobot className="text-[#e7c588]/80 dark:text-[#e7c588]/80" /> AI Recommendation
          </p>
          <ul className="space-y-1">
            {parking.reasons.map((reason, i) => (
              <li key={i} className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  flex items-start gap-1.5">
                <FaCheckCircle className="text-primary-400 text-[10px] mt-0.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            recommendationService.trackClick({ parkingId: parking._id, matchPercentage: parking.matchPercentage });
            toast.info(`Navigating to ${parking.parkingName}...`);
          }}
          className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-[#f9f0d7] font-semibold rounded-xl transition-all shadow-lg shadow-primary-400/20 hover:shadow-xl hover:shadow-primary-400/30 mt-auto"
        >
          Book Now - ₹{parking.pricePerHour}/hr
        </motion.button>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b]   rounded-2xl border border-[#e7c588]/25 dark:border-[#e7c588]/25  shadow-sm overflow-hidden animate-pulse h-full flex flex-col">
    <div className="h-36 sm:h-44 xl:h-48 bg-[#1c1c1f] dark:bg-[#1c1c1f] " />
    <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2 sm:gap-3">
      <div className="flex justify-between">
        <div className="h-5 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-2/3" />
        <div className="h-5 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-10 sm:w-12" />
      </div>
      <div className="h-3 sm:h-4 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-1/2 sm:w-1/3" />
      <div className="flex gap-2 sm:gap-4">
        <div className="h-3 sm:h-4 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-14 sm:w-16" />
        <div className="h-3 sm:h-4 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-14 sm:w-16" />
        <div className="h-3 sm:h-4 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-16 sm:w-20" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <div className="h-3 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-20 sm:w-24" />
          <div className="h-3 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded w-12 sm:w-16" />
        </div>
        <div className="h-1.5 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-full" />
      </div>
      <div className="flex gap-1.5 sm:gap-2">
        <div className="h-5 sm:h-6 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-lg w-12 sm:w-16" />
        <div className="h-5 sm:h-6 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-lg w-12 sm:w-16" />
        <div className="h-5 sm:h-6 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-lg w-16 sm:w-20" />
      </div>
      <div className="h-16 sm:h-20 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-xl mt-auto" />
      <div className="h-9 sm:h-10 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-xl" />
    </div>
  </div>
);

const EmptyState = ({ onReset }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 px-4 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-[#121214]/10 flex items-center justify-center mb-6">
      <FaSearch className="text-3xl text-[#e7c588]/80" />
    </div>
    <h3 className="text-xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-2">No AI Recommendations Found</h3>
    <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  max-w-md mb-8">
      We couldn't find parking recommendations matching your current filters. Try adjusting your preferences or location.
    </p>
    <div className="flex gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-[#f9f0d7] font-semibold rounded-xl transition-all shadow-lg shadow-primary-400/20"
      >
        Reset All Filters
      </motion.button>
    </div>
  </motion.div>
);

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('bestMatch');
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });
  const [fetchingLocation, setFetchingLocation] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setFetchingLocation(false);
        },
        () => {
          setCurrentLocation({ lat: 23.0225, lng: 72.5714 });
          setFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setCurrentLocation({ lat: 23.0225, lng: 72.5714 });
      setFetchingLocation(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        sort: sortBy,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      };
      if (activeFilters.length > 0) {
        params.filters = activeFilters.join(',');
      }
      const response = await recommendationService.getRecommendations(params);
      setRecommendations(response.data?.recommendations || response.data || []);
    } catch (err) {
      const mockWithDistance = MOCK_RECOMMENDATIONS.map((p) => {
        const dist = haversineDistance(
          currentLocation.lat, currentLocation.lng,
          p.latitude || 23.0225, p.longitude || 72.5714,
        );
        return { ...p, distance: Math.round(dist), estimatedTime: Math.max(1, Math.round(dist / 80)) };
      });
      setRecommendations(mockWithDistance);
      toast.info('Using sample recommendations (demo mode)');
    } finally {
      setLoading(false);
    }
  }, [sortBy, activeFilters, currentLocation]);

  useEffect(() => {
    if (!fetchingLocation) {
      fetchRecommendations();
    }
  }, [fetchingLocation, fetchRecommendations]);

  useEffect(() => {
    if (!loading && recommendations.length > 0) {
      let sorted = [...recommendations];
      switch (sortBy) {
        case 'nearest':
          sorted.sort((a, b) => a.distance - b.distance);
          break;
        case 'cheapest':
          sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
          break;
        case 'highestRated':
          sorted.sort((a, b) => b.rating - a.rating);
          break;
        default:
          sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
          break;
      }
      setRecommendations(sorted);
    }
  }, [sortBy]);

  useEffect(() => {
    if (!loading && recommendations.length > 0) {
      let filtered = [...recommendations];
      if (activeFilters.length > 0) {
        filtered = recommendations.filter((p) =>
          activeFilters.every((f) => p.amenities?.[f] === true),
        );
      }
      setRecommendations(filtered);
    }
  }, [activeFilters]);

  const toggleFilter = (key) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  };

  const handleRetry = () => {
    fetchRecommendations();
  };

  const handleResetFilters = () => {
    setActiveFilters([]);
    setSortBy('bestMatch');
    const mockWithDistance = MOCK_RECOMMENDATIONS.map((p) => {
      const dist = haversineDistance(
        currentLocation.lat, currentLocation.lng,
        p.latitude || 23.0225, p.longitude || 72.5714,
      );
      return { ...p, distance: Math.round(dist), estimatedTime: Math.max(1, Math.round(dist / 80)) };
    });
    setRecommendations(mockWithDistance);
    toast.info('Filters reset successfully');
  };

  const handleRefreshLocation = () => {
    setFetchingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setFetchingLocation(false);
          toast.success('Location updated');
        },
        () => {
          toast.error('Could not get location');
          setFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      toast.error('Geolocation not supported on this browser');
      setFetchingLocation(false);
    }
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#121214]  min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero_video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[#0a0a0b]" />
        <div className="absolute inset-0 bg-[#e7c588]/[0.06] mix-blend-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#121214]/10 rounded-full text-primary-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            >
              <FaRobot className="text-[#e7c588]/80 dark:text-[#e7c588]/80" />
              AI-Powered Recommendations
            </motion.div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-3 sm:mb-4 tracking-tight leading-tight">
              AI Smart Parking{' '}
              <span className="block sm:inline text-transparent bg-clip-text bg-primary-500">Recommendations</span>
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
              Personalized parking suggestions based on your preferences, location, and real-time availability
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0a0a0b] dark:bg-[#0a0a0b]   rounded-xl border border-[#e7c588]/25 dark:border-[#e7c588]/25  shadow-sm w-full sm:w-auto justify-center sm:justify-start"
              >
                <FaMapMarkerAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm text-[#f3e0ae] dark:text-[#e7c588]/80  truncate max-w-[180px] sm:max-w-none">
                  {fetchingLocation ? 'Detecting location...' : `${currentLocation.lat?.toFixed(4)}, ${currentLocation.lng?.toFixed(4)}`}
                </span>
                {!fetchingLocation && (
                  <button
                    onClick={handleRefreshLocation}
                    className="ml-0.5 p-1 sm:p-1.5 hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214]  rounded-lg transition-colors"
                    title="Refresh location"
                  >
                    <FaLocationArrow className="text-[10px] sm:text-xs text-[#e7c588]/80" />
                  </button>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0a0a0b] dark:bg-[#0a0a0b]   rounded-xl border border-[#e7c588]/25 dark:border-[#e7c588]/25  shadow-sm w-full sm:w-auto justify-center sm:justify-start"
              >
                <FaStar className="text-primary-400 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm text-[#f3e0ae] dark:text-[#e7c588]/80 ">
                  {loading ? 'Analyzing...' : `${recommendations.length} recommendations`}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-[#0a0a0b] dark:bg-[#0a0a0b]   rounded-2xl border border-[#e7c588]/25 dark:border-[#e7c588]/25  shadow-sm">
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    hasActiveFilters
                      ? 'bg-[#0a0a0b]0/20 text-[#e7c588]/80 dark:text-[#e7c588]/80 border border-primary-400/30'
                      : 'bg-[#121214] dark:bg-[#121214]  text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  border border-[#e7c588]/25 dark:border-[#e7c588]/25 '
                  }`}
                >
                  <FaFilter />
                  Filters
                  {hasActiveFilters && (
                    <span className="text-[10px] bg-[#0a0a0b]0 text-[#f9f0d7] px-1.5 py-0.5 rounded-full">{activeFilters.length}</span>
                  )}
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {QUICK_FILTERS.map((f) => {
                  const isActive = activeFilters.includes(f.key);
                  const Icon = f.icon;
                  return (
                    <motion.button
                      key={f.key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter(f.key)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#0a0a0b]0 text-[#f9f0d7] shadow-lg shadow-primary-400/20'
                          : 'bg-[#121214] dark:bg-[#121214]  text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  border border-[#e7c588]/25 dark:border-[#e7c588]/25  hover:border-primary-400/30 hover:text-[#e7c588]/80'
                      }`}
                    >
                      <Icon className="text-xs" />
                      {f.label}
                    </motion.button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:text-[#e7c588] transition-colors"
                >
                  <FaTimes />
                  Clear all
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-[#121214] dark:bg-[#121214]  border border-[#e7c588]/25 dark:border-[#e7c588]/25  text-[#f3e0ae] dark:text-[#e7c588]/80  text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-400/30 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0a0a0b] dark:bg-[#0a0a0b] ">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FaSortAmountDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 pointer-events-none text-xs" />
              </div>

              {!loading && recommendations.length > 0 && (
                <span className="hidden sm:block text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  whitespace-nowrap bg-[#121214] dark:bg-[#121214]  px-3 py-2 rounded-xl">
                  {recommendations.length} result{recommendations.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden sm:hidden mt-2"
              >
                <div className="p-4 bg-[#0a0a0b] dark:bg-[#0a0a0b]   rounded-2xl border border-[#e7c588]/25 dark:border-[#e7c588]/25  shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">Quick Filters</span>
                    <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214]  rounded-lg">
                      <FaTimes className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map((f) => {
                      const isActive = activeFilters.includes(f.key);
                      const Icon = f.icon;
                      return (
                        <button
                          key={f.key}
                          onClick={() => toggleFilter(f.key)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-[#0a0a0b]0 text-[#f9f0d7]'
                              : 'bg-[#121214] dark:bg-[#121214]  text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  border border-[#e7c588]/25 dark:border-[#e7c588]/25 '
                          }`}
                        >
                          <Icon className="text-xs" />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-start gap-3 p-4 bg-[#e7c588]/5 border border-[#e7c588]/40 rounded-xl" role="alert">
              <FaTimes className="text-[#e7c588] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e7c588]">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[#e7c588] bg-[#e7c588]/10 hover:bg-[#e7c588]:bg-[#e7c588]/20 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Recommendations Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : recommendations.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {recommendations.map((parking, index) => (
                <RecommendationCard key={parking._id} parking={parking} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState onReset={handleResetFilters} />
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
