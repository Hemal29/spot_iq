import { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import adminService from '../services/adminService';
import { FaSearch, FaDollarSign, FaCreditCard, FaExclamationCircle } from 'react-icons/fa';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await adminService.getAllPayments();
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const payId = (p.transactionId || p._id || '').toLowerCase();
      const bookId = (p.bookingId || p.booking?._id || '').toLowerCase();
      if (!payId.includes(q) && !bookId.includes(q)) return false;
    }
    if (dateFrom && p.createdAt && new Date(p.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && p.createdAt) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(p.createdAt) > end) return false;
    }
    return true;
  });

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const stats = {
    totalRevenue: payments.filter((p) => p.status === 'paid' || p.status === 'refunded').reduce((a, p) => a + (p.amount || 0), 0),
    totalPayments: payments.length,
    paidCount: payments.filter((p) => p.status === 'paid').length,
    pendingCount: payments.filter((p) => p.status === 'pending').length,
    failedCount: payments.filter((p) => p.status === 'failed').length,
    refundedCount: payments.filter((p) => p.status === 'refunded').length,
  };

  const columns = [
    {
      key: 'transactionId',
      label: 'Payment ID',
      render: (v, row) => <span className="font-mono text-xs">{v || row._id?.slice(-8) || '-'}</span>,
    },
    {
      key: 'bookingId',
      label: 'Booking ID',
      render: (v, row) => <span className="font-mono text-xs">{v || row.booking?._id?.slice(-8) || '-'}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (v, row) => row.customerName || row.customer?.name || row.user?.name || '-',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v) => formatCurrency(v),
    },
    {
      key: 'method',
      label: 'Method',
      render: (v, row) => {
        const method = v || row.paymentMethod || row.payment?.method || '-';
        return (
          <span className="flex items-center gap-1.5 text-sm">
            <FaCreditCard className="text-gray-400 text-xs" />
            {method}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const colors = {
          paid: 'bg-green-100 text-green-700 border-green-200',
          pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          failed: 'bg-red-100 text-red-700 border-red-200',
          refunded: 'bg-blue-100 text-blue-700 border-blue-200',
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
      label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); setDetailOpen(true); }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="View Details"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Management" subtitle="Track all payment transactions" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Total Revenue</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <FaDollarSign className="text-3xl text-white/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Successful</p>
              <p className="text-xl font-bold mt-1">{stats.paidCount}</p>
            </div>
            <FaCreditCard className="text-3xl text-white/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Pending</p>
              <p className="text-xl font-bold mt-1">{stats.pendingCount}</p>
            </div>
            <FaExclamationCircle className="text-3xl text-white/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Failed</p>
              <p className="text-xl font-bold mt-1">{stats.failedCount}</p>
            </div>
            <FaExclamationCircle className="text-3xl text-white/40" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by payment or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
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
            title="No payments found"
            description={search || statusFilter !== 'all' || dateFrom || dateTo ? 'Try adjusting your filters' : 'No payments recorded yet'}
          />
        )}
      </div>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedPayment(null); }} title="Payment Details" size="lg">
        {selectedPayment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Information</h4>
              </div>
              <DetailField label="Transaction ID" value={selectedPayment.transactionId || selectedPayment._id} />
              <DetailField label="Status" value={<StatusBadge status={selectedPayment.status} />} />
              <DetailField label="Amount" value={formatCurrency(selectedPayment.amount)} />
              <DetailField label="Method" value={selectedPayment.method || selectedPayment.paymentMethod || '-'} />
              <DetailField label="Date" value={selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : '-'} />
              <DetailField label="Updated" value={selectedPayment.updatedAt ? new Date(selectedPayment.updatedAt).toLocaleString() : '-'} />
              {selectedPayment.refundReason && (
                <div className="col-span-2">
                  <DetailField label="Refund Reason" value={selectedPayment.refundReason} />
                </div>
              )}

              <div className="col-span-2 mt-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Booking Information</h4>
              </div>
              <DetailField label="Booking ID" value={selectedPayment.bookingId || selectedPayment.booking?._id || '-'} />
              <DetailField label="Booking Amount" value={formatCurrency(selectedPayment.booking?.amount || selectedPayment.amount)} />
              <DetailField label="Booking Status" value={<StatusBadge status={selectedPayment.booking?.status || '-'} />} />

              <div className="col-span-2 mt-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Information</h4>
              </div>
              <DetailField label="Name" value={selectedPayment.customerName || selectedPayment.customer?.name || selectedPayment.user?.name || '-'} />
              <DetailField label="Email" value={selectedPayment.customerEmail || selectedPayment.customer?.email || selectedPayment.user?.email || '-'} />
              <DetailField label="Phone" value={selectedPayment.customerPhone || selectedPayment.customer?.phone || selectedPayment.user?.phone || '-'} />
            </div>
          </div>
        )}
      </Modal>
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
