import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import adminService from '../services/adminService';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const statusStyles = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  assigned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
};

const priorityStyles = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const priorityOptions = ['low', 'medium', 'high'];
const statusOptions = ['open', 'assigned', 'resolved', 'closed'];

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const [assignModal, setAssignModal] = useState({ open: false, ticket: null });
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getTickets();
      const data = res.data?.tickets || res.data || [];
      setTickets(data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load tickets';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await adminService.getUsers({ role: 'admin' });
      setAdmins(res.data?.users || res.data || []);
    } catch (err) {
      toast.error('Failed to load admin users');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateTicketStatus(id, { status });
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
      toast.success(`Ticket marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAssign = async () => {
    if (!selectedAdmin) {
      toast.error('Please select an admin');
      return;
    }
    setAssigning(true);
    try {
      await adminService.assignTicket(assignModal.ticket._id, { adminId: selectedAdmin });
      setTickets((prev) =>
        prev.map((t) =>
          t._id === assignModal.ticket._id
            ? { ...t, assignedTo: admins.find((a) => a._id === selectedAdmin), status: 'assigned' }
            : t
        )
      );
      toast.success('Ticket assigned successfully');
      setAssignModal({ open: false, ticket: null });
      setSelectedAdmin('');
    } catch (err) {
      toast.error('Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    high: tickets.filter((t) => t.priority === 'high').length,
  };

  const filtered = tickets.filter((t) => {
    if (activeTab !== 'all' && t.status !== activeTab) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.customer?.name?.toLowerCase().includes(q) ||
      t._id?.toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: 'Total Tickets', value: stats.total, icon: FaTicketAlt, color: 'from-blue-500 to-blue-600' },
    { label: 'Open', value: stats.open, icon: FaSpinner, color: 'from-blue-400 to-blue-500' },
    { label: 'Resolved', value: stats.resolved, icon: FaCheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'High Priority', value: stats.high, icon: FaExclamationTriangle, color: 'from-red-500 to-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FaExclamationTriangle className="text-4xl text-red-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchTickets}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage customer support requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="border-b border-gray-200 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-1 px-4 pt-3">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.key
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-b-2 border-orange-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="px-4 pb-4 pt-2 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by subject, customer or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] max-w-md px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
            />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map((p) => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaTicketAlt className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search || activeTab !== 'all' || priorityFilter !== 'all' ? 'No matching tickets' : 'No tickets yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  {['ID', 'Subject', 'Customer', 'Priority', 'Status', 'Assigned To', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => {
                  const isExpanded = expandedId === ticket._id;
                  const customerName = ticket.customerName || ticket.customer?.name || ticket.customer?.email || '-';
                  const assignedName = ticket.assignedTo?.name || ticket.assignedTo?.email || (ticket.assignedTo ? 'Assigned' : '-');
                  return (
                    <>
                      <tr
                        key={ticket._id}
                        className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                          {ticket._id?.slice(-6) || ticket.id?.slice(-6) || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                          {ticket.subject}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {customerName}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityStyles[ticket.priority] || priorityStyles.low}`}>
                            {ticket.priority || 'low'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[ticket.status] || statusStyles.open}`}>
                            {ticket.status || 'open'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {ticket.assignedTo ? (
                            <div className="flex items-center gap-1.5">
                              <FaUser className="text-[10px] text-gray-400" />
                              {assignedName}
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {isExpanded ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${ticket._id}-detail`}>
                          <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-white/[0.02]">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Message</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {ticket.message || ticket.description || 'No message'}
                                  </p>
                                </div>
                                {ticket.resolution && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Resolution</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.resolution}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Update Status:</span>
                                {statusOptions.map((s) => (
                                  <button
                                    key={s}
                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ticket._id, s); }}
                                    className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition ${
                                      ticket.status === s
                                        ? 'bg-gray-200 dark:bg-white/20 text-gray-700 dark:text-gray-300 cursor-default'
                                        : 'bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/20'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                                {!ticket.assignedTo && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchAdmins();
                                      setSelectedAdmin('');
                                      setAssignModal({ open: true, ticket });
                                    }}
                                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition"
                                  >
                                    Assign
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAssignModal({ open: false, ticket: null })} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Ticket</h2>
              <button onClick={() => setAssignModal({ open: false, ticket: null })} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Admin</label>
                {admins.length === 0 ? (
                  <p className="text-sm text-gray-400">Loading admins...</p>
                ) : (
                  <select
                    value={selectedAdmin}
                    onChange={(e) => setSelectedAdmin(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="">Choose an admin...</option>
                    {admins.map((a) => (
                      <option key={a._id} value={a._id}>{a.name || a.email}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setAssignModal({ open: false, ticket: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !selectedAdmin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
