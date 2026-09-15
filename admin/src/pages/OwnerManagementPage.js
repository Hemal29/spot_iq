import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaBuilding, FaUsers, FaUserCheck, FaClock, FaRupeeSign,
  FaCheck, FaTimes, FaSearch, FaEye, FaTimesCircle,
  FaPhone, FaEnvelope, FaIdCard, FaPercentage, FaParking,
  FaUniversity, FaFileInvoice, FaExclamationTriangle, FaSyncAlt,
} from 'react-icons/fa';
import adminService from '../services/adminService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

const statusStyles = {
  approved: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20 border border-gray-200/30',
  pending: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20 border border-gray-200/30',
  rejected: 'bg-red-100 text-red-700/20 border border-red-200/30',
};

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v || 0);

export default function OwnerManagementPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewOwner, setViewOwner] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOwners();
      const raw = res.data?.data || res.data || [];
      const ownersList = (Array.isArray(raw) ? raw : []).map((o) => ({
        ...o,
        name: o.name || o.userName || 'N/A',
        email: o.email || o.userEmail || '',
        phone: o.phone || o.userPhone || '',
        status: o.isApproved ? 'approved' : 'pending',
      }));
      setOwners(ownersList);
    } catch (err) {
      toast.error('Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: owners.length,
    approved: owners.filter((o) => o.status === 'approved').length,
    pending: owners.filter((o) => o.status === 'pending').length,
    totalEarnings: owners.reduce((sum, o) => sum + Number(o.totalEarnings || 0), 0),
  }), [owners]);

  const filtered = useMemo(() => owners.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.name?.toLowerCase().includes(q) ||
      o.companyName?.toLowerCase().includes(q) ||
      o.company?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.gstNumber?.toLowerCase().includes(q) ||
      o.gst?.toLowerCase().includes(q)
    );
  }), [owners, search, statusFilter]);

  const handleApprove = async (ownerId) => {
    setSaving(true);
    try {
      await adminService.approveOwner(ownerId);
      setOwners((prev) => prev.map((o) => (o.id === ownerId ? { ...o, status: 'approved' } : o)));
      toast.success('Owner approved successfully');
    } catch (err) {
      toast.error('Failed to approve owner');
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  };

  const handleReject = async (ownerId) => {
    setSaving(true);
    try {
      await adminService.rejectOwner(ownerId);
      setOwners((prev) => prev.map((o) => (o.id === ownerId ? { ...o, status: 'rejected' } : o)));
      toast.success('Owner rejected');
    } catch (err) {
      toast.error('Failed to reject owner');
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  };

  const statCards = [
    { label: 'Total Owners', value: stats.total, icon: FaUsers, gradient: 'bg-primary-600' },
    { label: 'Approved', value: stats.approved, icon: FaUserCheck, gradient: 'bg-primary-400' },
    { label: 'Pending', value: stats.pending, icon: FaClock, gradient: 'bg-primary-600' },
    { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), icon: FaRupeeSign, gradient: 'from-purple-500 to-purple-600', isText: true },
  ];

  const columns = [
    {
      key: 'companyName',
      label: 'Company',
      render: (v, row) => {
        const name = row.companyName || row.company || '-';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {name[0]?.toUpperCase() || 'C'}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100  truncate max-w-[140px]">{name}</p>
          </div>
        );
      },
    },
    {
      key: 'user',
      label: 'User',
      render: (v, row) => {
        const name = row.userName || row.user?.name || row.name || '-';
        const email = row.userEmail || row.user?.email || row.email || '';
        const phone = row.userPhone || row.user?.phone || row.phone || '';
        return (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{name}</p>
            {email && <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{email}</p>}
            {phone && <p className="text-xs text-gray-400 dark:text-gray-500 ">{phone}</p>}
          </div>
        );
      },
    },
    {
      key: 'gstNumber',
      label: 'GST Number',
      render: (v, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300  font-mono">
          {row.gstNumber || row.gst || '-'}
        </span>
      ),
    },
    {
      key: 'parkingCount',
      label: 'Parking',
      render: (v, row) => {
        const count = row.parkingCount ?? row.parkings?.length ?? row.totalParkings ?? 0;
        return (
          <div className="flex items-center gap-1.5">
            <FaParking className="text-gray-400 dark:text-gray-500  text-[10px]" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{count}</span>
          </div>
        );
      },
    },
    {
      key: 'commissionRate',
      label: 'Commission',
      render: (v, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 ">
          {row.commissionRate != null ? `${row.commissionRate}%` : '-'}
        </span>
      ),
    },
    {
      key: 'totalEarnings',
      label: 'Earnings',
      render: (v, row) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">
          {formatCurrency(row.totalEarnings)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[v] || statusStyles.pending}`}>
          {v === 'approved' && <FaCheck className="mr-1 text-[10px]" />}
          {v === 'pending' && <FaClock className="mr-1 text-[10px]" />}
          {v === 'rejected' && <FaTimesCircle className="mr-1 text-[10px]" />}
          {v || 'pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (v, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setViewOwner(row); }}
            className="p-1.5 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye className="text-xs" />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'approve', owner: row }); }}
                className="p-1.5 text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  rounded-lg transition-colors"
                title="Approve"
              >
                <FaCheck className="text-xs" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'reject', owner: row }); }}
                className="p-1.5 text-red-500 hover:bg-red-50  rounded-lg transition-colors"
                title="Reject"
              >
                <FaTimesCircle className="text-xs" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Parking Owners" subtitle="Manage parking owners and their approvals" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="glass-card p-5 overflow-hidden relative group hover:shadow-md transition-shadow duration-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent[0.02]  pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100  mt-1">
                  {card.isText ? card.value : card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-current/20`}>
                <card.icon className="text-white text-lg" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500  text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, company, email, or GST..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {statusFilters.map((sf) => (
                <button
                  key={sf.key}
                  onClick={() => setStatusFilter(sf.key)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    statusFilter === sf.key
                      ? 'bg-gray-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800  text-gray-600 dark:text-gray-400 dark:text-gray-500  hover:bg-gray-200 dark:hover:bg-gray-700 dark:bg-gray-700 '
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No owners found" />
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'approve' ? 'Approve Owner' : 'Reject Owner'}
        message={
          confirmAction?.type === 'approve'
            ? `Are you sure you want to approve "${confirmAction?.owner?.companyName || confirmAction?.owner?.company || confirmAction?.owner?.name}"?`
            : `Are you sure you want to reject "${confirmAction?.owner?.companyName || confirmAction?.owner?.company || confirmAction?.owner?.name}"? This action cannot be undone.`
        }
        confirmText={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        onConfirm={() => {
          if (confirmAction?.type === 'approve') {
            handleApprove(confirmAction.owner.id);
          } else {
            handleReject(confirmAction.owner.id);
          }
        }}
        onCancel={() => setConfirmAction(null)}
        variant={confirmAction?.type === 'approve' ? 'primary' : 'danger'}
      />

      <Modal isOpen={!!viewOwner} onClose={() => setViewOwner(null)} title="Owner Details" size="lg">
        {viewOwner && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800  rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-400 to-primary-400 flex items-center justify-center text-white text-xl font-bold">
                {(viewOwner.companyName || viewOwner.company || viewOwner.name || 'O')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 ">
                  {viewOwner.companyName || viewOwner.company || 'No Company'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                  {viewOwner.userName || viewOwner.user?.name || viewOwner.name || ''}
                </p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[viewOwner.status] || statusStyles.pending}`}>
                    {viewOwner.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500  text-sm flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Email</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 ">{viewOwner.userEmail || viewOwner.user?.email || viewOwner.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <FaPhone className="text-gray-400 dark:text-gray-500  text-sm flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Phone</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 ">{viewOwner.userPhone || viewOwner.user?.phone || viewOwner.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <FaIdCard className="text-gray-400 dark:text-gray-500  text-sm flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">GST Number</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100  font-mono">{viewOwner.gstNumber || viewOwner.gst || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
                    <FaPercentage className="text-gray-400 dark:text-gray-500  text-sm flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Commission Rate</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 ">{viewOwner.commissionRate != null ? `${viewOwner.commissionRate}%` : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Financial Details</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                    <p className="text-xs text-primary-200 font-medium uppercase tracking-wider">Total Earnings</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(viewOwner.totalEarnings)}</p>
                  </div>
                  {viewOwner.bankDetails && (
                    <div className="p-3 glass-card rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <FaUniversity className="text-gray-400 dark:text-gray-500  text-sm" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">Bank Details</p>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                        {viewOwner.bankDetails.bankName && <p>Bank: {viewOwner.bankDetails.bankName}</p>}
                        {viewOwner.bankDetails.accountNumber && <p>Account: {viewOwner.bankDetails.accountNumber}</p>}
                        {viewOwner.bankDetails.ifsc && <p>IFSC: {viewOwner.bankDetails.ifsc}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {viewOwner.parkings && viewOwner.parkings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-3">Parking Locations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewOwner.parkings.map((parking, idx) => (
                    <div key={parking.id || idx} className="p-3 glass-card rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br bg-primary-600 flex items-center justify-center flex-shrink-0">
                        <FaParking className="text-white text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100  truncate">{parking.parkingName || parking.name || 'Parking'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{parking.city || parking.address || '-'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${parking.status === 'active' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 dark:text-gray-500  '}`}>
                        {parking.status || 'active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ">
              {viewOwner.status === 'pending' && (
                <>
                  <button
                    onClick={() => { setViewOwner(null); setConfirmAction({ type: 'approve', owner: viewOwner }); }}
                    className="btn-primary"
                  >
                    <FaCheck className="text-xs" />
                    Approve Owner
                  </button>
                  <button
                    onClick={() => { setViewOwner(null); setConfirmAction({ type: 'reject', owner: viewOwner }); }}
                    className="btn-danger"
                  >
                    <FaTimesCircle className="text-xs" />
                    Reject Owner
                  </button>
                </>
              )}
              <button onClick={() => setViewOwner(null)} className="btn-ghost ml-auto">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
