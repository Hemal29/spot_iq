import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaThLarge, FaCar, FaMotorcycle, FaBolt, FaPlus, FaEdit, FaTrash,
  FaParking, FaSearch, FaFilter, FaCog, FaDownload, FaChartPie,
  FaCheck, FaTimes, FaExclamationTriangle, FaQrcode, FaFileCsv,
  FaSyncAlt, FaLayerGroup,
} from 'react-icons/fa';

const statusConfig = {
  available: { label: 'Available', color: 'bg-gray-100/15 text-gray-600 dark:text-gray-400 dark:text-gray-500 border border-gray-200/50/20' },
  occupied: { label: 'Occupied', color: 'bg-red-100/15 text-red-700 border border-red-200/50/20' },
  reserved: { label: 'Reserved', color: 'bg-gray-100/15 text-gray-600 dark:text-gray-400 dark:text-gray-500 border border-gray-200/50/20' },
  maintenance: { label: 'Maintenance', color: 'bg-gray-200/15 text-gray-600 dark:text-gray-400 dark:text-gray-500  border border-gray-300/50/20' },
};

const vehicleTypeMeta = {
  car: { icon: FaCar, color: 'text-gray-500', label: 'Car' },
  bike: { icon: FaMotorcycle, color: 'text-primary-400', label: 'Bike' },
  ev: { icon: FaBolt, color: 'text-primary-400', label: 'EV' },
};

