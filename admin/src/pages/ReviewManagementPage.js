import { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import adminService from '../services/adminService';
import { FaStar, FaSearch, FaCheckCircle, FaTrash } from 'react-icons/fa';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
];

const ratingOptions = [
  { value: 0, label: 'All Ratings' },
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4 Stars' },
  { value: 3, label: '3 Stars' },
  { value: 2, label: '2 Stars' },
  { value: 1, label: '1 Star' },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewManagementPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await adminService.getAllReviews();
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (review) => {
    try {
      await adminService.approveReview(review._id);
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, status: 'approved' } : r))
      );
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteReview(deleteTarget._id);
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (ratingFilter > 0 && (r.rating || 0) !== ratingFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const user = (r.customerName || r.user?.name || '').toLowerCase();
      const parking = (r.parkingName || r.parking?.name || '').toLowerCase();
      if (!user.includes(q) && !parking.includes(q)) return false;
    }
    return true;
  });

  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0';

  const columns = [
    { key: '_id', label: 'ID', render: (v) => <span className="font-mono text-xs">{v?.slice(-8)}</span> },
    {
      key: 'customerName',
      label: 'User',
      render: (v, row) => row.customerName || row.user?.name || '-',
    },
    {
      key: 'parkingName',
      label: 'Parking',
      render: (v, row) => row.parkingName || row.parking?.name || '-',
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (v) => <StarRating rating={v || 0} />,
    },
    {
      key: 'comment',
      label: 'Review',
      render: (v) => (
        <span className="max-w-xs truncate block text-gray-600 text-sm" title={v}>
          {v || <span className="text-gray-400 italic">No comment</span>}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
            v === 'approved'
              ? 'bg-green-100 text-green-700 border-green-200'
              : v === 'pending'
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
              : 'bg-red-100 text-red-700 border-red-200'
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'pending' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleApprove(row); }}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Approve Review"
            >
              <FaCheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); setConfirmOpen(true); }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete Review"
          >
            <FaTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Review Management" subtitle="Moderate customer reviews" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Total Reviews</p>
              <p className="text-2xl font-bold mt-1">{totalReviews}</p>
            </div>
            <FaStar className="text-3xl text-white/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Pending Approval</p>
              <p className="text-2xl font-bold mt-1">{pendingReviews}</p>
            </div>
            <FaCheckCircle className="text-3xl text-white/40" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Average Rating</p>
              <p className="text-2xl font-bold mt-1">{avgRating}</p>
            </div>
            <FaStar className="text-3xl text-white/40" />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by user or parking..."
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
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {ratingOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <EmptyState
            icon={FaSearch}
            title="No reviews found"
            description={search || statusFilter !== 'all' || ratingFilter > 0 ? 'Try adjusting your filters' : 'No reviews have been submitted yet'}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Review"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            {deleteTarget && (
              <p className="text-sm text-gray-500">
                User: <strong>{deleteTarget.customerName || deleteTarget.user?.name}</strong>
                <br />
                Parking: <strong>{deleteTarget.parkingName || deleteTarget.parking?.name}</strong>
              </p>
            )}
          </div>
        }
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
