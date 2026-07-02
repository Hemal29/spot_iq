import { useState, useEffect, useMemo } from 'react';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import { FaBuilding, FaUsers, FaUserCheck, FaClock, FaRupeeSign, FaCheck, FaTimes, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ITEMS_PER_PAGE = 10;

export default function OwnerManagementPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOwners();
      setOwners(res.data || []);
    } catch (err) {
      console.error('Failed to load owners:', err);
      toast.error('Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ownerId) => {
    try {
      await adminService.approveOwner(ownerId);
      setOwners((prev) =>
        prev.map((o) => (o._id === ownerId ? { ...o, status: 'approved' } : o))
      );
      toast.success('Owner approved successfully');
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error('Failed to approve owner');
    } finally {
      setConfirmAction(null);
    }
  };

  const handleReject = async (ownerId) => {
    try {
      await adminService.rejectOwner(ownerId);
      setOwners((prev) =>
        prev.map((o) => (o._id === ownerId ? { ...o, status: 'rejected' } : o))
      );
      toast.success('Owner rejected');
    } catch (err) {
      console.error('Reject failed:', err);
      toast.error('Failed to reject owner');
    } finally {
      setConfirmAction(null);
    }
  };

  const filteredOwners = useMemo(() => {
    if (!search) return owners;
    const q = search.toLowerCase();
    return owners.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.company?.toLowerCase().includes(q)
    );
  }, [owners, search]);

  const totalPages = Math.ceil(filteredOwners.length / ITEMS_PER_PAGE);
  const paginatedOwners = filteredOwners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    const total = owners.length;
    const approved = owners.filter((o) => o.status === 'approved').length;
    const pending = owners.filter((o) => o.status === 'pending').length;
    const totalEarnings = owners.reduce(
      (sum, o) => sum + (o.totalEarnings || 0),
      0
    );
    return { total, approved, pending, totalEarnings };
  }, [owners]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v || 0);

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${
          styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}
      >
        {status === 'approved' && <FaCheck className="mr-1 text-[10px]" />}
        {status === 'pending' && <FaClock className="mr-1 text-[10px]" />}
        {status === 'rejected' && <FaTimes className="mr-1 text-[10px]" />}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const renderConfirmModal = () => {
    if (!confirmAction) return null;
    const { type, owner } = confirmAction;
    const isApprove = type === 'approve';

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmAction(null)}
        />
        <div className="relative w-full max-w-md bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl p-6 animate-slideUp">
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                isApprove ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              {isApprove ? (
                <FaCheck className="text-2xl text-green-400" />
              ) : (
                <FaTimes className="text-2xl text-red-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isApprove ? 'Approve Owner' : 'Reject Owner'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to {isApprove ? 'approve' : 'reject'}{' '}
              <span className="text-white font-medium">{owner.name}</span>?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  isApprove ? handleApprove(owner._id) : handleReject(owner._id)
                }
                className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition ${
                  isApprove
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {isApprove ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] p-6">
        <div className="flex items-center justify-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Owner Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage parking owners and their approvals
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">
                  Total Owners
                </p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FaUsers className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium uppercase tracking-wider">
                  Approved
                </p>
                <p className="text-3xl font-bold mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FaUserCheck className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium uppercase tracking-wider">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FaClock className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium uppercase tracking-wider">
                  Total Earnings
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FaRupeeSign className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-white/10">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full max-w-md pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name / Email
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    GST
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {paginatedOwners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FaBuilding className="text-3xl text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">
                          {search
                            ? 'No owners match your search'
                            : 'No owners found'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOwners.map((owner) => (
                    <tr
                      key={owner._id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {owner.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {owner.email || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                        {owner.company || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                        {owner.phone || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                        {owner.gst || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                        {owner.commissionRate != null
                          ? `${owner.commissionRate}%`
                          : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(owner.totalEarnings)}
                      </td>
                      <td className="px-4 py-3.5">
                        {getStatusBadge(owner.status)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {owner.status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    type: 'approve',
                                    owner,
                                  })
                                }
                                className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    type: 'reject',
                                    owner,
                                  })
                                }
                                className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition shadow-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {owner.status === 'approved' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              Approved
                            </span>
                          )}
                          {owner.status === 'rejected' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredOwners.length
                )}{' '}
                of {filteredOwners.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm rounded-lg transition ${
                      page === currentPage
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {renderConfirmModal()}
    </div>
  );
}
