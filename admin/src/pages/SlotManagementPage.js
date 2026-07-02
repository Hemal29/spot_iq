import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaThLarge, FaCar, FaMotorcycle, FaBolt, FaCrown,
  FaWheelchair, FaPlus, FaMinus, FaEdit, FaTrash,
  FaParking, FaLayerGroup, FaMapMarkedAlt, FaCog,
  FaCircle, FaSquare, FaArrowLeft, FaSave, FaTimes,
  FaChair, FaBuilding, FaSearch,
} from 'react-icons/fa';

const slotTypeIcons = {
  standard: FaCar,
  ev: FaBolt,
  handicapped: FaWheelchair,
  compact: FaChair,
  motorcycle: FaMotorcycle,
  vip: FaCrown,
};

const slotTypeLabels = {
  standard: 'Standard',
  ev: 'Electric',
  handicapped: 'Handicapped',
  compact: 'Compact',
  motorcycle: 'Motorcycle',
  vip: 'VIP',
};

const statusColors = {
  available: {
    border: 'border-green-500',
    bg: 'bg-green-50 dark:bg-green-500/10',
    badge: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
    dot: 'bg-green-500',
  },
  occupied: {
    border: 'border-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    badge: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
    dot: 'bg-red-500',
  },
  reserved: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  maintenance: {
    border: 'border-gray-400 dark:border-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-500/10',
    badge: 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
};

const viewModes = [
  { key: 'grid', label: 'Grid View', icon: FaThLarge },
  { key: 'floor', label: 'Floor Wise', icon: FaLayerGroup },
  { key: 'zone', label: 'Zone Wise', icon: FaMapMarkedAlt },
];

function TypeIcon({ type, className = 'text-lg' }) {
  const Icon = slotTypeIcons[type] || FaCar;
  const colorMap = {
    standard: 'text-blue-500 dark:text-blue-400',
    ev: 'text-yellow-500 dark:text-yellow-400',
    handicapped: 'text-red-500 dark:text-red-400',
    compact: 'text-purple-500 dark:text-purple-400',
    motorcycle: 'text-green-500 dark:text-green-400',
    vip: 'text-orange-500 dark:text-orange-400',
  };
  return <Icon className={`${colorMap[type] || 'text-gray-500'} ${className}`} />;
}

function SlotCard({ slot, onClick }) {
  const sc = statusColors[slot.status] || statusColors.available;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      onClick={() => onClick(slot)}
      className={`p-4 rounded-xl border-2 ${sc.border} ${sc.bg} text-center transition-all cursor-pointer hover:shadow-lg relative group`}
    >
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full ${sc.dot}" />
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{slot.slotNumber}</p>
      <div className="flex justify-center mb-1">
        <TypeIcon type={slot.type} className="text-xl" />
      </div>
      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${sc.badge}`}>
        {slot.status}
      </span>
      {slot.vehicleType && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate">{slot.vehicleType}</p>
      )}
      <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors pointer-events-none" />
    </motion.div>
  );
}

function SlotGrid({ slots, onSlotClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      <AnimatePresence>
        {slots.map((slot) => (
          <SlotCard key={slot._id || slot.id} slot={slot} onClick={onSlotClick} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FloorWiseView({ slots, onSlotClick }) {
  const floors = {};
  slots.forEach((slot) => {
    const floor = slot.floor || slot.zone || 'Default';
    if (!floors[floor]) floors[floor] = [];
    floors[floor].push(slot);
  });
  const [openFloors, setOpenFloors] = useState({});
  const toggleFloor = (f) => setOpenFloors((p) => ({ ...p, [f]: !p[f] }));
  useEffect(() => {
    const initial = {};
    Object.keys(floors).forEach((f) => { initial[f] = true; });
    setOpenFloors(initial);
  }, [slots.length]);
  return (
    <div className="space-y-4">
      {Object.entries(floors).map(([floor, floorSlots]) => (
        <motion.div
          key={floor}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden"
        >
          <button
            onClick={() => toggleFloor(floor)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-3">
              <FaBuilding className="text-gray-400 dark:text-gray-500" />
              <span className="font-semibold text-gray-900 dark:text-white">{floor}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full">
                {floorSlots.length} slots
              </span>
            </div>
            <motion.div
              animate={{ rotate: openFloors[floor] ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
          <AnimatePresence>
            {openFloors[floor] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {floorSlots.map((slot) => (
                      <SlotCard key={slot._id || slot.id} slot={slot} onClick={onSlotClick} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function ZoneWiseView({ slots, onSlotClick }) {
  const groups = {};
  slots.forEach((slot) => {
    const type = slot.type || 'standard';
    if (!groups[type]) groups[type] = [];
    groups[type].push(slot);
  });
  const [openZones, setOpenZones] = useState({});
  const toggleZone = (z) => setOpenZones((p) => ({ ...p, [z]: !p[z] }));
  useEffect(() => {
    const initial = {};
    Object.keys(groups).forEach((z) => { initial[z] = true; });
    setOpenZones(initial);
  }, [slots.length]);
  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([type, typeSlots]) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden"
        >
          <button
            onClick={() => toggleZone(type)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-3">
              <TypeIcon type={type} className="text-lg" />
              <span className="font-semibold text-gray-900 dark:text-white">{slotTypeLabels[type] || type}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full">
                {typeSlots.length} slots
              </span>
            </div>
            <motion.div
              animate={{ rotate: openZones[type] ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
          <AnimatePresence>
            {openZones[type] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {typeSlots.map((slot) => (
                      <SlotCard key={slot._id || slot.id} slot={slot} onClick={onSlotClick} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default function SlotManagementPage() {
  const { parkingId } = useParams();
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editType, setEditType] = useState('');

  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [genType, setGenType] = useState('standard');
  const [genStartingRow, setGenStartingRow] = useState('A');
  const [generating, setGenerating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (parkingId) {
      fetchParking();
      fetchSlots();
    }
  }, [parkingId]);

  const fetchParking = async () => {
    try {
      const res = await adminService.getParking(parkingId);
      const data = res.data?.data || res.data || res;
      setParking(data);
    } catch (err) {
      toast.error('Failed to load parking details');
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await adminService.getSlotsByParking(parkingId);
      const data = res.data?.data || res.data || [];
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    setGenerating(true);
    try {
      await adminService.createSlots(parkingId, {
        slotCount: genCount,
        slotType: genType,
        startingRow: genStartingRow,
        parkingId,
      });
      toast.success(`Generated ${genCount} slots`);
      await fetchSlots();
      setGenModalOpen(false);
    } catch (err) {
      toast.error('Failed to generate slots');
    } finally {
      setGenerating(false);
    }
  };

  const openSlotModal = (slot) => {
    setSelectedSlot(slot);
    setEditStatus(slot.status || 'available');
    setEditType(slot.type || 'standard');
    setSlotModalOpen(true);
  };

  const handleSaveSlot = async () => {
    if (!selectedSlot) return;
    setSaving(true);
    try {
      const id = selectedSlot._id || selectedSlot.id;
      await adminService.updateSlot(id, { status: editStatus, type: editType });
      toast.success('Slot updated');
      setSlotModalOpen(false);
      setSelectedSlot(null);
      fetchSlots();
    } catch (err) {
      toast.error('Failed to update slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!deleteTarget) return;
    try {
      const id = deleteTarget._id || deleteTarget.id;
      await adminService.deleteSlot(id);
      toast.success('Slot deleted');
      setConfirmOpen(false);
      setDeleteTarget(null);
      setSlotModalOpen(false);
      setSelectedSlot(null);
      fetchSlots();
    } catch (err) {
      toast.error('Failed to delete slot');
      setConfirmOpen(false);
    }
  };

  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const occupiedSlots = slots.filter((s) => s.status === 'occupied').length;
  const reservedSlots = slots.filter((s) => s.status === 'reserved').length;
  const maintenanceSlots = slots.filter((s) => s.status === 'maintenance').length;

  const filteredSlots = slots.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (s.slotNumber || '').toLowerCase().includes(q) ||
      (s.type || '').toLowerCase().includes(q) ||
      (s.status || '').toLowerCase().includes(q) ||
      (s.floor || s.zone || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const statItems = [
    { label: 'Total', value: totalSlots, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-100 dark:bg-white/10', dot: 'bg-gray-500' },
    { label: 'Available', value: availableSlots, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20', dot: 'bg-green-500' },
    { label: 'Occupied', value: occupiedSlots, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', dot: 'bg-red-500' },
    { label: 'Reserved', value: reservedSlots, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/20', dot: 'bg-yellow-500' },
    { label: 'Maintenance', value: maintenanceSlots, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-200 dark:bg-gray-500/20', dot: 'bg-gray-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 dark:bg-[#0F172A] min-h-screen p-4 md:p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FaParking className="text-orange-500 text-lg" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {parking?.parkingName || 'Slot Management'}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {parking?.city}{parking?.city && parking?.address ? ' · ' : ''}{parking?.address}
              {parking?.pricePerHour ? ` · ₹${parking.pricePerHour}/hr` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGenModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
          >
            <FaPlus className="text-xs" />
            Generate Slots
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statItems.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <div>
                <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Toggle + Search */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-xl p-1">
              {viewModes.map((vm) => {
                const Icon = vm.icon;
                const active = viewMode === vm.key;
                return (
                  <button
                    key={vm.key}
                    onClick={() => setViewMode(vm.key)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-white dark:bg-white/20 text-orange-600 dark:text-orange-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="text-xs" />
                    <span className="hidden sm:inline">{vm.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search slots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slot Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredSlots.length}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{slots.length}</span> slots
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <FaCar className="text-blue-500" /> Std
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <FaBolt className="text-yellow-500" /> EV
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <FaWheelchair className="text-red-500" /> HC
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <FaChair className="text-purple-500" /> CMP
          </span>
        </div>
      </div>

      {/* Slot Views */}
      {filteredSlots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-12 text-center"
        >
          <FaParking className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No slots found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search.' : 'Generate slots to get started.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setGenModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <FaPlus className="text-xs" />
              Generate Slots
            </button>
          )}
        </motion.div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <SlotGrid slots={filteredSlots} onSlotClick={openSlotModal} />
          )}
          {viewMode === 'floor' && (
            <FloorWiseView slots={filteredSlots} onSlotClick={openSlotModal} />
          )}
          {viewMode === 'zone' && (
            <ZoneWiseView slots={filteredSlots} onSlotClick={openSlotModal} />
          )}
        </>
      )}

      {/* Slot Detail Modal */}
      <Modal isOpen={slotModalOpen} onClose={() => { setSlotModalOpen(false); setSelectedSlot(null); }} title="Slot Details" size="sm">
        {selectedSlot && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
              <div className={`p-3 rounded-xl ${
                editStatus === 'available' ? 'bg-green-100 dark:bg-green-500/20' :
                editStatus === 'occupied' ? 'bg-red-100 dark:bg-red-500/20' :
                editStatus === 'reserved' ? 'bg-yellow-100 dark:bg-yellow-500/20' :
                'bg-gray-200 dark:bg-gray-500/20'
              }`}>
                <TypeIcon type={selectedSlot.type} className="text-2xl" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedSlot.slotNumber}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {slotTypeLabels[selectedSlot.type] || selectedSlot.type}
                  {selectedSlot.floor ? ` · ${selectedSlot.floor}` : ''}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Vehicle Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              >
                {Object.entries(slotTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={handleSaveSlot}
                loading={saving}
                icon={FaSave}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <button
                onClick={() => { setDeleteTarget(selectedSlot); setConfirmOpen(true); }}
                className="p-2.5 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Delete slot"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Generate Slots Modal */}
      <Modal isOpen={genModalOpen} onClose={() => setGenModalOpen(false)} title="Generate Slots" size="sm">
        <div className="space-y-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate bulk slots for <span className="font-semibold text-gray-900 dark:text-white">{parking?.parkingName}</span>.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Number of Slots</label>
            <input
              type="number"
              min={1}
              max={500}
              value={genCount}
              onChange={(e) => setGenCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slot Type</label>
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            >
              {Object.entries(slotTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Starting Row Letter</label>
            <input
              type="text"
              maxLength={1}
              value={genStartingRow}
              onChange={(e) => setGenStartingRow(e.target.value.toUpperCase().replace(/[^A-Z]/g, '') || 'A')}
              className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all uppercase"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setGenModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="secondary"
              onClick={handleGenerateSlots}
              loading={generating}
              icon={FaPlus}
            >
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Slot"
        message={`Are you sure you want to delete slot "${deleteTarget?.slotNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteSlot}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        variant="danger"
      />
    </motion.div>
  );
}
