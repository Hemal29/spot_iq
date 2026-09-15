import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaSync,
  FaPlus,
  FaEye,
  FaPencilAlt,
  FaTrash,
  FaMapMarkerAlt,
  FaCar,
  FaBolt,
  FaStar,
  FaDollarSign,
  FaUsers,
  FaTh,
  FaImage,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaMap,
  FaCalendar,
  FaCreditCard,
  FaMotorcycle,
  FaShieldAlt,
  FaAward,
  FaWheelchair,
  FaParking,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';

const AnimatedCounter = ({ value, duration = 1500, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const animationFrame = useRef(null);

  useEffect(() => {
    startTime.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };
    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-xl p-6 bg-gray-200 dark:bg-gray-700  h-32"
        />
      ))}
    </div>
    <div className="glass-card rounded-xl p-6 bg-gray-200 dark:bg-gray-700  h-16" />
    <div className="glass-card rounded-xl bg-gray-200 dark:bg-gray-700  h-96" />
  </div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card rounded-xl p-16 text-center"
  >
    <FaParking className="mx-auto text-6xl text-gray-300 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300  mb-2">
      No Parking Locations Found
    </h3>
    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-6">
      Try adjusting your search or filters, or add a new parking location.
    </p>
    <Link
      to="/parking/add"
      className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg"
    >
      <FaPlus /> Add Parking Location
    </Link>
  </motion.div>
);

