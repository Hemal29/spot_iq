import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaTicketAlt, FaExclamationTriangle, FaCheckCircle, FaSpinner,
  FaUser, FaSearch, FaFilter, FaEnvelope, FaClock, FaUserCog,
  FaReply, FaTag, FaCalendarAlt, FaEye, FaSyncAlt, FaUserPlus,
  FaTimes, FaChevronDown,
} from 'react-icons/fa';
import adminService from '../services/adminService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const statusStyles = {
  open: 'bg-gray-100 dark:bg-gray-800 text-gray-700/20  border border-gray-200/30',
  assigned: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20 border border-gray-200/30',
  resolved: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20 border border-gray-200/30',
  closed: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20  border border-gray-200/30',
};

const priorityStyles = {
  low: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20 border border-gray-200/30',
  medium: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20 border border-gray-200/30',
  high: 'bg-red-100 text-red-700/20 border border-red-200/30',
};

const statusOptions = ['open', 'assigned', 'resolved', 'closed'];
const priorityOptions = ['low', 'medium', 'high'];

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewTicket, setViewTicket] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, ticket: null });
  const [statusForm, setStatusForm] = useState({ status: '', resolution: '' });
  const [assignModal, setAssignModal] = useState({ open: false, ticket: null });
  const [assignForm, setAssignForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTickets();
      const data = res.data?.data || res.data?.tickets || res.data || [];
      const list = (Array.isArray(data) ? data : []).map((t) => ({
        ...t,
        customerName: t.customerName || t.customer?.name || t.User?.name || '',
        customerEmail: t.customerEmail || t.customer?.email || t.User?.email || '',
        assigneeName: t.assigneeName || t.assignee?.name || '',
      }));
      setTickets(list);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    assigned: tickets.filter((t) => t.status === 'assigned').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }), [tickets]);

  const filtered = useMemo(() => tickets.filter((t) => {
    if (activeTab !== 'all' && t.status !== activeTab) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.customer?.name?.toLowerCase().includes(q) ||
      t.customer?.email?.toLowerCase().includes(q) ||
      String(t.id || '').toLowerCase().includes(q)
    );
  }), [tickets, activeTab, priorityFilter, search]);

  const handleUpdateStatus = async () => {
    if (!statusForm.status) {
      toast.error('Please select a status');
      return;
    }
    setSaving(true);
    try {
      await adminService.updateTicketStatus(statusModal.ticket.id, {
        status: statusForm.status,
        resolution: statusForm.resolution,
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === statusModal.ticket.id
            ? { ...t, status: statusForm.status, resolution: statusForm.resolution || t.resolution }
            : t
        )
      );
      toast.success(`Ticket marked as ${statusForm.status}`);
      setStatusModal({ open: false, ticket: null });
      setStatusForm({ status: '', resolution: '' });
    } catch (err) {
      toast.error('Failed to update ticket status');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!assignForm.name || !assignForm.email) {
      toast.error('Please fill in staff name and email');
      return;
    }
    setSaving(true);
    try {
      await adminService.assignTicket(assignModal.ticket.id, {
        staffName: assignForm.name,
        staffEmail: assignForm.email,
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === assignModal.ticket.id
            ? { ...t, assignedTo: { name: assignForm.name, email: assignForm.email }, status: 'assigned' }
            : t
        )
      );
      toast.success('Ticket assigned successfully');
      setAssignModal({ open: false, ticket: null });
      setAssignForm({ name: '', email: '' });
    } catch (err) {
      toast.error('Failed to assign ticket');
    } finally {
      setSaving(false);
    }
  };

  const openStatusModal = (ticket) => {
    setStatusForm({ status: ticket.status || 'open', resolution: ticket.resolution || '' });
    setStatusModal({ open: true, ticket });
  };

  const statCards = [
    { label: 'Total Tickets', value: stats.total, icon: FaTicketAlt, gradient: 'bg-primary-600' },
    { label: 'Open', value: stats.open, icon: FaSpinner, gradient: 'bg-primary-600' },
    { label: 'Assigned', value: stats.assigned, icon: FaUserCog, gradient: 'from-yellow-500 to-yellow-600' },
    { label: 'Resolved', value: stats.resolved, icon: FaCheckCircle, gradient: 'bg-primary-400' },
    { label: 'Closed', value: stats.closed, icon: FaTimes, gradient: 'from-gray-500 to-gray-600' },
  ];

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      render: (v, row) => (
        <div className="max-w-[200px]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100  truncate">{row.subject || 'No Subject'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  font-mono mt-0.5">#{String(row.id || '').slice(-6) || '-'}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (v, row) => {
        const name = row.customerName || row.customer?.name || '-';
        const email = row.customerEmail || row.customer?.email || '';
        return (
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-100 ">{name}</p>
            {email && <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{email}</p>}
          </div>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v, row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityStyles[v] || priorityStyles.low}`}>
          {v || 'low'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[v] || statusStyles.open}`}>
          {v || 'open'}
        </span>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (v, row) => {
        const name = row.assigneeName || row.assignee?.name || row.assignedTo?.name || row.assignedTo?.email;
        if (!name) return <span className="text-xs text-gray-400 dark:text-gray-500  italic">Unassigned</span>;
        return (
          <div className="flex items-center gap-1.5">
            <FaUser className="text-[10px] text-gray-400 dark:text-gray-500 " />
            <span className="text-sm text-gray-700 dark:text-gray-300 ">{name}</span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  whitespace-nowrap">
          {v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
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
            onClick={(e) => { e.stopPropagation(); setViewTicket(row); }}
            className="p-1.5 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  rounded-lg transition-colors"
            title="View Ticket"
          >
            <FaEye className="text-xs" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openStatusModal(row); }}
            className="p-1.5 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  rounded-lg transition-colors"
            title="Update Status"
          >
            <FaSyncAlt className="text-xs" />
          </button>
          {!row.assignedTo && (
            <button
              onClick={(e) => { e.stopPropagation(); setAssignForm({ name: '', email: '' }); setAssignModal({ open: true, ticket: row }); }}
              className="p-1.5 text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  rounded-lg transition-colors"
              title="Assign Staff"
            >
              <FaUserPlus className="text-xs" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Support Tickets" subtitle="Manage customer support requests" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="glass-card p-5 hover:shadow-md transition-shadow duration-200 overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent[0.02]  pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-current/20 flex-shrink-0`}>
                <card.icon className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 ">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card">
        <div className="border-b border-gray-200 dark:border-gray-700 ">
          <div className="flex flex-wrap items-center gap-1 px-4 pt-3">
            {statusTabs.map((tab) => (
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
          <div className="px-4 pb-4 pt-2 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500  text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search by subject, customer or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="select-field w-auto min-w-[150px]"
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map((p) => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            {search || activeTab !== 'all' || priorityFilter !== 'all' ? (
              <button
                onClick={() => { setSearch(''); setActiveTab('all'); setPriorityFilter('all'); }}
                className="btn-ghost text-xs"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No tickets found" />
      </div>

      <Modal isOpen={!!viewTicket} onClose={() => setViewTicket(null)} title="Ticket Details" size="lg">
        {viewTicket && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800  rounded-xl">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 ">{viewTicket.subject || 'No Subject'}</h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityStyles[viewTicket.priority] || priorityStyles.low}`}>
                    <FaTag className="mr-1 text-[10px]" />
                    {viewTicket.priority || 'low'} priority
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[viewTicket.status] || statusStyles.open}`}>
                    {viewTicket.status || 'open'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Ticket ID</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 ">#{String(viewTicket.id || '-').slice(-8)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-2">Customer Information</h4>
                  <div className="p-4 glass-card rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {(viewTicket.customerName || viewTicket.customer?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">
                          {viewTicket.customerName || viewTicket.customer?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                          {viewTicket.customerEmail || viewTicket.customer?.email || ''}
                        </p>
                      </div>
                    </div>
                    {viewTicket.customer?.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 ">Phone: {viewTicket.customer.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-2">Assignment</h4>
                  <div className="p-4 glass-card rounded-xl">
                    {viewTicket.assignedTo ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                          {(viewTicket.assignedTo.name || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">{viewTicket.assignedTo.name || 'Admin'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{viewTicket.assignedTo.email || ''}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500  italic">Not assigned yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-2">Message</h4>
                  <div className="p-4 glass-card rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300  whitespace-pre-wrap leading-relaxed">
                      {viewTicket.message || viewTicket.description || 'No message provided'}
                    </p>
                  </div>
                </div>

                {viewTicket.resolution && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider mb-2">Resolution</h4>
                    <div className="p-4 bg-gray-50/10 border border-gray-200/20 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 whitespace-pre-wrap leading-relaxed">
                        {viewTicket.resolution}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700  text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
              <div className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-[10px]" />
                Created: {viewTicket.createdAt ? new Date(viewTicket.createdAt).toLocaleString() : '-'}
              </div>
              {viewTicket.updatedAt && viewTicket.updatedAt !== viewTicket.createdAt && (
                <div className="flex items-center gap-1.5">
                  <FaSyncAlt className="text-[10px]" />
                  Updated: {new Date(viewTicket.updatedAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => { setViewTicket(null); openStatusModal(viewTicket); }} className="btn-primary">
                <FaSyncAlt className="text-xs" />
                Update Status
              </button>
              {!viewTicket.assignedTo && (
                <button onClick={() => { setViewTicket(null); setAssignForm({ name: '', email: '' }); setAssignModal({ open: true, ticket: viewTicket }); }} className="btn-secondary">
                  <FaUserPlus className="text-xs" />
                  Assign Staff
                </button>
              )}
              <button onClick={() => setViewTicket(null)} className="btn-ghost ml-auto">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={statusModal.open} onClose={() => { setStatusModal({ open: false, ticket: null }); setStatusForm({ status: '', resolution: '' }); }} title="Update Ticket Status">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-2">Status</label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
              className="select-field"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-2">Resolution Notes</label>
            <textarea
              value={statusForm.resolution}
              onChange={(e) => setStatusForm((p) => ({ ...p, resolution: e.target.value }))}
              rows={4}
              placeholder="Enter resolution notes (optional)..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleUpdateStatus}
              disabled={saving || !statusForm.status}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Update Status'}
            </button>
            <button
              onClick={() => { setStatusModal({ open: false, ticket: null }); setStatusForm({ status: '', resolution: '' }); }}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={assignModal.open} onClose={() => { setAssignModal({ open: false, ticket: null }); setAssignForm({ name: '', email: '' }); }} title="Assign Staff">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-2">Staff Name</label>
            <input
              type="text"
              value={assignForm.name}
              onChange={(e) => setAssignForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter staff member name"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-2">Staff Email</label>
            <input
              type="email"
              value={assignForm.email}
              onChange={(e) => setAssignForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Enter staff member email"
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAssign}
              disabled={saving || !assignForm.name || !assignForm.email}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Assigning...' : 'Assign Staff'}
            </button>
            <button
              onClick={() => { setAssignModal({ open: false, ticket: null }); setAssignForm({ name: '', email: '' }); }}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
