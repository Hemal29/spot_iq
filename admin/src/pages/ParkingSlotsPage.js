import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import adminService from '../services/adminService';
import { FaParking } from 'react-icons/fa';

const slotTypes = ['standard', 'compact', 'large', 'ev', 'handicap'];
const slotStatuses = ['available', 'booked', 'maintenance'];

const typeColors = {
  standard: 'bg-gray-100 text-gray-700',
  compact: 'bg-blue-100 text-blue-700',
  large: 'bg-purple-100 text-purple-700',
  ev: 'bg-green-100 text-green-700',
  handicap: 'bg-orange-100 text-orange-700',
};

export default function ParkingSlotsPage() {
  const { parkingId } = useParams();
  const navigate = useNavigate();
  const [parking, setParking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [generateType, setGenerateType] = useState('standard');
  const [generating, setGenerating] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [parkingId]);

  const fetchData = async () => {
    try {
      const [parkingRes, slotsRes] = await Promise.all([
        adminService.getParking(parkingId),
        adminService.getSlots(parkingId),
      ]);
      setParking(parkingRes.data);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      navigate('/slots');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    setGenerating(true);
    try {
      const res = await adminService.generateSlots(parkingId, {
        count: generateCount,
        type: generateType,
      });
      setSlots((prev) => [...prev, ...res.data]);
      setGenerateOpen(false);
    } catch (err) {
      console.error('Failed to generate slots:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (slot, newStatus) => {
    try {
      await adminService.updateSlot(slot._id, { status: newStatus });
      setSlots((prev) =>
        prev.map((s) => (s._id === slot._id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Failed to update slot:', err);
    }
  };

  const filteredSlots = slots.filter((s) => {
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={parking?.parkingName || 'Parking Slots'}
        subtitle={parking ? `${parking.city} · ₹${parking.pricePerHour}/hr` : ''}
        actions={
          <button
            onClick={() => setGenerateOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate Slots
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Types</option>
          {slotTypes.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Statuses</option>
          {slotStatuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 ml-auto">
          {filteredSlots.length} of {slots.length} slots
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredSlots.map((slot) => (
          <div
            key={slot._id}
            className={`bg-white rounded-xl shadow-sm border p-3 transition hover:shadow-md ${
              slot.status === 'maintenance' ? 'border-red-200' :
              slot.status === 'booked' ? 'border-orange-200' :
              'border-green-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-800">#{slot.slotNumber}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[slot.type] || 'bg-gray-100 text-gray-700'}`}>
                {slot.type}
              </span>
            </div>
            <StatusBadge status={slot.status} />
            <div className="mt-2 flex gap-1">
              {slotStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(slot, status)}
                  disabled={slot.status === status}
                  className={`flex-1 h-2 rounded-full transition ${
                    slot.status === status
                      ? status === 'available' ? 'bg-green-500' :
                        status === 'booked' ? 'bg-orange-500' : 'bg-red-500'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title={`Set to ${status}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredSlots.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No slots found. Generate slots to get started.
        </div>
      )}

      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Slots">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Generate new parking slots for {parking?.parkingName}.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Slots</label>
            <input
              type="number"
              min="1"
              max="100"
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Type</label>
            <select
              value={generateType}
              onChange={(e) => setGenerateType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {slotTypes.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setGenerateOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <Button onClick={handleGenerateSlots} loading={generating}>
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
