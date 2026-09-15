import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaDollarSign,
  FaCreditCard,
  FaExclamationCircle,
  FaCheckCircle,
  FaUndoAlt,
  FaFilter,
  FaDownload,
  FaEye,
  FaUndo,
  FaCalendarAlt,
  FaExchangeAlt,
  FaUser,
  FaFileInvoice,
  FaClock,
} from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'paid', label: 'Successful' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50 ">
      <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded w-1/4 animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded w-1/6 animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded w-1/6 animate-pulse" />
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700  rounded-full animate-pulse" />
    </div>
  );
}

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllPayments();
      const data = res.data?.data || res.data || [];
      const list = (Array.isArray(data) ? data : []).map((p) => ({
        ...p,
        id: p.id,
        amount: Number(p.amount || 0),
        status: p.status === 'success' ? 'paid' : (p.status || 'pending'),
        customerName: p.customerName || p.User?.name || p.customer?.name || '',
        customerEmail: p.customerEmail || p.User?.email || p.customer?.email || '',
        bookingStatus: p.bookingStatus || p.Booking?.bookingStatus || p.booking?.bookingStatus || '',
        totalAmount: Number(p.totalAmount || p.Booking?.totalAmount || p.booking?.totalAmount || 0),
        method: p.method || p.paymentMethod || p.Payment?.paymentMethod || p.payment?.paymentMethod || '',
      }));
      setPayments(list);
    } catch (err) {
      console.error('Failed to load payments:', err);
      setError('Failed to load payments');
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const payId = String(p.transactionId || p.id || '').toLowerCase();
        const bookId = String(p.bookingId || p.booking?.id || '').toLowerCase();
        const customer = (p.customerName || p.customer?.name || p.user?.name || '').toLowerCase();
        if (!payId.includes(q) && !bookId.includes(q) && !customer.includes(q)) return false;
      }
      if (dateFrom && p.createdAt && new Date(p.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && p.createdAt) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(p.createdAt) > end) return false;
      }
      return true;
    });
  }, [payments, statusFilter, search, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === 'paid')
      .reduce((a, p) => a + Number(p.amount || 0), 0);
    const paidCount = payments.filter((p) => p.status === 'paid').length;
    const pendingCount = payments.filter((p) => p.status === 'pending').length;
    const failedCount = payments.filter((p) => p.status === 'failed').length;
    const refundedCount = payments.filter((p) => p.status === 'refunded').length;
    const refundedAmount = payments
      .filter((p) => p.status === 'refunded')
      .reduce((a, p) => a + Number(p.amount || 0), 0);
    return { totalRevenue, paidCount, pendingCount, failedCount, refundedCount, refundedAmount };
  }, [payments]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const exportCSV = () => {
    if (!filtered.length) {
      toast.warning('No data to export');
      return;
    }
    const headers = ['Transaction ID', 'Customer', 'Amount', 'Method', 'Status', 'Booking ID', 'Date'];
    const rows = filtered.map((p) => [
      p.transactionId || p.id || '',
      p.customerName || p.customer?.name || p.user?.name || '',
      p.amount || 0,
      p.method || p.paymentMethod || p.payment?.method || '',
      p.status || '',
      p.bookingId || p.booking?.id || '',
      p.createdAt ? new Date(p.createdAt).toISOString() : '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const columns = [
    {
      key: 'transactionId',
      label: 'Transaction ID',
      render: (v, row) => {
        const id = String(v || row.id || '-');
        const truncated = id.length > 12 ? id.slice(-12) : id;
        return (
          <span className="font-mono text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500  bg-gray-100 dark:bg-gray-800  px-2 py-0.5 rounded">
            ...{truncated}
          </span>
        );
      },
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (v, row) => {
        const name = v || row.customer?.name || row.user?.name || '-';
        const initial = name[0]?.toUpperCase() || '?';
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-primary-400 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{name}</span>
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v) => (
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ">
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (v, row) => {
        const method = v || row.paymentMethod || row.payment?.method || '-';
        const isRazorpay = method.toLowerCase().includes('razorpay') || method.toLowerCase().includes('upi');
        const isCash = method.toLowerCase().includes('cash');
        return (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isRazorpay ? 'bg-gray-100/20' : isCash ? 'bg-gray-100/20' : 'bg-gray-100 dark:bg-gray-800 '
            }`}>
              {isRazorpay ? (
                <FaExchangeAlt className={`text-xs ${isRazorpay ? 'text-gray-500' : 'text-gray-400'}`} />
              ) : isCash ? (
                <FaDollarSign className="text-xs text-primary-400" />
              ) : (
                <FaCreditCard className="text-xs text-gray-400" />
              )}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 ">{method}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const colors = {
          paid: 'bg-gray-100/20 text-gray-600',
          pending: 'bg-gray-100/20 text-gray-600',
          failed: 'bg-red-100/20 text-red-700',
          refunded: 'bg-gray-100/20 text-gray-700 dark:text-gray-300 ',
        };
        const icons = {
          paid: FaCheckCircle,
          pending: FaClock,
          failed: FaExclamationCircle,
          refunded: FaUndoAlt,
        };
        const Icon = icons[v] || FaExclamationCircle;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${colors[v] || 'bg-gray-100 dark:bg-gray-800  text-gray-600 dark:text-gray-400 dark:text-gray-500 '}`}>
            <Icon className="text-[10px]" />
            {v}
          </span>
        );
      },
    },
    {
      key: 'bookingId',
      label: 'Booking ID',
      render: (v, row) => {
        const id = String(v || row.booking?.id || '-');
        const truncated = id.length > 8 ? id.slice(-8) : id;
        return (
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
            #{truncated}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => v ? (
        <div>
          <span className="text-sm text-gray-700 dark:text-gray-300 ">
            {new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="block text-xs text-gray-400 dark:text-gray-500 ">
            {new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ) : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); setDetailOpen(true); }}
            className="btn-ghost !px-2 !py-1.5 text-primary-400"
            title="View Details"
          >
            <FaEye className="text-sm" />
          </button>
          {row.status === 'paid' && (
            <button
              onClick={(e) => { e.stopPropagation(); toast.info('Refund functionality coming soon'); }}
              className="btn-ghost !px-2 !py-1.5 text-primary-400"
              title="Refund"
            >
              <FaUndo className="text-sm" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment Management" subtitle="Track all payment transactions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700  rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="glass-card overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !payments.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment Management" subtitle="Track all payment transactions" />
        <div className="glass-card flex flex-col items-center justify-center min-h-[400px] text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-100/20 flex items-center justify-center mb-4">
              <FaExclamationCircle className="text-2xl text-red-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500  mb-4">{error}</p>
            <button onClick={fetchPayments} className="btn-primary">
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Payment Management"
          subtitle="Track all payment transactions and manage refunds"
          action={
            <button onClick={exportCSV} className="btn-primary">
              <FaDownload className="text-sm" />
              Export CSV
            </button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: FaDollarSign, gradient: 'bg-gray-700' },
          { label: 'Successful', value: stats.paidCount, icon: FaCheckCircle, gradient: 'bg-primary-400' },
          { label: 'Pending', value: stats.pendingCount, icon: FaClock, gradient: 'bg-gray-500' },
          { label: 'Failed', value: stats.failedCount, icon: FaExclamationCircle, gradient: 'bg-red-600' },
          { label: 'Refunded', value: formatCurrency(stats.refundedAmount), icon: FaUndoAlt, gradient: 'bg-primary-400' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card p-5 overflow-hidden relative group"
          >
            <div className={`absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity ${stat.gradient}`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">{stat.label}</p>
                <div className={`w-8 h-8 rounded-lg ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="text-white text-sm" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 ">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500  text-sm" />
            <input
              type="text"
              placeholder="Search by transaction ID, booking ID, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 dark:text-gray-500  text-sm" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field !w-auto !py-2.5"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400 dark:text-gray-500  text-sm" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field !w-auto !py-2.5"
              title="From date"
            />
            <span className="text-gray-400 dark:text-gray-500  text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field !w-auto !py-2.5"
              title="To date"
            />
          </div>
          {(search || statusFilter !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}
              className="btn-ghost text-sm"
            >
              Clear Filters
            </button>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  ml-auto">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="glass-card">
            <EmptyState
              icon={FaCreditCard}
              title="No payments found"
              description={
                search || statusFilter !== 'all' || dateFrom || dateTo
                  ? 'Try adjusting your search or filters'
                  : 'No payment transactions recorded yet'
              }
              actionText={search || statusFilter !== 'all' || dateFrom || dateTo ? 'Clear Filters' : undefined}
              onAction={search || statusFilter !== 'all' || dateFrom || dateTo
                ? () => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }
                : undefined
              }
            />
          </div>
        )}
      </motion.div>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedPayment(null); }}
        title="Payment Details"
        size="lg"
      >
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Payment Summary */}
            <div className="relative p-5 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-gray-500/10 to-purple-500/10/5/5/5" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-1">Payment Amount</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 ">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <StatusBadge status={selectedPayment.status} />
              </div>
            </div>

            {/* Transaction Details */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-3">
                <FaFileInvoice className="text-gray-500 dark:text-gray-400" />
                Transaction Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailField
                  label="Transaction ID"
                  value={
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800  px-2 py-0.5 rounded">
                      {selectedPayment.transactionId || selectedPayment.id || '-'}
                    </span>
                  }
                />
                <DetailField label="Status" value={<StatusBadge status={selectedPayment.status} />} />
                <DetailField label="Amount" value={formatCurrency(selectedPayment.amount)} />
                <DetailField
                  label="Payment Method"
                  value={
                    <div className="flex items-center gap-2">
                      <FaCreditCard className="text-gray-400 dark:text-gray-500 text-xs" />
                      {selectedPayment.method || selectedPayment.paymentMethod || selectedPayment.payment?.method || '-'}
                    </div>
                  }
                />
                <DetailField
                  label="Date"
                  value={selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString('en-IN') : '-'}
                />
                <DetailField
                  label="Last Updated"
                  value={selectedPayment.updatedAt ? new Date(selectedPayment.updatedAt).toLocaleString('en-IN') : '-'}
                />
              </div>
            </div>

            {/* Refund Info */}
            {selectedPayment.status === 'refunded' && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-3">
                  <FaUndoAlt className="text-gray-500 dark:text-gray-400" />
                  Refund Details
                </h4>
                <div className="p-4 bg-gray-50/10 rounded-xl border border-gray-200/20">
                  <DetailField
                    label="Refund Reason"
                    value={selectedPayment.refundReason || 'No reason provided'}
                  />
                  {selectedPayment.refundedAt && (
                    <div className="mt-2">
                      <DetailField
                        label="Refunded On"
                        value={new Date(selectedPayment.refundedAt).toLocaleString('en-IN')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Booking Details */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-3">
                <FaCalendarAlt className="text-primary-400" />
                Booking Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailField
                  label="Booking ID"
                  value={
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                      {selectedPayment.bookingId || selectedPayment.booking?.id || '-'}
                    </span>
                  }
                />
                <DetailField label="Booking Amount" value={formatCurrency(selectedPayment.booking?.amount || selectedPayment.amount)} />
                <DetailField label="Booking Status" value={<StatusBadge status={selectedPayment.booking?.status || '-'} />} />
                <DetailField label="Parking" value={selectedPayment.booking?.parkingName || selectedPayment.booking?.parking?.name || '-'} />
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-3">
                <FaUser className="text-primary-400" />
                Customer Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailField
                  label="Name"
                  value={
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-primary-400 flex items-center justify-center text-white text-xs font-bold">
                        {(selectedPayment.customerName || selectedPayment.customer?.name || selectedPayment.user?.name || '?')[0]?.toUpperCase()}
                      </div>
                      <span>{selectedPayment.customerName || selectedPayment.customer?.name || selectedPayment.user?.name || '-'}</span>
                    </div>
                  }
                />
                <DetailField label="Email" value={selectedPayment.customerEmail || selectedPayment.customer?.email || selectedPayment.user?.email || '-'} />
                <DetailField label="Phone" value={selectedPayment.customerPhone || selectedPayment.customer?.phone || selectedPayment.user?.phone || '-'} />
                <DetailField label="User ID" value={
                  <span className="font-mono text-xs">
                    {String(selectedPayment.userId || selectedPayment.customer?.id || selectedPayment.user?.id || '-')?.slice(-10)}
                  </span>
                } />
              </div>
            </div>
          </motion.div>
        )}
      </Modal>
    </motion.div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-100 dark:border-gray-700/50 ">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{value}</div>
    </div>
  );
}