const PIE_COLORS = ['#22c55e', '#ef4444', '#eab308', '#6b7280'];

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    let current = 0;
    const step = Math.max(1, Math.floor(num / 25));
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setDisplay(num); clearInterval(timer); } else setDisplay(current);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700/50 ">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700  rounded-lg animate-pulse" style={{ width: i === 0 ? '80px' : '60%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function SlotManagementPage() {
  const [searchParams] = useSearchParams();
  const parkingIdParam = searchParams.get('parkingId') || '';

  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [parkings, setParkings] = useState([]);
  const [selectedParkingId, setSelectedParkingId] = useState(parkingIdParam);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ parkingId: '', slotNumber: '', floor: 'Ground', zone: 'A', vehicleType: 'car', slotSize: 'standard', type: 'standard' });

  const [editModal, setEditModal] = useState({ open: false, slot: null });
  const [editData, setEditData] = useState({});

  const [genModal, setGenModal] = useState({ open: false });
  const [genForm, setGenForm] = useState({ parkingId: '', prefix: '', startNumber: 1, count: 20, floor: 'Ground', zone: 'A', vehicleType: 'car', type: 'standard' });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchParkings(); }, []);
  useEffect(() => { fetchSlots(); }, [selectedParkingId, statusFilter, typeFilter, vehicleFilter]);

  const fetchParkings = async () => {
    try {
      const r = await adminService.getParkings({ limit: 200 });
      setParkings(Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : []);
    } catch (_) { /* */ }
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const params = { limit: 500 };
      if (selectedParkingId) params.parkingId = selectedParkingId;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (vehicleFilter) params.vehicleType = vehicleFilter;
      const r = await adminService.getAllSlots(params);
      const data = r.data?.data || r.data || [];
      setSlots(Array.isArray(data) ? data : []);
      const sRes = await adminService.getSlotStats(selectedParkingId ? { parkingId: selectedParkingId } : {}).catch(() => null);
      setStats(sRes?.data?.data || null);
    } catch (_) { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  };

  const filteredSlots = useMemo(() => {
    if (!search) return slots;
    const q = search.toLowerCase();
    return slots.filter(s =>
      (s.slotNumber || '').toLowerCase().includes(q) ||
      (s.floor || '').toLowerCase().includes(q) ||
      (s.zone || '').toLowerCase().includes(q)
    );
  }, [slots, search]);

  const computedStats = useMemo(() => {
    if (stats) return stats;
    const total = slots.length;
    const available = slots.filter(s => s.status === 'available').length;
    const occupied = slots.filter(s => s.status === 'occupied').length;
    const reserved = slots.filter(s => s.status === 'reserved').length;
    const maintenance = slots.filter(s => s.status === 'maintenance').length;
    return { total, available, occupied, reserved, maintenance, utilizationRate: total ? Math.round(((occupied + reserved) / total) * 100) : 0 };
  }, [stats, slots]);

  const pieData = useMemo(() => [
    { name: 'Available', value: computedStats.available || 0 },
    { name: 'Occupied', value: computedStats.occupied || 0 },
    { name: 'Reserved', value: computedStats.reserved || 0 },
    { name: 'Maintenance', value: computedStats.maintenance || 0 },
  ], [computedStats]);

  const statCards = [
    { label: 'Total Slots', value: computedStats.total || 0, icon: FaThLarge, gradient: 'bg-gray-700' },
    { label: 'Available', value: computedStats.available || 0, icon: FaCheck, gradient: 'bg-primary-400' },
    { label: 'Occupied', value: computedStats.occupied || 0, icon: FaTimes, gradient: 'bg-red-600' },
    { label: 'Reserved', value: computedStats.reserved || 0, icon: FaExclamationTriangle, gradient: 'bg-gray-500' },
    { label: 'Maintenance', value: computedStats.maintenance || 0, icon: FaCog, gradient: 'bg-primary-400' },
  ];

  const openEditModal = (slot) => {
    setEditModal({ open: true, slot });
    setEditData({
      status: slot.status || 'available',
      type: slot.type || 'standard',
      floor: slot.floor || 'Ground',
      zone: slot.zone || 'A',
      vehicleType: slot.vehicleType || 'car',
      slotSize: slot.slotSize || 'standard',
    });
  };

  const handleCreateSlot = async () => {
    if (!createForm.parkingId || !createForm.slotNumber) { toast.warning('Parking and slot number are required'); return; }
    setSaving(true);
    try {
      await adminService.createSlot(createForm);
      toast.success('Slot created successfully');
      setCreateModal(false);
      setCreateForm({ parkingId: '', slotNumber: '', floor: 'Ground', zone: 'A', vehicleType: 'car', slotSize: 'standard', type: 'standard' });
      fetchSlots();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create slot'); }
    finally { setSaving(false); }
  };

  const handleUpdateSlot = async () => {
    if (!editModal.slot) return;
    setSaving(true);
    try {
      await adminService.updateSlot(editModal.slot.id || editModal.slot._id, editData);
      toast.success('Slot updated successfully');
      setEditModal({ open: false, slot: null });
      fetchSlots();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update slot'); }
    finally { setSaving(false); }
  };

  const handleBulkGenerate = async () => {
    if (!genForm.parkingId) { toast.warning('Please select a parking location'); return; }
    if (!genForm.count || genForm.count < 1) { toast.warning('Count must be at least 1'); return; }
    setGenerating(true);
    try {
      await adminService.createSlots(genForm.parkingId, genForm);
      toast.success(`Generated ${genForm.count} slots successfully`);
      setGenModal({ open: false });
      setGenForm({ parkingId: '', prefix: '', startNumber: 1, count: 20, floor: 'Ground', zone: 'A', vehicleType: 'car', type: 'standard' });
      fetchSlots();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to generate slots'); }
    finally { setGenerating(false); }
  };

  const handleDeleteSlot = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteSlot(deleteTarget.id || deleteTarget._id);
      toast.success('Slot deleted successfully');
      setConfirmOpen(false);
      setDeleteTarget(null);
      setEditModal({ open: false, slot: null });
      fetchSlots();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete slot'); }
  };

  const handleExportCSV = () => {
    const headers = ['Slot Number', 'Floor', 'Zone', 'Vehicle Type', 'Slot Type', 'Status', 'QR Code'];
    const rows = filteredSlots.map(s => [
      s.slotNumber, s.floor, s.zone, s.vehicleType, s.type, s.status, s.qrCode || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'slots.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const clearFilters = () => { setStatusFilter(''); setTypeFilter(''); setVehicleFilter(''); setSearch(''); };

  const hasActiveFilters = statusFilter || typeFilter || vehicleFilter || search;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Slot Management"
        subtitle="Create, generate, filter, and monitor all parking slots in real-time"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Slots' },
        ]}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card p-5 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent[0.02]  pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.gradient} flex items-center justify-center shadow-lg`}>
                  <s.icon className="text-white text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100  tracking-tight">
                <AnimatedNumber value={s.value} />
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-4 flex items-center gap-2">
              <FaChartPie className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm" />
              Occupancy Distribution
            </h3>
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(30,41,59,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 ">
                    <span className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      {d.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-5 lg:col-span-2"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-4 flex items-center gap-2">
              <FaLayerGroup className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm" />
              Utilization Rate
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700  rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${computedStats.utilizationRate || 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute left-0 top-0 h-full bg-primary-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
                  <span>0%</span>
                  <span className="font-semibold text-primary-400">{computedStats.utilizationRate || 0}% Utilized</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-400">{computedStats.utilizationRate || 0}%</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500  uppercase tracking-wider">Efficiency</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toolbar */}
      <div className="glass-card">
        <div className="p-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500  text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search slot number, floor, zone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Parking Selector */}
            <select
              value={selectedParkingId}
              onChange={(e) => setSelectedParkingId(e.target.value)}
              className="select-field w-full lg:w-56"
            >
              <option value="">All Parkings</option>
              {parkings.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.parkingName}{p.city ? ` - ${p.city}` : ''}</option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost ${showFilters || hasActiveFilters ? 'bg-gray-50/10 text-primary-400' : ''}`}
            >
              <FaFilter className="text-xs" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gray-500" />}
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setCreateModal(true)} className="btn-primary">
                <FaPlus className="text-xs" /> Add Slot
              </button>
              <button onClick={() => setGenModal({ open: true })} className="btn-primary">
                <FaCog className="text-xs" /> Bulk Generate
              </button>
              <button onClick={fetchSlots} className="btn-outline">
                <FaSyncAlt className="text-xs" /> Refresh
              </button>
              <button onClick={handleExportCSV} className="btn-outline">
                <FaFileCsv className="text-xs" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-5 pb-5">
                <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 ">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-1.5">Status</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-40">
                      <option value="">All Status</option>
                      {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-1.5">Slot Type</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="select-field w-40">
                      <option value="">All Types</option>
                      <option value="standard">Standard</option>
                      <option value="ev">EV</option>
                      <option value="handicapped">Handicapped</option>
                      <option value="compact">Compact</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-1.5">Vehicle</label>
                    <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className="select-field w-40">
                      <option value="">All Vehicles</option>
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                      <option value="ev">EV</option>
                    </select>
                  </div>
                  <button onClick={clearFilters} className="btn-ghost text-xs">Clear All</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 ">
                {['Slot Number', 'Floor', 'Zone', 'Vehicle Type', 'Slot Type', 'Status', 'QR Code', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100/10 flex items-center justify-center">
                        <FaParking className="text-2xl text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">No slots found</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  max-w-sm">
                        {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Get started by generating slots for a parking location.'}
                      </p>
                      {!hasActiveFilters && (
                        <button onClick={() => setGenModal({ open: true })} className="btn-primary mt-2">
                          <FaCog className="text-xs" /> Generate Slots
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => {
                  const sCfg = statusConfig[slot.status] || statusConfig.available;
                  const vMeta = vehicleTypeMeta[slot.vehicleType] || vehicleTypeMeta.car;
                  const VIcon = vMeta.icon;
                  return (
                    <motion.tr
                      key={slot.id || slot._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 ">{slot.slotNumber}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 ">{slot.floor || 'Ground'}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 dark:text-gray-500  bg-gray-100 dark:bg-gray-800  px-2 py-0.5 rounded">{slot.zone || 'A'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <VIcon className={`text-sm ${vMeta.color}`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300  capitalize">{vMeta.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300  capitalize">{slot.type || 'Standard'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${sCfg.color}`}>
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {slot.qrCode ? (
                          <span className="inline-flex items-center gap-1 text-xs text-primary-400">
                            <FaQrcode /> Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="p-2 text-primary-400 hover:bg-gray-50:bg-gray-500/10 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(slot); setConfirmOpen(true); }}
                            className="p-2 text-red-600 hover:bg-red-50:bg-red-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredSlots.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700  bg-gray-50/50[0.02]">
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
              Showing <span className="font-semibold text-gray-900 dark:text-gray-100 ">{filteredSlots.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100 ">{slots.length}</span> slots
            </p>
          </div>
        )}
      </motion.div>

      {/* Create Single Slot Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Add New Slot" size="md">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Parking Location <span className="text-red-500">*</span></label>
            <select value={createForm.parkingId} onChange={(e) => setCreateForm(p => ({ ...p, parkingId: e.target.value }))} className="select-field">
              <option value="">Select parking</option>
              {parkings.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.parkingName}{p.city ? ` - ${p.city}` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Slot Number <span className="text-red-500">*</span></label>
            <input type="text" value={createForm.slotNumber} onChange={(e) => setCreateForm(p => ({ ...p, slotNumber: e.target.value }))} placeholder="e.g. A1, B12" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Floor</label>
              <input type="text" value={createForm.floor} onChange={(e) => setCreateForm(p => ({ ...p, floor: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Zone</label>
              <input type="text" value={createForm.zone} onChange={(e) => setCreateForm(p => ({ ...p, zone: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Vehicle Type</label>
              <select value={createForm.vehicleType} onChange={(e) => setCreateForm(p => ({ ...p, vehicleType: e.target.value }))} className="select-field">
                {['car', 'bike', 'ev'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Slot Size</label>
              <select value={createForm.slotSize} onChange={(e) => setCreateForm(p => ({ ...p, slotSize: e.target.value }))} className="select-field">
                {['compact', 'standard', 'large'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Type</label>
              <select value={createForm.type} onChange={(e) => setCreateForm(p => ({ ...p, type: e.target.value }))} className="select-field">
                {['standard', 'ev', 'handicapped', 'compact', 'vip'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ">
            <button onClick={() => setCreateModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleCreateSlot} disabled={saving} className="btn-primary disabled:opacity-50">
              <FaPlus className="text-xs" /> {saving ? 'Creating...' : 'Create Slot'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Generate Modal */}
      <Modal isOpen={genModal.open} onClose={() => setGenModal({ open: false })} title="Bulk Generate Slots" size="md">
        <div className="space-y-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
            Generate multiple parking slots at once. Slots will be numbered automatically using the prefix and start number.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Parking Location <span className="text-red-500">*</span></label>
            <select value={genForm.parkingId} onChange={(e) => setGenForm(p => ({ ...p, parkingId: e.target.value }))} className="select-field">
              <option value="">Select parking</option>
              {parkings.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.parkingName}{p.city ? ` - ${p.city}` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Prefix</label>
              <input type="text" value={genForm.prefix} onChange={(e) => setGenForm(p => ({ ...p, prefix: e.target.value }))} placeholder="e.g. A, B" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Start Number</label>
              <input type="number" min={1} value={genForm.startNumber} onChange={(e) => setGenForm(p => ({ ...p, startNumber: parseInt(e.target.value) || 1 }))} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Count <span className="text-red-500">*</span></label>
              <input type="number" min={1} max={500} value={genForm.count} onChange={(e) => setGenForm(p => ({ ...p, count: Math.max(1, parseInt(e.target.value) || 1) }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Floor</label>
              <input type="text" value={genForm.floor} onChange={(e) => setGenForm(p => ({ ...p, floor: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Zone</label>
              <input type="text" value={genForm.zone} onChange={(e) => setGenForm(p => ({ ...p, zone: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Vehicle Type</label>
              <select value={genForm.vehicleType} onChange={(e) => setGenForm(p => ({ ...p, vehicleType: e.target.value }))} className="select-field">
                {['car', 'bike', 'ev'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Slot Type</label>
              <select value={genForm.type} onChange={(e) => setGenForm(p => ({ ...p, type: e.target.value }))} className="select-field">
                {['standard', 'ev', 'handicapped', 'compact', 'vip'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ">
            <button onClick={() => setGenModal({ open: false })} className="btn-ghost">Cancel</button>
            <button onClick={handleBulkGenerate} disabled={generating} className="btn-primary disabled:opacity-50">
              <FaCog className="text-xs" /> {generating ? 'Generating...' : `Generate ${genForm.count} Slots`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, slot: null })} title={`Edit Slot — ${editModal.slot?.slotNumber || ''}`} size="md">
        {editModal.slot && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-gray-700 ">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                editData.status === 'available' ? 'bg-gray-100/20' :
                editData.status === 'occupied' ? 'bg-red-100/20' :
                editData.status === 'reserved' ? 'bg-gray-100/20' :
                'bg-gray-200/20'
              }`}>
                <FaParking className={`text-xl ${
                  editData.status === 'available' ? 'text-primary-400' :
                  editData.status === 'occupied' ? 'text-red-600' :
                  editData.status === 'reserved' ? 'text-primary-400' :
                  'text-gray-600 dark:text-gray-400 dark:text-gray-500 '
                }`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 ">{editModal.slot.slotNumber}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{editModal.slot.floor || 'Ground'} &middot; Zone {editModal.slot.zone || 'A'}</p>
                {editModal.slot.qrCode && <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500  mt-0.5">QR: {editModal.slot.qrCode}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Status</label>
                <select value={editData.status} onChange={(e) => setEditData(p => ({ ...p, status: e.target.value }))} className="select-field">
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Slot Type</label>
                <select value={editData.type} onChange={(e) => setEditData(p => ({ ...p, type: e.target.value }))} className="select-field">
                  {['standard', 'ev', 'handicapped', 'compact', 'vip'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Floor</label>
                <input type="text" value={editData.floor} onChange={(e) => setEditData(p => ({ ...p, floor: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Zone</label>
                <input type="text" value={editData.zone} onChange={(e) => setEditData(p => ({ ...p, zone: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Vehicle Type</label>
                <select value={editData.vehicleType} onChange={(e) => setEditData(p => ({ ...p, vehicleType: e.target.value }))} className="select-field">
                  {['car', 'bike', 'ev'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Slot Size</label>
                <select value={editData.slotSize} onChange={(e) => setEditData(p => ({ ...p, slotSize: e.target.value }))} className="select-field">
                  {['compact', 'standard', 'large'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ">
              <button onClick={handleUpdateSlot} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                <FaCheck className="text-xs" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setDeleteTarget(editModal.slot); setConfirmOpen(true); }}
                className="btn-danger"
                title="Delete"
              >
                <FaTrash className="text-xs" /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Slot"
        message={
          <span>
            Are you sure you want to delete slot <strong className="text-gray-900 dark:text-gray-100 ">"{deleteTarget?.slotNumber}"</strong>?
            This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteSlot}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        variant="danger"
      />
    </motion.div>
  );
}
