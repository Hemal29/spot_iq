import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserShield,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaCar,
  FaCalendarCheck,
  FaRupeeSign,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaFilter,
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
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50 ">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700  animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded w-1/3 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700  rounded w-1/4 animate-pulse" />
      </div>
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700  rounded-full animate-pulse" />
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [userVehicles, setUserVehicles] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers();
      const raw = res.data?.data || res.data || [];
      const list = (Array.isArray(raw) ? raw : []).map((u) => ({
        ...u,
        id: u.id,
        status: u.isActive === false ? 'suspended' : 'active',
        role: u.role || 'customer',
      }));
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    const isSuspending = confirmTarget.status === 'active' || confirmTarget.status === 'inactive';
    const newStatus = isSuspending ? 'suspended' : 'active';
    try {
      if (isSuspending) {
        await adminService.suspendUser(confirmTarget.id);
      } else {
        await adminService.activateUser(confirmTarget.id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === confirmTarget.id ? { ...u, status: newStatus } : u))
      );
      if (selectedUser?.id === confirmTarget.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error('Failed to update user status');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleViewProfile = async (user) => {
    setSelectedUser(user);
    setDetailOpen(true);
    setDetailLoading(true);
    setUserVehicles([]);
    setUserBookings([]);
    try {
      const res = await adminService.getUserById(user.id);
      const detail = res.data?.data || res.data?.user || res.data || {};
      setUserVehicles(Array.isArray(detail.vehicles) ? detail.vehicles : Array.isArray(detail.vehicleDetails) ? detail.vehicleDetails : []);
      setUserBookings(Array.isArray(detail.recentBookings) ? detail.recentBookings : Array.isArray(detail.bookings) ? detail.bookings : []);
    } catch (err) {
      console.error('Failed to load user details:', err);
      toast.error('Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (roleFilter !== 'all' && (u.role || 'user') !== roleFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    });
  }, [users, statusFilter, roleFilter, search]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = users.filter((u) => u.status === 'inactive' || u.status === 'suspended').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, active, inactive, admins };
  }, [users]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const getInitial = (name) => (name || 'U')[0].toUpperCase();

  const avatarColors = [
    'from-primary-400 to-purple-600',
    'from-emerald-500 to-primary-400',
    'from-primary-400 to-red-600',
    'from-pink-500 to-rose-600',
    'bg-primary-400',
    'from-amber-500 to-gray-700',
  ];

  const getAvatarColor = (idx) => avatarColors[idx % avatarColors.length];

  const columns = [
    {
      key: 'avatar',
      label: '',
      width: '50px',
      sortable: false,
      render: (_, row) => (
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(row.name?.charCodeAt(0) || 0)} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
          {getInitial(row.name)}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (v) => (
        <span className="font-medium text-gray-900 dark:text-gray-100 ">{v || '-'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500  text-xs">{v || '-'}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (v) => v || <span className="text-gray-400 dark:text-gray-500">-</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (v) => {
        const role = v || 'user';
        const roleStyles = {
          admin: 'bg-gray-100/20 text-gray-600 dark:text-gray-400 dark:text-gray-500 border-gray-200/30',
          owner: 'bg-gray-100/20 text-gray-700 dark:text-gray-300  border-gray-200/30',
          user: 'bg-gray-100 dark:bg-gray-800  text-gray-700 dark:text-gray-300  border-gray-200 dark:border-gray-700 ',
        };
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${roleStyles[role] || roleStyles.user}`}>
            {role === 'admin' && <FaUserShield className="text-[10px]" />}
            {role}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
          v === 'active'
            ? 'bg-gray-100/20 text-gray-600'
            : v === 'suspended'
            ? 'bg-red-100/20 text-red-700'
            : 'bg-gray-100 dark:bg-gray-800  text-gray-600 dark:text-gray-400 dark:text-gray-500 '
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            v === 'active' ? 'bg-gray-500' : v === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
          }`} />
          {v}
        </span>
      ),
    },
    {
      key: 'bookingsCount',
      label: 'Bookings',
      render: (v, row) => (
        <span className="text-gray-700 dark:text-gray-300  font-medium">
          {v ?? row.totalBookings ?? 0}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (v) => v ? (
        <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500  text-xs">
          {new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ) : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewProfile(row); }}
            className="btn-ghost !px-2 !py-1.5 text-primary-400"
            title="View Profile"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmTarget(row); setConfirmOpen(true); }}
            className={`btn-ghost !px-2 !py-1.5 ${
              row.status === 'active' || row.status === 'inactive'
                ? 'text-red-600'
                : 'text-primary-400'
            }`}
            title={row.status === 'active' || row.status === 'inactive' ? 'Suspend User' : 'Activate User'}
          >
            {row.status === 'active' || row.status === 'inactive' ? (
              <FaBan className="text-sm" />
            ) : (
              <FaCheckCircle className="text-sm" />
            )}
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Management" subtitle="Manage all registered users" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700  rounded w-1/3" />
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

  if (error && !users.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Management" subtitle="Manage all registered users" />
        <div className="glass-card flex flex-col items-center justify-center min-h-[400px] text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-100/20 flex items-center justify-center mb-4">
              <FaUserTimes className="text-2xl text-red-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500  mb-4">{error}</p>
            <button onClick={fetchUsers} className="btn-primary">
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
        <PageHeader title="User Management" subtitle="Manage all registered users, roles, and access" />
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: FaUsers, gradient: 'bg-gray-700' },
          { label: 'Active Users', value: stats.active, icon: FaUserCheck, gradient: 'bg-primary-400' },
          { label: 'Inactive', value: stats.inactive, icon: FaUserTimes, gradient: 'bg-red-600' },
          { label: 'Admins', value: stats.admins, icon: FaUserShield, gradient: 'bg-primary-400' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card p-5 overflow-hidden relative group"
          >
            <div className={`absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity ${stat.gradient}`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100  mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="text-white text-xl" />
              </div>
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
              placeholder="Search by name, email, or phone..."
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
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-field !w-auto !py-2.5"
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {(search || statusFilter !== 'all' || roleFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setRoleFilter('all'); }}
              className="btn-ghost text-sm"
            >
              Clear Filters
            </button>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  ml-auto">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
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
              icon={FaUsers}
              title="No users found"
              description={
                search || statusFilter !== 'all' || roleFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users have registered yet'
              }
              actionText={search || statusFilter !== 'all' || roleFilter !== 'all' ? 'Clear Filters' : undefined}
              onAction={search || statusFilter !== 'all' || roleFilter !== 'all'
                ? () => { setSearch(''); setStatusFilter('all'); setRoleFilter('all'); }
                : undefined
              }
            />
          </div>
        )}
      </motion.div>

      {/* User Profile Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedUser(null); setUserVehicles([]); setUserBookings([]); }}
        title="User Profile"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {detailLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : (
              <>
                {/* Profile Header */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative p-5 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-purple-500/10 to-pink-500/10/5/5/5" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                      {getInitial(selectedUser.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 ">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-0.5">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={selectedUser.status} />
                        <span className="text-xs text-gray-400 dark:text-gray-500  capitalize">({selectedUser.role || 'user'})</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoCard icon={FaEnvelope} label="Email" value={selectedUser.email || '-'} />
                  <InfoCard icon={FaPhone} label="Phone" value={selectedUser.phone || 'Not provided'} />
                  <InfoCard icon={FaIdCard} label="User ID" value={String(selectedUser.id || '-')?.slice(-10)} />
                  <InfoCard
                    icon={FaCalendarCheck}
                    label="Joined"
                    value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  />
                  <InfoCard icon={FaRupeeSign} label="Total Spent" value={formatCurrency(selectedUser.totalSpent || 0)} />
                  <InfoCard icon={FaCalendarCheck} label="Total Bookings" value={String(selectedUser.bookingsCount ?? selectedUser.totalBookings ?? 0)} />
                </div>

                {/* Vehicles */}
                {userVehicles.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-3">
                      <FaCar className="text-gray-500 dark:text-gray-400" />
                      Vehicles ({userVehicles.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userVehicles.map((v, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-3.5 bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-100 dark:border-gray-700/50 "
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100/20 flex items-center justify-center">
                              <FaCar className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                                {v.make || v.brand} {v.model}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  font-mono">
                                {v.number || v.vehicleNumber || v.plateNumber || '-'}
                              </p>
                              {v.color && <p className="text-xs text-gray-400 dark:text-gray-500 ">{v.color}</p>}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking History */}
                {userBookings.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-3">
                      <FaCalendarCheck className="text-primary-400" />
                      Booking History ({userBookings.length})
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {userBookings.map((b, idx) => (
                        <motion.div
                          key={b.id || idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-100 dark:border-gray-700/50 "
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100/20 flex items-center justify-center">
                              <FaCalendarCheck className="text-primary-400 text-xs" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                                {b.parkingName || b.parking?.name || 'Parking'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                                {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : ''}
                                {b.startTime && ` | ${b.startTime}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ">
                              {formatCurrency(b.amount)}
                            </span>
                            <StatusBadge status={b.status} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 ">
                      <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Total Spent</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100 ">
                        {formatCurrency(userBookings.reduce((sum, b) => sum + Number(b.totalAmount || b.amount || 0), 0))}
                      </span>
                    </div>
                  </div>
                )}

                {userVehicles.length === 0 && userBookings.length === 0 && !detailLoading && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800  flex items-center justify-center mx-auto mb-3">
                      <FaUsers className="text-2xl text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 ">No additional details available for this user</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Suspend/Activate Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmTarget?.status === 'active' || confirmTarget?.status === 'inactive' ? 'Suspend User' : 'Activate User'}
        message={
          <div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
              Are you sure you want to{' '}
              <span className={confirmTarget?.status === 'active' || confirmTarget?.status === 'inactive' ? 'text-red-600 font-semibold' : 'text-primary-400 font-semibold'}>
                {confirmTarget?.status === 'active' || confirmTarget?.status === 'inactive' ? 'suspend' : 'activate'}
              </span>{' '}
              this user?
            </p>
            {confirmTarget && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800  rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {getInitial(confirmTarget.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">{confirmTarget.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{confirmTarget.email}</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500  mt-2">
              {confirmTarget?.status === 'active' || confirmTarget?.status === 'inactive'
                ? 'This user will lose access to their account.'
                : 'This user will regain access to their account.'}
            </p>
          </div>
        }
        onConfirm={handleToggleStatus}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        confirmText={confirmTarget?.status === 'active' || confirmTarget?.status === 'inactive' ? 'Suspend User' : 'Activate User'}
        variant={confirmTarget?.status === 'active' || confirmTarget?.status === 'inactive' ? 'danger' : 'primary'}
      />
    </motion.div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800  rounded-xl border border-gray-100 dark:border-gray-700/50 ">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="text-xs text-gray-500" />
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500  uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100  truncate">{value}</p>
    </div>
  );
}
