import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaParking, FaArrowLeft, FaEdit, FaTrash, FaStar, FaStarHalfAlt,
  FaMapMarkerAlt, FaClock, FaCar, FaMotorcycle, FaBolt, FaCrown,
  FaWheelchair, FaDollarSign, FaPhone, FaEnvelope, FaUserTie,
  FaCalendarAlt, FaImages, FaCheck, FaTimes, FaShare,
  FaThLarge, FaChartBar, FaQuoteLeft, FaUserCircle,
  FaChevronLeft, FaChevronRight, FaCircle, FaVideo,
  FaShieldAlt, FaUmbrella, FaTint, FaHandshake, FaBicycle,
  FaFire, FaChair, FaBuilding, FaPercent, FaMoneyBillWave,
  FaSun, FaMoon, FaRoad, FaEye,
} from 'react-icons/fa';

const STATUS_COLORS = {
  active: 'bg-gray-500',
  closed: 'bg-red-500',
  maintenance: 'bg-gray-500',
  full: 'bg-gray-500',
};

const amenityIcons = {
  cctv: FaVideo,
  security: FaShieldAlt,
  evCharging: FaBolt,
  covered: FaUmbrella,
  washroom: FaTint,
  lift: FaBuilding,
  carWash: FaTint,
  valet: FaHandshake,
  bikeParking: FaBicycle,
  wheelchair: FaWheelchair,
  fireSafety: FaFire,
  waitingArea: FaChair,
};

const amenityLabels = {
  cctv: 'CCTV',
  security: 'Security',
  evCharging: 'EV Charging',
  covered: 'Covered',
  washroom: 'Washroom',
  lift: 'Elevator',
  carWash: 'Car Wash',
  valet: 'Valet',
  bikeParking: 'Bike Parking',
  wheelchair: 'Wheelchair Access',
  fireSafety: 'Fire Safety',
  waitingArea: 'Waiting Area',
};

const getAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === 'object') {
    return Object.entries(amenities)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }
  return [];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const StarRating = ({ rating }) => {
  const stars = [];
  const max = 5;
  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-primary-400 text-xs" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-primary-400 text-xs" />);
    } else {
      stars.push(<FaStar key={i} className="text-gray-300 text-xs" />);
    }
  }
  return <span className="inline-flex gap-0.5">{stars}</span>;
};

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900   rounded-2xl border border-gray-200 dark:border-gray-700  shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 mb-4">
    {Icon && (
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-400/20">
        <Icon className="text-white text-xs" />
      </div>
    )}
    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 ">{title}</h3>
  </div>
);

