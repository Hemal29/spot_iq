import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaParking, FaPlus, FaSearch, FaFilter, FaSortAmountDown,
  FaFileExport, FaPrint, FaSyncAlt, FaTrash, FaEdit,
  FaEye, FaThLarge, FaChartBar, FaImages, FaCheck, FaTimes,
  FaChevronLeft, FaChevronRight, FaStar, FaMapMarkerAlt,
  FaBuilding, FaCity, FaCar, FaMotorcycle, FaBolt,
  FaCrown, FaWheelchair, FaDollarSign, FaClock,
} from 'react-icons/fa';

const AnimatedCounter = ({ value, duration = 2000, prefix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{prefix}{decimals > 0 ? Number(count).toFixed(decimals) : Math.floor(count).toLocaleString()}</span>;
};

const statCards = [
  { key: 'totalParkings', label: 'Total Locations', icon: FaBuilding, gradient: 'from-blue-500 to-blue-600' },
  { key: 'activeParkings', label: 'Active', icon: FaCheck, gradient: 'from-green-500 to-green-600' },
  { key: 'underMaintenance', label: 'Maintenance', icon: FaClock, gradient: 'from-orange-500 to-orange-600' },
  { key: 'totalCapacity', label: 'Total Capacity', icon: FaCar, gradient: 'from-purple-500 to-purple-600' },
  { key: 'occupiedSlots', label: 'Occupied', icon: FaParking, gradient: 'from-red-500 to-red-600' },
  { key: 'availableSlots', label: 'Available', icon: FaMotorcycle, gradient: 'from-teal-500 to-teal-600' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: FaDollarSign, gradient: 'from-yellow-500 to-yellow-600' },
  { key: 'avgRating', label: 'Avg Rating', icon: FaStar, gradient: 'from-pink-500 to-pink-600' },
];

export default function ParkingManagementPage() {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const searchInputRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminService.getDashboardStats();
      setStats(res.data || {});
    } catch (err) {
      console.error('Failed to load stats');
    }
  }, []);

  const fetchParkings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, sortBy };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (cityFilter) params.city = cityFilter;
      const res = await adminService.getParkings(params);
      const data = res.data?.data || res.data || [];
      setParkings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load parkings');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, cityFilter, sortBy]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchParkings();
  }, [fetchParkings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchParkings(), fetchStats()]);
    setTimeout(() => setRefreshing(false), 500);
    toast.success('Data refreshed');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget._id || deleteTarget.id;
    try {
      await adminService.deleteParking(targetId);
      setParkings((prev) => prev.filter((p) => (p._id || p.id) !== targetId));
      toast.success('Parking deleted successfully');
    } catch (err) {
      toast.error('Failed to delete parking');
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const exportCSV = () => {
    if (parkings.length === 0) {
      toast.warning('No data to export');
      return;
    }
    const headers = ['Name', 'ID', 'City', 'Address', 'Capacity', 'Available', 'Price/hr', 'Rating', 'Status', 'Created'];
    const rows = parkings.map((p) => [
      `${p.parkingName || ''}`,
      p._id || p.id || '',
      p.city || '',
      `${p.address || ''}`,
      p.totalSlots ?? 0,
      p.availableSlots ?? 0,
      p.pricePerHour ?? 0,
      p.rating ?? '',
      p.status || '',
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parkings.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCityFilter('');
    setSortBy('date');
  };

  const hasActiveFilters = search || statusFilter !== 'all' || cityFilter;

  const columns = useMemo(() => [
    {
      key: 'images',
      label: 'Image',
      sortable: false,
      width: '70px',
      render: (row) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
          {row.images && row.images.length > 0 ? (
            <img
              src={row.images[0]}
              alt={row.parkingName || ''}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {(!row.images || row.images.length === 0) && (
            <FaParking className="text-gray-400 dark:text-gray-500 text-sm" />
          )}
        </div>
      ),
    },
    {
      key: 'parkingName',
      label: 'Name',
      render: (row) => (
        <Link
          to={`/parking/${row._id || row.id}`}
          className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          {row.parkingName || 'Untitled'}
        </Link>
      ),
    },
    {
      key: 'id',
      label: 'ID',
      width: '90px',
      render: (row) => (
        <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
          {(row._id || row.id || '').slice(-8)}
        </span>
      ),
    },
    {
      key: 'ownerName',
      label: 'Owner',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.ownerName || '-'}
        </span>
      ),
    },
    {
      key: 'city',
      label: 'City',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
          <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 text-[10px]" />
          {row.city || '-'}
        </span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (row) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-[140px] block" title={row.address}>
          {row.address || '-'}
        </span>
      ),
    },
    {
      key: 'vehicleTypes',
      label: 'Types',
      sortable: false,
      width: '100px',
      render: (row) => {
        const types = row.vehicleTypes || [];
        const icons = [];
        if (types.some((t) => /car/i.test(t))) icons.push(<FaCar key="car" className="text-blue-500 dark:text-blue-400" title="Car" />);
        if (types.some((t) => /bike|motorcycle|motor/i.test(t))) icons.push(<FaMotorcycle key="bike" className="text-green-500 dark:text-green-400" title="Bike" />);
        if (types.some((t) => /ev|electric/i.test(t))) icons.push(<FaBolt key="ev" className="text-yellow-500 dark:text-yellow-400" title="EV" />);
        if (types.some((t) => /vip|premium/i.test(t))) icons.push(<FaCrown key="vip" className="text-purple-500 dark:text-purple-400" title="VIP" />);
        if (types.some((t) => /disabled|handicap|wheelchair/i.test(t))) icons.push(<FaWheelchair key="disabled" className="text-red-500 dark:text-red-400" title="Disabled" />);
        return icons.length > 0 ? (
          <div className="flex items-center gap-1.5">{icons}</div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
        );
      },
    },
    {
      key: 'totalSlots',
      label: 'Capacity',
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
          {row.totalSlots ?? 0} <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">slots</span>
        </span>
      ),
    },
    {
      key: 'availableSlots',
      label: 'Available',
      render: (row) => {
        const avail = row.availableSlots ?? 0;
        return (
          <span className={`font-semibold text-sm ${avail > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {avail}
          </span>
        );
      },
    },
    {
      key: 'occupied',
      label: 'Occupied',
      sortable: false,
      render: (row) => {
        const total = row.totalSlots ?? 0;
        const avail = row.availableSlots ?? 0;
        const occupied = Math.max(0, total - avail);
        const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{occupied}</span>
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'pricePerHour',
      label: 'Price/hr',
      render: (row) => (
        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
          ₹{row.pricePerHour ?? 0}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
          <FaStar className="text-yellow-400 text-[10px]" />
          {row.rating ? Number(row.rating).toFixed(1) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: '200px',
      render: (row) => (
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/parking/${row._id || row.id}`); }}
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="View details"
          >
            <FaEye className="text-xs" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/parking/${row._id || row.id}/edit`); }}
            className="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/parking/${row._id || row.id}/slots`); }}
            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Manage slots"
          >
            <FaThLarge className="text-xs" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/parking/${row._id || row.id}/gallery`); }}
            className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Gallery"
          >
            <FaImages className="text-xs" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/parking/${row._id || row.id}/analytics`); }}
            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Analytics"
          >
            <FaChartBar className="text-xs" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); setConfirmOpen(true); }}
            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Delete"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Parking Management"
        subtitle="Manage all parking locations across the platform"
        action={
          <button
            onClick={() => navigate('/parking/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:shadow-xl transition-all duration-200"
          >
            <FaPlus className="text-xs" />
            Add Parking
          </button>
        }
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Parking Management' },
        ]}
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 p-5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-50/50 dark:to-white/[0.02] rounded-bl-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-current/20`}>
                  <stat.icon className="text-white text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {stat.key === 'totalRevenue' && (
                  <AnimatedCounter value={stats[stat.key] ?? 0} prefix="₹" decimals={2} />
                )}
                {stat.key === 'avgRating' && (
                  <AnimatedCounter value={stats[stat.key] ?? 0} decimals={1} />
                )}
                {stat.key !== 'totalRevenue' && stat.key !== 'avgRating' && (
                  <AnimatedCounter value={stats[stat.key] ?? 0} />
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            <div className="relative flex-1 w-full lg:max-w-md">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, city, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  hasActiveFilters
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                    : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                <FaFilter className="text-xs" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>
              <button
                onClick={() => setSortBy((prev) => (prev === 'name' ? 'date' : prev === 'date' ? 'revenue' : 'name'))}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              >
                <FaSortAmountDown className="text-xs" />
                <span className="hidden sm:inline">{sortBy === 'name' ? 'Name' : sortBy === 'date' ? 'Date' : 'Revenue'}</span>
              </button>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              >
                <FaFileExport className="text-xs" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              >
                <FaPrint className="text-xs" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSyncAlt className={`text-xs ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="Filter by city..."
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {loading && parkings.length === 0 ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded-lg mb-3" />
                  <div className="h-8 w-20 bg-gray-200 dark:bg-white/10 rounded-lg mb-2" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : parkings.length === 0 && !loading ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <EmptyState
              icon={FaParking}
              title="No parking locations found"
              description="Get started by adding your first parking location to the platform."
              actionText="Add Parking"
              onAction={() => navigate('/parking/add')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DataTable
              columns={columns}
              data={parkings}
              loading={loading}
              emptyMessage="No parking locations match your filters"
              pageSize={10}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Parking"
        message={`Are you sure you want to delete "${deleteTarget?.parkingName || 'this parking location'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        variant="danger"
      />
    </motion.div>
  );
}
