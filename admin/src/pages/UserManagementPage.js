import { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import adminService from '../services/adminService';
import { FaSearch, FaUsers, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    const newStatus = confirmTarget.status === 'active' ? 'suspended' : 'active';
    try {
      if (newStatus === 'suspended') {
        await adminService.suspendUser(confirmTarget._id);
      } else {
        await adminService.activateUser(confirmTarget._id);
      }
      setUsers((prev) =>
        prev.map((u) => (u._id === confirmTarget._id ? { ...u, status: newStatus } : u))
      );
      if (selectedUser?._id === confirmTarget._id) {
        setSelectedUser((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (err) {
      console.error('Status update failed:', err);
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
      const res = await adminService.getUserById(user._id);
      const detail = res.data?.user || res.data;
      setUserVehicles(detail.vehicles || detail.vehicleDetails || []);
      setUserBookings(detail.recentBookings || detail.bookings || []);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length;

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const columns = [
    { key: '_id', label: 'ID', render: (v) => <span className="font-mono text-xs">{v?.slice(-8)}</span> },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (v) => v || '-' },
    { key: 'bookingsCount', label: 'Bookings', render: (v, row) => v ?? row.totalBookings ?? row.bookingsCount ?? 0 },
    { key: 'totalSpent', label: 'Total Spent', render: (v, row) => formatCurrency(v ?? row.totalSpent ?? 0) },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          v === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (v) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewProfile(row); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View Profile"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmTarget(row); setConfirmOpen(true); }}
            className={`p-1.5 rounded-lg transition ${
              row.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
            }`}
            title={row.status === 'active' ? 'Suspend User' : 'Activate User'}
          >
            {row.status === 'active' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="View and manage all users" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Total Users</p>
              <p className="text-2xl font-bold mt-1">{totalUsers}</p>
            </div>
            <FaUsers className="text-3xl text-white/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Active Users</p>
              <p className="text-2xl font-bold mt-1">{activeUsers}</p>
            </div>
            <FaUserCheck className="text-3xl text-white/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Suspended Users</p>
              <p className="text-2xl font-bold mt-1">{suspendedUsers}</p>
            </div>
            <FaUserTimes className="text-3xl text-white/40" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
        </div>

        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <EmptyState
            icon={FaSearch}
            title="No users found"
            description={search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No users registered yet'}
          />
        )}
      </div>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedUser(null); setUserVehicles([]); setUserBookings([]); }} title="User Profile" size="lg">
        {selectedUser && (
          <div className="space-y-6">
            {detailLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : (
              <>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {(selectedUser.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{selectedUser.phone || 'No phone'}</span>
                      <StatusBadge status={selectedUser.status} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-xl font-bold text-gray-900">{selectedUser.bookingsCount ?? selectedUser.totalBookings ?? 0}</p>
                  </div>
                </div>

                {userVehicles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Vehicles</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userVehicles.map((v, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl text-sm">
                          <p className="font-medium text-gray-800">{v.make || v.brand} {v.model}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{v.number || v.vehicleNumber || v.plateNumber}</p>
                          {v.color && <p className="text-xs text-gray-400">{v.color}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userBookings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Bookings</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userBookings.map((b) => (
                        <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                          <div>
                            <p className="font-medium text-gray-800">{b.parkingName || b.parking?.name || 'Parking'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}
                              {b.startTime && ` | ${b.startTime}`}
                            </p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userVehicles.length === 0 && userBookings.length === 0 && !detailLoading && (
                  <p className="text-center text-gray-400 py-4 text-sm">No additional details available for this user</p>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmTarget?.status === 'active' ? 'Suspend User' : 'Activate User'}
        message={`Are you sure you want to ${confirmTarget?.status === 'active' ? 'suspend' : 'activate'} "${confirmTarget?.name}"?`}
        onConfirm={handleToggleStatus}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        confirmText={confirmTarget?.status === 'active' ? 'Suspend' : 'Activate'}
        variant={confirmTarget?.status === 'active' ? 'danger' : 'primary'}
      />
    </div>
  );
}