export default function ParkingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const images = parking?.images?.length > 0 ? parking.images : [];

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const res = await adminService.getParking(id);
        setParking(res.data?.data || res.data);
      } catch (err) {
        toast.error('Failed to load parking details');
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await adminService.getAllReviews({ parkingId: id });
        const data = res.data?.data || res.data || [];
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  const handleDelete = async () => {
    try {
      await adminService.deleteParking(id);
      toast.success('Parking deleted successfully');
      navigate('/parking');
    } catch (err) {
      toast.error('Failed to delete parking');
    } finally {
      setDeleteOpen(false);
    }
  };

  const getStatusDot = (status) => {
    const color = STATUS_COLORS[status?.toLowerCase()] || 'bg-gray-400';
    return <span className={`inline-block w-2 h-2 rounded-full ${color} mr-1.5`} />;
  };

  const renderStatValue = (value, prefix = '', suffix = '') => {
    if (value === null || value === undefined) return '-';
    return `${prefix}${Number(value).toLocaleString()}${suffix}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800  min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !parking) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800  min-h-screen flex items-center justify-center p-6">
        <GlassCard className="p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100/10 flex items-center justify-center mx-auto mb-4">
            <FaParking className="text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100  mb-2">Parking Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-6">
            The parking location you are looking for does not exist or has been removed.
          </p>
          <Button variant="secondary" onClick={() => navigate('/parking')}>
            <FaArrowLeft className="text-xs" />
            Go Back
          </Button>
        </GlassCard>
      </div>
    );
  }

  const statColorMap = {
    green: { bg: 'bg-gray-100/10', text: 'text-primary-400' },
    blue: { bg: 'bg-gray-100/10', text: 'text-primary-400' },
    orange: { bg: 'bg-gray-100/10', text: 'text-primary-400' },
    purple: { bg: 'bg-gray-100/10', text: 'text-primary-400' },
    red: { bg: 'bg-red-100/10', text: 'text-red-600' },
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: renderStatValue(parking.totalRevenue || parking.revenue, '₹'),
      icon: FaDollarSign,
      color: 'green',
    },
    {
      label: 'Total Bookings',
      value: renderStatValue(parking.totalBookings ?? parking.bookingsCount ?? 0),
      icon: FaCalendarAlt,
      color: 'blue',
    },
    {
      label: 'Occupancy',
      value: (() => {
        const total = parking.totalSlots ?? 0;
        const avail = parking.availableSlots ?? 0;
        if (total === 0) return '0%';
        return `${Math.round(((total - avail) / total) * 100)}%`;
      })(),
      icon: FaChartBar,
      color: 'orange',
    },
    {
      label: 'Avg Rating',
      value: parking.rating ? Number(parking.rating).toFixed(1) : '-',
      icon: FaStar,
      color: 'purple',
    },
  ];

  const slotColorClasses = {
    blue: 'text-gray-500',
    green: 'text-primary-400',
    yellow: 'text-primary-400',
    purple: 'text-primary-400',
    red: 'text-red-500',
  };

  const slotTypes = [
    { key: 'Car', icon: FaCar, totalKey: 'totalCars', availKey: 'availableCars', color: 'blue' },
    { key: 'Bike', icon: FaMotorcycle, totalKey: 'totalBikes', availKey: 'availableBikes', color: 'green' },
    { key: 'EV', icon: FaBolt, totalKey: 'totalEV', availKey: 'availableEV', color: 'yellow' },
    { key: 'VIP', icon: FaCrown, totalKey: 'totalVIP', availKey: 'availableVIP', color: 'purple' },
    { key: 'Disabled', icon: FaWheelchair, totalKey: 'totalDisabled', availKey: 'availableDisabled', color: 'red' },
  ];

  const priceFields = [
    { label: 'Hourly', key: 'pricePerHour', icon: FaClock },
    { label: 'Daily', key: 'pricePerDay', icon: FaSun },
    { label: 'Weekly', key: 'pricePerWeek', icon: FaCalendarAlt },
    { label: 'Monthly', key: 'pricePerMonth', icon: FaMoneyBillWave },
    { label: 'Night Charge', key: 'nightCharge', icon: FaMoon },
    { label: 'Weekend Charge', key: 'weekendCharge', icon: FaStar },
    { label: 'Peak Hour', key: 'peakHourCharge', icon: FaBolt },
  ];

  const bookingStats = [
    { label: 'Completed', value: parking.completedBookings ?? 12, color: 'bg-gray-500' },
    { label: 'Active', value: parking.activeBookings ?? 5, color: 'bg-gray-500' },
    { label: 'Cancelled', value: parking.cancelledBookings ?? 3, color: 'bg-red-500' },
    { label: 'Pending', value: parking.pendingBookings ?? 2, color: 'bg-gray-500' },
  ];

  const totalBookingsCount = bookingStats.reduce((acc, s) => acc + s.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 dark:bg-gray-800  min-h-screen space-y-6 p-4 md:p-6 lg:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/parking')}
          className="p-2.5 rounded-xl bg-white dark:bg-gray-900   border border-gray-200 dark:border-gray-700  shadow-sm text-gray-600 dark:text-gray-400 dark:text-gray-500  hover:text-gray-500 dark:text-gray-400 dark:text-gray-500  hover:border-gray-200:border-primary-400/30 transition-all"
        >
          <FaArrowLeft className="text-sm" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100  truncate">
            {parking.parkingName || 'Untitled Parking'}
          </h1>
          <StatusBadge status={parking.status} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/parking/${id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-400/25 hover:shadow-primary-400/40 transition-all duration-200"
          >
            <FaEdit className="text-xs" />
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900  border border-red-200/20 text-red-600 hover:bg-red-50:bg-red-500/10 text-sm font-semibold rounded-xl transition-all duration-200"
          >
            <FaTrash className="text-xs" />
            Delete
          </button>
        </div>
      </div>

      {/* Image Slider */}
      {images.length > 0 ? (
        <GlassCard className="overflow-hidden">
          <div className="relative h-56 md:h-80 lg:h-96">
            <img
              src={images[currentImage]}
              alt={`${parking.parkingName} - Image ${currentImage + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white  transition-all"
                >
                  <FaChevronLeft className="text-sm" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white  transition-all"
                >
                  <FaChevronRight className="text-sm" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentImage ? 'bg-white dark:bg-gray-900 scale-110' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/50  text-white text-xs font-medium">
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="h-56 md:h-80 lg:h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800  flex items-center justify-center mx-auto mb-4">
              <FaParking className="text-3xl text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500  font-medium">No images available</p>
          </div>
        </GlassCard>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            <GlassCard className="p-5 hover:shadow-md transition-shadow duration-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent[0.02]  pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100  tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-1 font-semibold uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${statColorMap[stat.color]?.bg || 'bg-gray-100/10'}`}>
                    <stat.icon className={`text-lg ${statColorMap[stat.color]?.text || 'text-primary-400'}`} />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parking Information Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaBuilding} title="Parking Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Name" value={parking.parkingName} />
              <InfoRow label="ID" value={parking.id || parking.id} mono />
              <InfoRow label="Address" value={parking.address} icon={FaMapMarkerAlt} />
              <InfoRow label="City" value={parking.city} />
              <InfoRow label="State" value={parking.state} />
              <InfoRow label="Country" value={parking.country || 'India'} />
              <InfoRow label="ZIP Code" value={parking.zipCode} />
              <InfoRow
                label="Type"
                value={
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50/10 text-primary-400 text-xs font-medium">
                    <FaParking className="text-[10px]" />
                    {parking.parkingType || parking.type || 'Standard'}
                  </span>
                }
              />
              <InfoRow
                label="Status"
                value={
                  <span className="inline-flex items-center">
                    {getStatusDot(parking.status)}
                    <span className="capitalize">{parking.status || 'Unknown'}</span>
                  </span>
                }
              />
              <InfoRow label="Created" value={formatDate(parking.createdAt)} icon={FaCalendarAlt} />
              <InfoRow label="Updated" value={formatDate(parking.updatedAt)} icon={FaClock} />
            </div>
          </GlassCard>

          {/* Description Card */}
          {parking.description && (
            <GlassCard className="p-6">
              <SectionTitle icon={FaQuoteLeft} title="Description" />
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500  leading-relaxed">
                {parking.description}
              </p>
            </GlassCard>
          )}

          {/* Reviews Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaStar} title="Reviews" />
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review, idx) => (
                  <div
                    key={review.id || review.id || idx}
                    className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800  border border-gray-100 dark:border-gray-700/50 "
                  >
                    <div className="flex-shrink-0">
                      {review.user?.avatar || review.avatar ? (
                        <img
                          src={review.user?.avatar || review.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-primary-600 flex items-center justify-center">
                          <FaUserCircle className="text-white text-lg" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100  truncate">
                          {review.user?.name || review.userName || review.name || 'Anonymous'}
                        </span>
                        <StarRating rating={review.rating ?? 5} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500  leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500  mt-1.5">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {reviews.length > 5 && (
                  <Link
                    to="/reviews"
                    className="block text-center text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-primary-400  transition-colors pt-2"
                  >
                    View all {reviews.length} reviews
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800  flex items-center justify-center mx-auto mb-3">
                  <FaStar className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 ">No reviews yet</p>
              </div>
            )}
          </GlassCard>

          {/* Booking Statistics Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaChartBar} title="Booking Statistics" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {bookingStats.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800  border border-gray-100 dark:border-gray-700/50 ">
                  <div className={`w-3 h-3 rounded-full ${stat.color} mx-auto mb-2`} />
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 ">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            {totalBookingsCount > 0 && (
              <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 ">
                {bookingStats.map((stat) => (
                  <div
                    key={stat.label}
                    className={`${stat.color} transition-all duration-500`}
                    style={{ width: `${(stat.value / totalBookingsCount) * 100}%` }}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 ">
                Total: {totalBookingsCount} bookings
              </p>
              <Link
                to={`/bookings?parking=${id}`}
                className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-primary-400  transition-colors"
              >
                View All Bookings
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Owner Details Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaUserTie} title="Owner Details" />
            {parking.owner ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <FaUserTie className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">
                      {parking.owner.name || parking.ownerName || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 ">Owner</p>
                  </div>
                </div>
                {(parking.owner.email || parking.ownerEmail) && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500  text-xs flex-shrink-0" />
                    <span className="truncate">{parking.owner.email || parking.ownerEmail}</span>
                  </div>
                )}
                {(parking.owner.phone || parking.ownerPhone) && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                    <FaPhone className="text-gray-400 dark:text-gray-500  text-xs flex-shrink-0" />
                    <span>{parking.owner.phone || parking.ownerPhone}</span>
                  </div>
                )}
              </div>
            ) : parking.ownerName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <FaUserTie className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">{parking.ownerName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 ">Owner</p>
                  </div>
                </div>
                {parking.ownerEmail && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500  text-xs flex-shrink-0" />
                    <span className="truncate">{parking.ownerEmail}</span>
                  </div>
                )}
                {parking.ownerPhone && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                    <FaPhone className="text-gray-400 dark:text-gray-500  text-xs flex-shrink-0" />
                    <span>{parking.ownerPhone}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800  flex items-center justify-center mx-auto mb-2">
                  <FaUserTie className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 ">Not assigned</p>
              </div>
            )}
          </GlassCard>

          {/* Pricing Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaDollarSign} title="Pricing" />
            <div className="flex flex-wrap gap-2">
              {priceFields.map((pf) => {
                const val = parking[pf.key];
                if (val === null || val === undefined || val === '') return null;
                return (
                  <div
                    key={pf.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800  border border-gray-100 dark:border-gray-700/50  text-sm"
                  >
                    <pf.icon className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-[10px]" />
                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500  text-xs font-medium">{pf.label}:</span>
                    <span className="text-gray-900 dark:text-gray-100  font-semibold text-xs">
                      ₹{Number(val).toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {priceFields.every((pf) => {
                const val = parking[pf.key];
                return val === null || val === undefined || val === '';
              }) && (
                <p className="text-sm text-gray-400 dark:text-gray-500  w-full text-center py-2">
                  No pricing information available
                </p>
              )}
            </div>
          </GlassCard>

          {/* Capacity Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaCar} title="Slot Capacity" />
            <div className="space-y-4">
              {slotTypes.map((slot) => {
                const total = parking[slot.totalKey] ?? 0;
                const avail = parking[slot.availKey] ?? 0;
                if (total === 0 && avail === 0) return null;
                const occupied = Math.max(0, total - avail);
                const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
                return (
                  <div key={slot.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <slot.icon className={`${slotColorClasses[slot.color] || 'text-gray-500'} text-xs`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ">{slot.key}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                        {avail} / {total} available
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800  rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 90
                            ? 'bg-red-500'
                            : pct >= 70
                            ? 'bg-gray-500'
                            : pct >= 40
                            ? 'bg-gray-500'
                            : 'bg-gray-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {slotTypes.every((s) => {
                const total = parking[s.totalKey] ?? 0;
                const avail = parking[s.availKey] ?? 0;
                return total === 0 && avail === 0;
              }) && (
                <p className="text-sm text-gray-400 dark:text-gray-500  text-center py-2">
                  No slot data available
                </p>
              )}
            </div>
          </GlassCard>

          {/* Amenities Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaCheck} title="Amenities" />
            {(() => {
              const activeAmenities = getAmenities(parking.amenities);
              if (activeAmenities.length === 0) {
                return (
                  <p className="text-sm text-gray-400 dark:text-gray-500  text-center py-2">
                    No amenities listed
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-2 gap-2">
                  {activeAmenities.map((key) => {
                    const Icon = amenityIcons[key] || FaCheck;
                    const label = amenityLabels[key] || key;
                    return (
                      <div
                        key={key}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50/5 border border-gray-200/10 text-sm"
                      >
                        <FaCheck className="text-primary-400 text-[10px] flex-shrink-0" />
                        <Icon className="text-primary-400 text-xs flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-xs font-medium truncate">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </GlassCard>

          {/* Map Card */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaMapMarkerAlt} title="Location" />
            {parking.latitude && parking.longitude ? (
              <div>
                <div className="w-full h-44 rounded-xl bg-gray-100 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  flex items-center justify-center mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200[0.02][0.05]" />
                  <div className="relative z-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br bg-primary-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <FaMapMarkerAlt className="text-white text-lg" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  font-mono">
                      {Number(parking.latitude).toFixed(6)}, {Number(parking.longitude).toFixed(6)}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${parking.latitude},${parking.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-primary-400  transition-colors"
                >
                  <FaMapMarkerAlt className="text-xs" />
                  View on Google Maps
                </a>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800  flex items-center justify-center mx-auto mb-2">
                  <FaMapMarkerAlt className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 ">Location coordinates not set</p>
              </div>
            )}
          </GlassCard>

          {/* Action Buttons */}
          <GlassCard className="p-6">
            <SectionTitle icon={FaEye} title="Quick Actions" />
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/parking/${id}/edit`)}
                className="w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-lg shadow-primary-400/25 hover:shadow-primary-400/40 transition-all duration-200"
              >
                <FaEdit className="text-sm" />
                Edit Parking
              </button>
              <button
                onClick={() => navigate(`/parking/${id}/slots`)}
                className="w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700  text-gray-700 dark:text-gray-300  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  text-sm font-semibold transition-all duration-200"
              >
                <FaThLarge className="text-sm" />
                Manage Slots
              </button>
              <button
                onClick={() => navigate(`/parking/${id}/analytics`)}
                className="w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700  text-gray-700 dark:text-gray-300  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  text-sm font-semibold transition-all duration-200"
              >
                <FaChartBar className="text-sm" />
                View Analytics
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
                className="w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700  text-gray-700 dark:text-gray-300  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  text-sm font-semibold transition-all duration-200"
              >
                <FaShare className="text-sm" />
                Share Parking
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete Parking"
        message={`Are you sure you want to delete "${parking.parkingName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        variant="danger"
      />
    </motion.div>
  );
}

const InfoRow = ({ label, value, icon: Icon, mono = false }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">{label}</span>
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="text-gray-400 dark:text-gray-500  text-[10px] flex-shrink-0" />}
      <span
        className={`text-sm text-gray-900 dark:text-gray-100  ${
          mono ? 'font-mono text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ' : 'font-medium'
        }`}
      >
        {value || '-'}
      </span>
    </div>
  </div>
);