const ParkingManagementPage = () => {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    parking: null,
  });
  const [cities, setCities] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [parkingsRes, statsRes] = await Promise.all([
        adminService.getParkings(),
        adminService.getDashboardStats(),
      ]);
      const parkingsData = Array.isArray(parkingsRes.data?.data)
        ? parkingsRes.data.data
        : Array.isArray(parkingsRes.data)
          ? parkingsRes.data
          : [];
      setParkings(parkingsData);
      const sd = statsRes.data?.data || statsRes.data || {};
      setStats({
        totalParkings: sd.parkings?.total ?? 0,
        activeParkings: sd.parkings?.total ?? 0,
        maintenanceParkings: 0,
        totalCapacity: sd.slots?.total ?? 0,
        totalOccupied: sd.slots?.occupied ?? 0,
        totalAvailable: sd.slots?.available ?? 0,
        totalRevenue: sd.revenue?.total ?? 0,
        avgRating: 0,
      });
      const uniqueCities = [...new Set(parkingsData.map((p) => p.city).filter(Boolean))];
      setCities(uniqueCities);
    } catch (error) {
      toast.error('Failed to load parking data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (parking) => {
    try {
      await adminService.deleteParking(parking.id);
      toast.success(`${parking.parkingName} deleted successfully`);
      setParkings((prev) => prev.filter((p) => p.id !== parking.id));
      setDeleteDialog({ open: false, parking: null });
    } catch (error) {
      toast.error('Failed to delete parking location');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'ID',
      'City',
      'Address',
      'Capacity',
      'Available',
      'Occupied',
      'Price/hr',
      'Rating',
      'Status',
    ];
    const rows = filteredParkings.map((p) => [
      p.parkingName,
      p.id,
      p.city,
      p.address,
      Number(p.totalSlots) || 0,
      Number(p.availableSlots) || 0,
      Number(p.totalSlots) - Number(p.availableSlots) || 0,
      p.pricePerHour,
      p.rating,
      p.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parking-locations.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredParkings = parkings
    .filter((p) => {
      const matchesSearch =
        p.parkingName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCity = cityFilter === 'all' || p.city === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.parkingName || '').localeCompare(b.parkingName || '');
        case 'revenue':
          return (b.revenue || 0) - (a.revenue || 0);
        case 'createdAt':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

  const statCards = stats
    ? [
        {
          label: 'Total Locations',
          value: stats.totalParkings || 0,
          icon: <FaMapMarkerAlt />,
          gradient: 'bg-primary-600',
        },
        {
          label: 'Active',
          value: stats.activeParkings || 0,
          icon: <FaCheckCircle />,
          gradient: 'from-green-500 to-green-700',
        },
        {
          label: 'Maintenance',
          value: stats.maintenanceParkings || 0,
          icon: <FaExclamationTriangle />,
          gradient: 'from-yellow-500 to-gray-700',
        },
        {
          label: 'Total Capacity',
          value: stats.totalCapacity || 0,
          icon: <FaTh />,
          gradient: 'from-purple-500 to-purple-700',
        },
        {
          label: 'Occupied',
          value: stats.totalOccupied || 0,
          icon: <FaCar />,
          gradient: 'from-red-500 to-red-700',
        },
        {
          label: 'Available',
          value: stats.totalAvailable || 0,
          icon: <FaCheckCircle />,
          gradient: 'bg-primary-500',
        },
        {
          label: 'Total Revenue',
          value: stats.totalRevenue || 0,
          icon: <FaDollarSign />,
          gradient: 'from-emerald-500 to-emerald-700',
          prefix: '$',
        },
        {
          label: 'Avg Rating',
          value: stats.avgRating || 0,
          icon: <FaStar />,
          gradient: 'from-amber-500 to-amber-700',
          suffix: '/5',
        },
      ]
    : [];

  const getVehicleTypeIcons = (types) => {
    if (!types || !Array.isArray(types)) return null;
    return (
      <div className="flex gap-1 flex-wrap">
        {types.includes('car') && (
          <FaCar className="text-gray-500 dark:text-gray-400" title="Car" size={14} />
        )}
        {types.includes('bike') && (
          <FaMotorcycle className="text-primary-400" title="Bike" size={14} />
        )}
        {(types.includes('ev') || types.includes('electric')) && (
          <FaBolt className="text-primary-400" title="EV" size={14} />
        )}
        {types.includes('vip') && (
          <FaAward className="text-primary-400" title="VIP" size={14} />
        )}
        {(types.includes('handicap') || types.includes('disabled')) && (
          <FaWheelchair className="text-gray-400 dark:text-gray-500" title="Handicap" size={14} />
        )}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      active:
        'bg-gray-100 dark:bg-gray-800 text-gray-700/30',
      closed:
        'bg-red-100 text-red-800/30',
      maintenance:
        'bg-gray-100 dark:bg-gray-800 text-gray-700/30',
      full: 'bg-gray-100 dark:bg-gray-800 text-gray-800/30 ',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          styles[status] || styles.active
        }`}
      >
        {status}
      </span>
    );
  };

  const getOccupancyColor = (occupied, total) => {
    if (!total) return 'bg-gray-400';
    const pct = (occupied / total) * 100;
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-gray-500';
    return 'bg-gray-500';
  };

  const getAvailabilityColor = (available, total) => {
    if (!total) return 'text-gray-500';
    const pct = (available / total) * 100;
    if (pct <= 10) return 'text-red-600 font-semibold';
    if (pct <= 30) return 'text-primary-400';
    return 'text-primary-400';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={i}
          size={12}
          className={
            i < fullStars
              ? 'text-primary-400 fill-yellow-400'
              : 'text-gray-300'
          }
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Parking Management"
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Parking Management' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-3">
        <PageHeader
          title="Parking Management"
          breadcrumbs={[]}
          action={
            <Link
              to="/parking/add"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <FaPlus /> Add Parking
            </Link>
          }
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-3 text-white shadow-lg`}
          >
            <div className="absolute top-2 right-2 opacity-20 text-3xl">
              {card.icon}
            </div>
            <p className="text-xs font-medium opacity-90">{card.label}</p>
            <p className="text-xl font-bold mt-0.5">
              <AnimatedCounter
                value={card.value}
                prefix={card.prefix || ''}
                suffix={card.suffix || ''}
              />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search & Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, city, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-9 pr-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-field px-2 py-2 rounded-lg text-xs"
          >
            <option value="createdAt">Date</option>
            <option value="name">Name</option>
            <option value="revenue">Revenue</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs">
            <FaFilter /> Filters {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <button onClick={handleExportCSV} className="btn-ghost inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs">
            <FaDownload /> Export
          </button>
          <button onClick={handlePrint} className="btn-ghost inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs">
            <FaPrint /> Print
          </button>
          <button onClick={fetchData} className="btn-ghost inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs">
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex gap-3 items-end p-3 rounded-xl glass-card ">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500  mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-full px-2 py-2 rounded-lg text-sm">
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="full">Full</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500  mb-1">City</label>
                <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="select-field w-full px-2 py-2 rounded-lg text-sm">
                  <option value="all">All Cities</option>
                  {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Table */}
      {filteredParkings.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl  overflow-hidden flex-1 flex flex-col"
        >
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 ">
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Image
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Name
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Owner
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    City
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Address
                  </th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Slots
                  </th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Occupied
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Price/hr
                  </th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Rating
                  </th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Status
                  </th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 ">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParkings.map((parking, idx) => {
                  const occupied =
                    (parking.totalSlots || 0) - (parking.availableSlots || 0);
                  const occupancyPct = parking.totalSlots
                    ? Math.round((occupied / parking.totalSlots) * 100)
                    : 0;

                  return (
                    <motion.tr
                      key={parking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-gray-100 dark:border-gray-700/50  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition-colors"
                    >
                      <td className="px-3 py-2">
                        {parking.image || parking.images?.[0] ? (
                          <img
                            src={parking.image || parking.images[0]}
                            alt={parking.parkingName}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700  flex items-center justify-center">
                            <FaImage className="text-gray-400 dark:text-gray-500" size={12} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          to={`/parking/${parking.id}`}
                          className="text-primary-400 hover:underline font-medium"
                        >
                          {parking.parkingName || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300 ">
                        {parking.ownerName || parking.owner?.name || 'N/A'}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 ">
                          <FaMapMarkerAlt size={10} />
                          {parking.city || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400 dark:text-gray-500  max-w-[140px] truncate">
                        {parking.address || 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300 ">
                        {parking.availableSlots ?? 0}/{parking.totalSlots || 0}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700  rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getOccupancyColor(occupied, parking.totalSlots)}`}
                              style={{ width: `${occupancyPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500  w-7 text-right">
                            {occupancyPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex items-center gap-0.5 font-medium text-gray-700 dark:text-gray-300 ">
                          <FaDollarSign size={10} />
                          {parking.pricePerHour || 0}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col items-center gap-0">
                          {renderStars(parking.rating)}
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                            {Number(parking.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(parking.status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-0.5">
                          <Link
                            to={`/parking/${parking.id}`}
                            className="p-1 rounded-md hover:bg-gray-50:bg-gray-900/20 text-primary-400 transition-colors"
                            title="View"
                          >
                            <FaEye size={12} />
                          </Link>
                          <Link
                            to={`/parking/edit/${parking.id}`}
                            className="p-1 rounded-md hover:bg-gray-50:bg-gray-900/20 text-primary-400 transition-colors"
                            title="Edit"
                          >
                            <FaPencilAlt size={12} />
                          </Link>
                          <Link
                            to={`/parking/${parking.id}/slots`}
                            className="p-1 rounded-md hover:bg-gray-50:bg-gray-900/20 text-primary-400 transition-colors"
                            title="Slots"
                          >
                            <FaTh size={12} />
                          </Link>
                          <Link
                            to={`/parking/${parking.id}/analytics`}
                            className="p-1 rounded-md hover:bg-gray-50:bg-gray-900/20 text-primary-400 transition-colors"
                            title="Analytics"
                          >
                            <FaChartBar size={12} />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteDialog({ open: true, parking })
                            }
                            className="p-1 rounded-md hover:bg-red-50:bg-red-900/20 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700  text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
            Showing {filteredParkings.length} of {parkings.length} parking locations
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, parking: null })}
        onConfirm={() => handleDelete(deleteDialog.parking)}
        title="Delete Parking Location"
        message={`Are you sure you want to delete "${deleteDialog.parking?.parkingName}"? This action cannot be undone and will remove all associated data including slots, bookings, and analytics.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ParkingManagementPage;
