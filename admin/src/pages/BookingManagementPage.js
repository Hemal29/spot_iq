import { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import adminService from '../services/adminService';
import { FaSearch, FaFilter } from 'react-icons/fa';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await adminService.getAllBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await adminService.cancelBooking(cancelTarget._id);
      setBookings((prev) =>
        prev.map((b) => (b._id === cancelTarget._id ? { ...b, status: 'cancelled' } : b))
      );
      if (selectedBooking?._id === cancelTarget._id) {
        setSelectedBooking((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
      }
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setConfirmOpen(false);
      setCancelTarget(null);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const bookingId = (b.bookingId || b._id || '').toLowerCase();
      const customer = (b.customerName || b.customer?.name || '').toLowerCase();
      const parking = (b.parkingName || b.parking?.name || '').toLowerCase();
      if (!bookingId.includes(q) && !customer.includes(q) && !parking.includes(q)) return false;
    }
    if (dateFrom && b.createdAt && new Date(b.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && b.createdAt) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(b.createdAt) > end) return false;
    }
    return true;
  });

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const columns = [
    {
      key: 'bookingId',
      label: 'Booking ID',
      render: (v, row) => <span className="font-mono text-xs">{v || row._id?.slice(-8) || '-'}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (v, row) => row.customerName || row.customer?.name || '-',
    },
    {
      key: 'parkingName',
      label: 'Parking',
      render: (v, row) => row.parkingName || row.parking?.name || '-',
    },
    {
      key: 'slot',
      label: 'Slot',
      render: (v, row) => {
        const start = row.startTime || row.slot?.startTime || '-';
        const end = row.endTime || row.slot?.endTime || '-';
        return <span className="text-xs">{start} - {end}</span>;
      },
    },
    {
      key: 'createdAt',
      label: 'Date/Time',
      render: (v) => v ? new Date(v).toLocaleString() : '-',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v) => formatCurrency(v),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
          active: 'bg-green-100 text-green-700 border-green-200',
          completed: 'bg-gray-100 text-gray-600 border-gray-200',
          cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colors[v] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {v}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewDetails(row); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {(row.status === 'pending' || row.status === 'confirmed' || row.status === 'active') && (
            <button
              onClick={(e) => { e.stopPropagation(); setCancelTarget(row); setConfirmOpen(true); }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Cancel Booking"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Booking Management" subtitle="View and manage all bookings" />

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by ID, customer, or parking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 text-sm" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            title="From date"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            title="To date"
          />
        </div>

        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <EmptyState
            icon={FaSearch}
            title="No bookings found"
            description={search || statusFilter !== 'all' || dateFrom || dateTo ? 'Try adjusting your filters' : 'No bookings have been made yet'}
          />
        )}
      </div>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedBooking(null); }} title="Booking Details" size="lg">
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Booking Information</h4>
              </div>
              <DetailField label="Booking ID" value={selectedBooking.bookingId || selectedBooking._id} />
              <DetailField label="Status" value={<StatusBadge status={selectedBooking.status} />} />
              <DetailField label="Amount" value={formatCurrency(selectedBooking.amount)} />
              <DetailField label="Date" value={selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString() : '-'} />
              <DetailField label="Time" value={`${selectedBooking.startTime || '-'} - ${selectedBooking.endTime || '-'}`} />
              <DetailField label="Vehicle" value={selectedBooking.vehicleNumber || '-'} />

              <div className="col-span-2 mt-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Information</h4>
              </div>
              <DetailField label="Name" value={selectedBooking.customerName || selectedBooking.customer?.name || '-'} />
              <DetailField label="Email" value={selectedBooking.customerEmail || selectedBooking.customer?.email || '-'} />
              <DetailField label="Phone" value={selectedBooking.customerPhone || selectedBooking.customer?.phone || '-'} />

              <div className="col-span-2 mt-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Parking Information</h4>
              </div>
              <DetailField label="Parking" value={selectedBooking.parkingName || selectedBooking.parking?.name || '-'} />
              <DetailField label="Slot" value={selectedBooking.slotName || selectedBooking.slot?.name || '-'} />
              <DetailField label="Location" value={selectedBooking.parking?.address || selectedBooking.location || '-'} />

              <div className="col-span-2 mt-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Details</h4>
              </div>
              <DetailField label="Payment Status" value={<StatusBadge status={selectedBooking.paymentStatus || selectedBooking.payment?.status || 'pending'} />} />
              <DetailField label="Payment Method" value={selectedBooking.paymentMethod || selectedBooking.payment?.method || '-'} />
              <DetailField label="Transaction ID" value={selectedBooking.transactionId || selectedBooking.payment?.transactionId || '-'} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Cancel Booking"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to cancel this booking?</p>
            {cancelTarget && (
              <p className="text-sm text-gray-500">
                Booking: <strong>{cancelTarget.bookingId || cancelTarget._id}</strong>
                <br />
                Customer: <strong>{cancelTarget.customerName || cancelTarget.customer?.name}</strong>
              </p>
            )}
          </div>
        }
        onConfirm={handleCancel}
        onCancel={() => { setConfirmOpen(false); setCancelTarget(null); }}
        confirmText="Cancel Booking"
        variant="danger"
      />
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
