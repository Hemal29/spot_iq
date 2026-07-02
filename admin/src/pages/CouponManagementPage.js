import { useState, useEffect, useMemo } from 'react';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaTag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaClock,
} from 'react-icons/fa';

const ITEMS_PER_PAGE = 10;

const initialFormState = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minBookingAmount: '',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
};

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCoupons();
      setCoupons(res.data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData(initialFormState);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue?.toString() || '',
      minBookingAmount: coupon.minBookingAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
    setFormData(initialFormState);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.code.trim()) {
      errors.code = 'Coupon code is required';
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.code.trim())) {
      errors.code = 'Only letters, numbers, hyphens, and underscores';
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      errors.discountValue = 'Valid discount value is required';
    } else if (
      formData.discountType === 'percentage' &&
      Number(formData.discountValue) > 100
    ) {
      errors.discountValue = 'Percentage cannot exceed 100';
    }

    if (
      formData.minBookingAmount &&
      Number(formData.minBookingAmount) < 0
    ) {
      errors.minBookingAmount = 'Cannot be negative';
    }

    if (
      formData.maxDiscount &&
      Number(formData.maxDiscount) < 0
    ) {
      errors.maxDiscount = 'Cannot be negative';
    }

    if (formData.usageLimit && Number(formData.usageLimit) < 1) {
      errors.usageLimit = 'Must be at least 1';
    }

    if (!formData.expiresAt) {
      errors.expiresAt = 'Expiry date is required';
    } else if (new Date(formData.expiresAt) < new Date()) {
      errors.expiresAt = 'Expiry date must be in the future';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      code: formData.code.trim(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minBookingAmount: formData.minBookingAmount
        ? Number(formData.minBookingAmount)
        : 0,
      maxDiscount: formData.maxDiscount
        ? Number(formData.maxDiscount)
        : null,
      usageLimit: formData.usageLimit
        ? Number(formData.usageLimit)
        : null,
      expiresAt: formData.expiresAt,
    };

    try {
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, payload);
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === editingCoupon._id ? { ...c, ...payload } : c
          )
        );
        toast.success('Coupon updated successfully');
      } else {
        const res = await adminService.createCoupon(payload);
        setCoupons((prev) => [...prev, res.data]);
        toast.success('Coupon created successfully');
      }
      closeModal();
    } catch (err) {
      console.error('Coupon save failed:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to save coupon'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteCoupon(deleteTarget._id);
      setCoupons((prev) =>
        prev.filter((c) => c._id !== deleteTarget._id)
      );
      toast.success('Coupon deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete coupon');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const filteredCoupons = useMemo(() => {
    if (!search) return coupons;
    const q = search.toLowerCase();
    return coupons.filter((c) => c.code?.toLowerCase().includes(q));
  }, [coupons, search]);

  const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (coupon) => {
    const isActive =
      coupon.status === 'active' &&
      coupon.expiresAt &&
      new Date(coupon.expiresAt) > new Date();
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
          <FaCheck className="mr-1 text-[10px]" /> Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-red-500/20 text-red-400 border-red-500/30">
        <FaClock className="mr-1 text-[10px]" /> Expired
      </span>
    );
  };

  const renderModal = () => {
    if (!modalOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        />
        <div className="relative w-full max-w-lg bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl animate-slideUp">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Coupon Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${
                  formErrors.code
                    ? 'border-red-500/50'
                    : 'border-white/10 focus:border-orange-500'
                }`}
              />
              {formErrors.code && (
                <p className="mt-1 text-xs text-red-400">{formErrors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the coupon..."
                rows={2}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Discount Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleChange('discountType', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Discount Value <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => handleChange('discountValue', e.target.value)}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                    min="0"
                    className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${
                      formErrors.discountValue
                        ? 'border-red-500/50'
                        : 'border-white/10 focus:border-orange-500'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {formData.discountType === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
                {formErrors.discountValue && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.discountValue}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Min Booking Amount
                </label>
                <input
                  type="number"
                  value={formData.minBookingAmount}
                  onChange={(e) => handleChange('minBookingAmount', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${
                    formErrors.minBookingAmount
                      ? 'border-red-500/50'
                      : 'border-white/10 focus:border-orange-500'
                  }`}
                />
                {formErrors.minBookingAmount && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.minBookingAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Max Discount
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => handleChange('maxDiscount', e.target.value)}
                  placeholder="Unlimited"
                  min="0"
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${
                    formErrors.maxDiscount
                      ? 'border-red-500/50'
                      : 'border-white/10 focus:border-orange-500'
                  }`}
                />
                {formErrors.maxDiscount && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.maxDiscount}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => handleChange('usageLimit', e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${
                    formErrors.usageLimit
                      ? 'border-red-500/50'
                      : 'border-white/10 focus:border-orange-500'
                  }`}
                />
                {formErrors.usageLimit && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.usageLimit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Expires At <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => handleChange('expiresAt', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${
                    formErrors.expiresAt
                      ? 'border-red-500/50'
                      : 'border-white/10 focus:border-orange-500'
                  }`}
                />
                {formErrors.expiresAt && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.expiresAt}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
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
                    Saving...
                  </>
                ) : editingCoupon ? (
                  'Update Coupon'
                ) : (
                  'Create Coupon'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDeleteDialog = () => {
    if (!deleteTarget) return null;

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        />
        <div className="relative w-full max-w-md bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl p-6 animate-slideUp">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <FaTrash className="text-2xl text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Coupon
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">
                {deleteTarget.code}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition shadow-sm"
              >
                Delete
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Coupon Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage discount coupons
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition shadow-sm"
          >
            <FaPlus /> Create Coupon
          </button>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-white/10">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search by coupon code..."
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
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Min Amount
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Max Discount
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Used / Max
                  </th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expires At
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {paginatedCoupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FaTag className="text-3xl text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">
                          {search
                            ? 'No coupons match your search'
                            : 'No coupons found'}
                        </p>
                        {!search && (
                          <button
                            onClick={openCreateModal}
                            className="mt-2 text-sm text-orange-500 hover:text-orange-400 font-medium"
                          >
                            Create your first coupon
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((coupon) => {
                    const isExpired =
                      coupon.expiresAt &&
                      new Date(coupon.expiresAt) < new Date();

                    return (
                      <tr
                        key={coupon._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold text-orange-400 bg-orange-500/10 rounded-lg border border-orange-500/20">
                              {coupon.code}
                            </span>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]">
                              {coupon.description}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `₹${Number(coupon.discountValue).toLocaleString(
                                  'en-IN'
                                )}`}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
                            {coupon.discountType === 'percentage'
                              ? 'OFF'
                              : 'OFF'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm text-gray-700 dark:text-gray-300">
                          {coupon.minBookingAmount
                            ? `₹${Number(
                                coupon.minBookingAmount
                              ).toLocaleString('en-IN')}`
                            : '-'}
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm text-gray-700 dark:text-gray-300">
                          {coupon.maxDiscount
                            ? `₹${Number(coupon.maxDiscount).toLocaleString(
                                'en-IN'
                              )}`
                            : '-'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {coupon.usedCount || 0}
                            {coupon.usageLimit ? (
                              <span className="text-gray-400 dark:text-gray-500">
                                {' '}
                                / {coupon.usageLimit}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">
                                {' '}
                                / ∞
                              </span>
                            )}
                          </span>
                          {coupon.usageLimit && (
                            <div className="mt-1.5 w-20 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    ((coupon.usedCount || 0) /
                                      coupon.usageLimit) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {getStatusBadge(coupon)}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`text-sm ${
                              isExpired
                                ? 'text-red-400'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {coupon.expiresAt
                              ? new Date(
                                  coupon.expiresAt
                                ).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(coupon)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                              title="Edit Coupon"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(coupon)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                              title="Delete Coupon"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredCoupons.length
                )}{' '}
                of {filteredCoupons.length}
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

      {renderModal()}
      {renderDeleteDialog()}
    </div>
  );
}
