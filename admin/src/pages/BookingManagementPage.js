import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaSearch, FaFilter, FaSyncAlt, FaFileCsv, FaFilePdf,
  FaEye, FaTimes, FaCheck, FaExclamationTriangle, FaCalendarAlt,
  FaUser, FaParking, FaCreditCard, FaClock, FaMapMarkerAlt,
  FaCar, FaEnvelope, FaPhone, FaHashtag, FaTimesCircle, FaCheckCircle,
} from 'react-icons/fa';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const bookingStatusConfig = {
  upcoming: { label: 'Upcoming', color: 'bg-gray-100/15 text-gray-700 dark:text-gray-300  border border-gray-200/50/20', icon: FaClock },
  active: { label: 'Active', color: 'bg-gray-100/15 text-gray-600 dark:text-gray-400 dark:text-gray-500 border border-gray-200/50/20', icon: FaCheckCircle },
  completed: { label: 'Completed', color: 'bg-gray-200/15 text-gray-600 dark:text-gray-400 dark:text-gray-500  border border-gray-300/50/20', icon: FaCheck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100/15 text-red-700 border border-red-200/50/20', icon: FaTimesCircle },
  pending: { label: 'Pending', color: 'bg-gray-100/15 text-gray-600 dark:text-gray-400 dark:text-gray-500 border border-gray-200/50/20', icon: FaClock },
  confirmed: { label: 'Confirmed', color: 'bg-gray-100/15 text-gray-700 dark:text-gray-300  border border-gray-200/50/20', icon: FaCheckCircle },
};

const paymentStatusConfig = {
  paid: { label: 'Paid', color: 'bg-gray-100/15 text-gray-600' },
  pending: { label: 'Pending', color: 'bg-gray-100/15 text-gray-600' },
  failed: { label: 'Failed', color: 'bg-red-100/15 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100/15 text-gray-700 dark:text-gray-300 ' },
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
    let current = 0;
    const step = Math.max(1, Math.floor(num / 25));
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setDisplay(num); clearInterval(timer); } else setDisplay(current);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

function DetailRow({ icon: Icon, label, value, dark = false }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className={`text-sm mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500 '}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100  mt-0.5 truncate">{value || '-'}</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700/50 ">
      {[...Array(9)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded-lg animate-pulse" style={{ width: i === 0 ? '70px' : '60%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detailModal, setDetailModal] = useState({ open: false, booking: null });
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings();
      const data = res.data?.data || res.data || [];
      const list = (Array.isArray(data) ? data : []).map((b) => ({
        ...b,
        id: b.id,
        status: b.bookingStatus || b.status || 'upcoming',
        customerName: b.customerName || b.User?.name || b.customer?.name || '',
        customerEmail: b.customerEmail || b.User?.email || b.customer?.email || '',
        parkingName: b.parkingName || b.Parking?.parkingName || b.parking?.parkingName || '',
        slotName: b.slotName || b.Slot?.slotNumber || b.slot?.slotNumber || '',
        amount: Number(b.totalAmount || b.amount || 0),
        paymentStatus: b.paymentStatus || b.Payment?.status || b.payment?.status || 'pending',
        paymentMethod: b.paymentMethod || b.Payment?.paymentMethod || b.payment?.paymentMethod || '',
      }));
      setBookings(list);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Failed to load bookings');
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const id = String(b.bookingId || b.id || '').toLowerCase();
        const customer = (b.customerName || b.customer?.name || '').toLowerCase();
        const parking = (b.parkingName || b.parking?.name || '').toLowerCase();
        if (!id.includes(q) && !customer.includes(q) && !parking.includes(q)) return false;
      }
      if (dateFrom && b.createdAt && new Date(b.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && b.createdAt) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(b.createdAt) > end) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, dateFrom, dateTo]);

  const computedStats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'active').length;
    const upcoming = bookings.filter(b => b.status === 'upcoming' || b.status === 'pending' || b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return { total, active, upcoming, completed, cancelled };
  }, [bookings]);

  const statCards = [
    { label: 'Total Bookings', value: computedStats.total, icon: FaHashtag, gradient: 'bg-gray-700' },
    { label: 'Active', value: computedStats.active, icon: FaCheckCircle, gradient: 'bg-primary-400' },
    { label: 'Upcoming', value: computedStats.upcoming, icon: FaClock, gradient: 'bg-primary-400' },
    { label: 'Completed', value: computedStats.completed, icon: FaCheck, gradient: 'bg-primary-400' },
    { label: 'Cancelled', value: computedStats.cancelled, icon: FaTimesCircle, gradient: 'bg-red-600' },
  ];

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    try {
      await adminService.cancelBooking(cancelTarget.id || cancelTarget.id);
      setBookings(prev => prev.map(b => (b.id === cancelTarget.id || b.id === cancelTarget.id) ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled successfully');
      if (detailModal.booking && (detailModal.booking.id === cancelTarget.id)) {
        setDetailModal(prev => ({ ...prev, booking: { ...prev.booking, status: 'cancelled' } }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelConfirmOpen(false);
      setCancelTarget(null);
    }
  };

  const handleCompleteBooking = async () => {
    if (!completeTarget) return;
    try {
      setBookings(prev => prev.map(b => (b.id === completeTarget.id || b.id === completeTarget.id) ? { ...b, status: 'completed' } : b));
      toast.success('Booking marked as completed');
      if (detailModal.booking && (detailModal.booking.id === completeTarget.id)) {
        setDetailModal(prev => ({ ...prev, booking: { ...prev.booking, status: 'completed' } }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete booking');
    } finally {
      setCompleteConfirmOpen(false);
      setCompleteTarget(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Customer', 'Email', 'Parking', 'Slot', 'Amount', 'Payment Status', 'Booking Status', 'Date'];
    const rows = filtered.map(b => [
      b.bookingId || b.id,
      b.customerName || b.customer?.name || '',
      b.customerEmail || b.customer?.email || '',
      b.parkingName || b.parking?.name || '',
      b.slotName || b.slot?.slotNumber || b.slotNumber || '',
      b.amount || 0,
      b.paymentStatus || b.payment?.status || '',
      b.status || '',
      b.createdAt || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bookings.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handleExportPDF = () => {
    toast.info('PDF export feature coming soon');
  };

  const canCancel = (b) => ['upcoming', 'pending', 'confirmed', 'active'].includes(b?.status);
  const canComplete = (b) => ['active'].includes(b?.status);

  const hasActiveFilters = search || statusFilter !== 'all' || dateFrom || dateTo;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Booking Management"
        subtitle="View, manage, and track all parking bookings across the platform"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Bookings' },
        ]}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card p-5 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent[0.02]  pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.gradient} flex items-center justify-center shadow-lg`}>
                  <s.icon className="text-white text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100  tracking-tight">
                <AnimatedNumber value={s.value} />
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="glass-card">
        <div className="p-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500  text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search by ID, customer, or parking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400 dark:text-gray-500  text-sm" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select-field w-44"
              >
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400 dark:text-gray-500  text-sm" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field w-40"
                title="From date"
              />
              <span className="text-gray-400 dark:text-gray-500  text-sm">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field w-40"
                title="To date"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={fetchBookings} className="btn-outline">
                <FaSyncAlt className="text-xs" /> Refresh
              </button>
              <button onClick={handleExportCSV} className="btn-outline">
                <FaFileCsv className="text-xs" /> CSV
              </button>
              <button onClick={handleExportPDF} className="btn-outline">
                <FaFilePdf className="text-xs" /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 ">
                {['Booking ID', 'Customer', 'Parking', 'Slot', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100/10 flex items-center justify-center">
                        <FaParking className="text-2xl text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">No bookings found</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  max-w-sm">
                        {hasActiveFilters ? 'Try adjusting your search or filters.' : 'No bookings have been made yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => {
                  const bStatus = bookingStatusConfig[booking.status] || bookingStatusConfig.pending;
                  const pStatus = paymentStatusConfig[booking.paymentStatus || booking.payment?.status] || paymentStatusConfig.pending;
                  const bId = String(booking.bookingId || booking.id || '');
                  const shortId = bId.length > 10 ? bId.slice(-8) : bId;
                  return (
                    <motion.tr
                      key={booking.id || booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-primary-400" title={bId}>
                          {shortId || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                            {booking.customerName || booking.customer?.name || '-'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  truncate max-w-[150px]">
                            {booking.customerEmail || booking.customer?.email || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                            {booking.parkingName || booking.parking?.name || '-'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                            {booking.parkingCity || booking.parking?.city || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                          {booking.slotName || booking.slot?.slotNumber || booking.slotNumber || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">
                          {formatCurrency(booking.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${pStatus.color}`}>
                          {(booking.paymentStatus || booking.payment?.status || 'pending').charAt(0).toUpperCase() + (booking.paymentStatus || booking.payment?.status || 'pending').slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${bStatus.color}`}>
                          <bStatus.icon className="text-[10px]" />
                          {bStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 ">{formatDate(booking.createdAt)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetailModal({ open: true, booking })}
                            className="p-2 text-primary-400 hover:bg-gray-50:bg-gray-500/10 rounded-lg transition"
                            title="View Details"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          {canCancel(booking) && (
                            <button
                              onClick={() => { setCancelTarget(booking); setCancelConfirmOpen(true); }}
                              className="p-2 text-red-600 hover:bg-red-50:bg-red-500/10 rounded-lg transition"
                              title="Cancel Booking"
                            >
                              <FaTimes className="text-sm" />
                            </button>
                          )}
                          {canComplete(booking) && (
                            <button
                              onClick={() => { setCompleteTarget(booking); setCompleteConfirmOpen(true); }}
                              className="p-2 text-primary-400 hover:bg-gray-50:bg-gray-500/10 rounded-lg transition"
                              title="Complete Booking"
                            >
                              <FaCheck className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700  bg-gray-50/50[0.02]">
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
              Showing <span className="font-semibold text-gray-900 dark:text-gray-100 ">{filtered.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100 ">{bookings.length}</span> bookings
            </p>
          </div>
        )}
      </motion.div>

      {/* View Details Modal */}
      <Modal isOpen={detailModal.open} onClose={() => setDetailModal({ open: false, booking: null })} title="Booking Details" size="lg">
        {detailModal.booking && (() => {
          const b = detailModal.booking;
          const bStatus = bookingStatusConfig[b.status] || bookingStatusConfig.pending;
          const pStatus = paymentStatusConfig[b.paymentStatus || b.payment?.status] || paymentStatusConfig.pending;
          return (
            <div className="space-y-6">
              {/* Booking Status Banner */}
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                b.status === 'cancelled' ? 'bg-red-50/5 border border-red-200/10' :
                b.status === 'completed' ? 'bg-gray-50/5 border border-gray-200/10' :
                b.status === 'active' ? 'bg-gray-50/5 border border-gray-200/10' :
                'bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700 '
              }`}>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${bStatus.color}`}>
                  <bStatus.icon className="text-xs" />
                  {bStatus.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                  Booking ID: <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 ">{b.bookingId || b.id}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Information */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Booking Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-200 dark:border-gray-700  divide-y divide-gray-200">
                    <DetailRow icon={FaHashtag} label="Booking ID" value={b.bookingId || b.id} />
                    <DetailRow icon={FaCalendarAlt} label="Created" value={formatDateTime(b.createdAt)} />
                    <DetailRow icon={FaClock} label="Start Time" value={b.startTime || '-'} />
                    <DetailRow icon={FaClock} label="End Time" value={b.endTime || '-'} />
                    <DetailRow icon={FaCar} label="Vehicle Number" value={b.vehicleNumber || b.vehicle?.number || '-'} />
                    <DetailRow icon={FaCreditCard} label="Total Amount" value={formatCurrency(b.amount)} dark />
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-200 dark:border-gray-700  divide-y divide-gray-200">
                    <DetailRow icon={FaUser} label="Name" value={b.customerName || b.customer?.name || '-'} />
                    <DetailRow icon={FaEnvelope} label="Email" value={b.customerEmail || b.customer?.email || '-'} />
                    <DetailRow icon={FaPhone} label="Phone" value={b.customerPhone || b.customer?.phone || '-'} />
                  </div>
                </div>

                {/* Parking Information */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Parking Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-200 dark:border-gray-700  divide-y divide-gray-200">
                    <DetailRow icon={FaParking} label="Parking Name" value={b.parkingName || b.parking?.name || '-'} />
                    <DetailRow icon={FaMapMarkerAlt} label="Address" value={b.parkingAddress || b.parking?.address || '-'} />
                    <DetailRow icon={FaCar} label="Slot" value={b.slotName || b.slot?.slotNumber || b.slotNumber || '-'} />
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Payment Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-200 dark:border-gray-700  divide-y divide-gray-200">
                    <DetailRow icon={FaCreditCard} label="Payment Status" value={
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${pStatus.color}`}>
                        {(b.paymentStatus || b.payment?.status || 'pending').charAt(0).toUpperCase() + (b.paymentStatus || b.payment?.status || 'pending').slice(1)}
                      </span>
                    } />
                    <DetailRow icon={FaCreditCard} label="Payment Method" value={b.paymentMethod || b.payment?.method || '-'} />
                    <DetailRow icon={FaHashtag} label="Transaction ID" value={b.transactionId || b.payment?.transactionId || '-'} />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Timeline
                </h4>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700  rounded-full" />
                  {[
                    { label: 'Booking Created', date: b.createdAt, color: 'bg-gray-500' },
                    ...(b.status === 'cancelled' ? [{ label: 'Cancelled', date: b.updatedAt, color: 'bg-red-500' }] : []),
                    ...(b.status === 'completed' ? [{ label: 'Completed', date: b.updatedAt, color: 'bg-gray-500' }] : []),
                  ].map((event, i) => (
                    <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
                      <div className={`absolute left-[-18px] w-3 h-3 rounded-full ${event.color} ring-2 ring-white`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{event.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{formatDateTime(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ">
                {canCancel(b) && (
                  <button
                    onClick={() => { setDetailModal({ open: false, booking: null }); setCancelTarget(b); setCancelConfirmOpen(true); }}
                    className="btn-danger"
                  >
                    <FaTimes className="text-xs" /> Cancel Booking
                  </button>
                )}
                {canComplete(b) && (
                  <button
                    onClick={() => { setDetailModal({ open: false, booking: null }); setCompleteTarget(b); setCompleteConfirmOpen(true); }}
                    className="btn-primary"
                  >
                    <FaCheck className="text-xs" /> Mark Completed
                  </button>
                )}
                <button onClick={() => setDetailModal({ open: false, booking: null })} className="btn-ghost ml-auto">
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        title="Cancel Booking"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to cancel this booking?</p>
            {cancelTarget && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                  Booking: <strong className="text-gray-900 dark:text-gray-100  font-mono">{cancelTarget.bookingId || String(cancelTarget.id).slice(-8)}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                  Customer: <strong className="text-gray-900 dark:text-gray-100 ">{cancelTarget.customerName || cancelTarget.customer?.name}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                  Amount: <strong className="text-gray-900 dark:text-gray-100 ">{formatCurrency(cancelTarget.amount)}</strong>
                </p>
              </div>
            )}
          </div>
        }
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        onConfirm={handleCancelBooking}
        onCancel={() => { setCancelConfirmOpen(false); setCancelTarget(null); }}
        variant="danger"
      />

      {/* Complete Confirmation */}
      <ConfirmDialog
        isOpen={completeConfirmOpen}
        title="Complete Booking"
        message={
          <div className="space-y-2">
            <p>Mark this booking as completed?</p>
            {completeTarget && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                  Booking: <strong className="text-gray-900 dark:text-gray-100  font-mono">{completeTarget.bookingId || String(completeTarget.id).slice(-8)}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                  Customer: <strong className="text-gray-900 dark:text-gray-100 ">{completeTarget.customerName || completeTarget.customer?.name}</strong>
                </p>
              </div>
            )}
          </div>
        }
        confirmText="Mark Completed"
        cancelText="Cancel"
        onConfirm={handleCompleteBooking}
        onCancel={() => { setCompleteConfirmOpen(false); setCompleteTarget(null); }}
        variant="info"
      />
    </motion.div>
  );
}
