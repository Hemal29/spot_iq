import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBell, FaCheckDouble, FaPaperPlane, FaTrash, FaEnvelope, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import adminService from '../services/adminService';
import PageHeader from '../components/common/PageHeader';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

const typeColors = {
  booking: 'bg-gray-100 dark:bg-gray-800 text-gray-700/20 ',
  payment: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20',
  system: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20',
  promo: 'bg-gray-100 dark:bg-gray-800 text-gray-700/20 ',
};

const typeOptions = ['booking', 'payment', 'system', 'promo'];

export default function NotificationManagementPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sendToAll: true,
    userId: '',
    type: 'system',
    title: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({ total: 0, unread: 0, sentToday: 0 });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setError(null);
    try {
      const res = await adminService.getNotifications();
      const data = res.data?.data || res.data?.notifications || res.data || [];
      const list = (Array.isArray(data) ? data : []).map((n) => ({
        ...n,
        status: n.isRead ? 'read' : 'unread',
        readAt: n.isRead ? (n.readAt || n.updatedAt) : null,
      }));
      setNotifications(list);
      const today = new Date();
      setStats({
        total: list.length,
        unread: list.filter((n) => n.status === 'unread').length,
        sentToday: list.filter((n) => {
          const d = new Date(n.createdAt);
          return d.toDateString() === today.toDateString();
        }).length,
      });
    } catch (err) {
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        type: formData.type,
        title: formData.title,
        message: formData.message,
      };
      if (formData.sendToAll) {
        payload.sendToAll = true;
      } else {
        payload.userId = formData.userId;
      }
      await adminService.createNotification(payload);
      toast.success('Notification sent successfully');
      setModalOpen(false);
      setFormData({ sendToAll: true, userId: '', type: 'system', title: '', message: '' });
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read', readAt: new Date().toISOString() } : n))
      );
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread' && n.status === 'read') return false;
    if (activeTab === 'read' && n.status !== 'read') return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-400 border-t-transparent" />
      </div>
    );
  }

  if (error && !notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FaExclamationTriangle className="text-4xl text-red-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500  mb-4">{error}</p>
        <button
          onClick={fetchNotifications}
          className="px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const cards = [
    { label: 'Total Notifications', value: stats.total, icon: FaBell, color: 'bg-primary-600' },
    { label: 'Unread', value: stats.unread, icon: FaEnvelope, color: 'bg-primary-600' },
    { label: 'Sent Today', value: stats.sentToday, icon: FaPaperPlane, color: 'bg-primary-400' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Management"
        subtitle="Send and manage push notifications"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-400/25"
          >
            <FaBell />
            New Notification
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-900   rounded-2xl border border-gray-200 dark:border-gray-700  shadow-sm p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 ">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900   rounded-2xl border border-gray-200 dark:border-gray-700  shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 ">
          <div className="flex items-center gap-1 px-4 pt-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.key
                    ? 'text-primary-400 bg-gray-50/10 border-b-2 border-primary-400'
                    : 'text-gray-500 dark:text-gray-400 dark:text-gray-500  hover:text-gray-700 dark:text-gray-300 '
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="px-4 pb-4 pt-2">
            <input
              type="text"
              placeholder="Search notifications by title or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  rounded-xl text-sm text-gray-900 dark:text-gray-100  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaBell className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500  text-sm">
              {search ? 'No matching notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 ">
                  {['ID', 'Type', 'Title', 'Message', 'To', 'Status', 'Created At', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr key={n.id} className="border-b border-gray-100 dark:border-gray-700/50  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100  font-mono">
                      {String(n.id || '-')?.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${typeColors[n.type] || typeColors.system}`}>
                        {n.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100  max-w-[160px] truncate">
                      {n.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500  max-w-[200px] truncate">
                      {n.message}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ">
                      {n.sendToAll || n.toAll ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-400">
                          <FaCheckDouble className="text-[10px]" /> All Users
                        </span>
                      ) : (
                        <span className="font-mono text-xs">{n.userId ? (String(n.userId).slice(-6)) : '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        n.readAt || n.status === 'read'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600/20'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600/20'
                      }`}>
                        {n.readAt || n.status === 'read' ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  whitespace-nowrap">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {!(n.readAt || n.status === 'read') && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="p-1.5 text-primary-400 hover:bg-gray-50:bg-gray-500/10 rounded-lg transition"
                            title="Mark as Read"
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50:bg-red-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 " onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 ">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 ">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">New Notification</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500  rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800  transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={formData.sendToAll}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sendToAll: e.target.checked, userId: '' }))}
                  className="w-4 h-4 rounded border-gray-300 text-gray-500 dark:text-gray-400 dark:text-gray-500 focus:ring-primary-400"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                  Send to all users
                </label>
              </div>
              {!formData.sendToAll && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1">User ID</label>
                  <input
                    type="text"
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter user ID..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  rounded-xl text-sm text-gray-900 dark:text-gray-100  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  rounded-xl text-sm text-gray-900 dark:text-gray-100  focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  rounded-xl text-sm text-gray-900 dark:text-gray-100  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700  rounded-xl text-sm text-gray-900 dark:text-gray-100  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300  bg-gray-100 dark:bg-gray-800  hover:bg-gray-200:bg-white/20 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
