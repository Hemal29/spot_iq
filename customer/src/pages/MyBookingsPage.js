import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarCheck, FaClock, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt,
  FaCar, FaTag, FaArrowRight, FaRedo, FaParking, FaWallet,
} from 'react-icons/fa';
import bookingService from '../services/bookingService';
import GlassCard from '../components/common/GlassCard';
import EmptyState from '../components/common/EmptyState';
import PageTransition from '../components/common/PageTransition';
import PageHero from '../components/common/PageHero';

const tabs = [
  { key: 'all', label: 'All', icon: FaCalendarCheck },
  { key: 'active', label: 'Active', icon: FaClock },
  { key: 'upcoming', label: 'Upcoming', icon: FaCalendarCheck },
  { key: 'completed', label: 'Completed', icon: FaCheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: FaTimesCircle },
];

const statusConfig = {
  active: { color: 'text-primary-400 bg-[#0a0a0b]0/10 border-primary-300/20', dot: 'bg-[#0a0a0b]0', label: 'Active' },
  upcoming: { color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#0a0a0b]0/10 border-primary-400/20', dot: 'bg-[#0a0a0b]0', label: 'Upcoming' },
  completed: { color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#e7c588]/10 border-[#e7c588]/20', dot: 'bg-gray-400', label: 'Completed' },
  cancelled: { color: 'text-[#e7c588] bg-[#e7c588]/10 border-[#e7c588]/40', dot: 'bg-[#e7c588]', label: 'Cancelled' },
};

const mockBookings = [
  { id: 'BK-001', parkingName: 'City Center Hub', parkingId: 1, date: '2026-07-18', time: '10:00', duration: 4, amount: 100, status: 'active', slotNumber: 'A-12', vehicleType: 'car', paymentMethod: 'UPI' },
  { id: 'BK-002', parkingName: 'Airport Terminal A', parkingId: 2, date: '2026-07-20', time: '06:00', duration: 8, amount: 320, status: 'upcoming', slotNumber: 'B-05', vehicleType: 'car', paymentMethod: 'Card' },
  { id: 'BK-003', parkingName: 'Mall Plaza South', parkingId: 3, date: '2026-07-15', time: '14:00', duration: 2, amount: 60, status: 'completed', slotNumber: 'C-22', vehicleType: 'bike', paymentMethod: 'UPI' },
  { id: 'BK-004', parkingName: 'Tech Park Premium', parkingId: 6, date: '2026-07-10', time: '09:00', duration: 10, amount: 350, status: 'completed', slotNumber: 'D-08', vehicleType: 'ev', paymentMethod: 'Wallet' },
  { id: 'BK-005', parkingName: 'Railway Station Parking', parkingId: 4, date: '2026-07-05', time: '18:00', duration: 3, amount: 60, status: 'cancelled', slotNumber: 'E-15', vehicleType: 'car', paymentMethod: 'UPI' },
];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getMyBookings();
        const data = res.data?.data || res.data || [];
        setBookings(Array.isArray(data) && data.length > 0 ? data : mockBookings);
      } catch { setBookings(mockBookings); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { all: bookings.length, active: 0, upcoming: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => { if (c[b.status] !== undefined) c[b.status]++; });
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return bookings;
    return bookings.filter(b => b.status === activeTab);
  }, [bookings, activeTab]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await bookingService.cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch { /* toast would go here */ }
    setCancellingId(null);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <PageTransition>
      <PageHero
        badge={<><FaCalendarCheck className="text-[#e7c588]" /> Your reservations</>}
        title="My"
        highlight="Bookings"
        subtitle="Manage your parking reservations"
      />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: counts.all, icon: FaCalendarCheck, gradient: 'bg-primary-600' },
            { label: 'Active', value: counts.active, icon: FaClock, gradient: 'from-[#0a0a0b] to-[#e7c588]' },
            { label: 'Completed', value: counts.completed, icon: FaCheckCircle, gradient: 'from-[#0a0a0b] to-[#e7c588]' },
            { label: 'Cancelled', value: counts.cancelled, icon: FaTimesCircle, gradient: 'from-[#0a0a0b] to-primary-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="glass-card p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                  <s.icon className="text-[#f9f0d7] text-sm" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">{s.value}</p>
                  <p className="text-[10px] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-[#0a0a0b]/50   border border-[#e7c588]/25  mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'text-[#f9f0d7]'
                  : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f9f0d7] dark:text-[#f9f0d7] '
              }`}>
              {activeTab === tab.key && (
                <motion.div layoutId="bookingTab" className="absolute inset-0 bg-primary-500 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative flex items-center gap-1.5">
                <tab.icon className="text-xs" />
                {tab.label}
                <span className="text-[10px] bg-[#0a0a0b]/20 px-1.5 py-0.5 rounded-full">{counts[tab.key]}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#1c1c1f] dark:bg-[#1c1c1f]  animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FaCalendarCheck}
            title="No bookings found"
            description={activeTab === 'all' ? "You haven't made any bookings yet. Find and book your first parking spot!" : `No ${activeTab} bookings found.`}
            action={<Link to="/find-parking" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-[#f9f0d7] font-semibold hover:shadow-lg transition-all">
              <FaParking /> Find Parking
            </Link>}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {filtered.map((booking, i) => {
                const sc = statusConfig[booking.status] || statusConfig.active;
                return (
                  <motion.div key={booking.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 hover:shadow-xl hover:border-primary-400/20 transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      {/* Status bar */}
                      <div className={`w-1 self-stretch rounded-full ${sc.dot}`} />
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-[#e7c588]/80">#{booking.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-1 group-hover:text-[#e7c588]/80hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors">
                          {booking.parkingName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#e7c588]/80">
                          <span className="flex items-center gap-1"><FaCalendarCheck className="text-[10px]" /> {formatDate(booking.date)} at {booking.time}</span>
                          <span className="flex items-center gap-1"><FaClock className="text-[10px]" /> {booking.duration}h</span>
                          <span className="flex items-center gap-1"><FaCar className="text-[10px]" /> {booking.vehicleType || 'Car'}</span>
                          <span className="flex items-center gap-1"><FaTag className="text-[10px]" /> Slot {booking.slotNumber}</span>
                        </div>
                      </div>
                      {/* Right side */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-2">₹{booking.amount}</p>
                        <div className="flex flex-col gap-1.5">
                          <Link to={`/my-bookings/${booking.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-400 bg-[#0a0a0b]/10 hover:bg-[#121214]:bg-[#0a0a0b]0/20 transition-colors">
                            View <FaArrowRight className="text-[9px]" />
                          </Link>
                          {(booking.status === 'active' || booking.status === 'upcoming') && (
                            <button onClick={() => handleCancel(booking.id)} disabled={cancellingId === booking.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#e7c588] bg-[#e7c588]/10 hover:bg-[#e7c588]:bg-[#e7c588]/20 transition-colors disabled:opacity-50">
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                          {(booking.status === 'completed' || booking.status === 'cancelled') && (
                            <Link to={`/find-parking`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-400 bg-[#0a0a0b]/10 hover:bg-[#121214]:bg-[#0a0a0b]0/20 transition-colors">
                              <FaRedo className="text-[9px]" /> Rebook
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
}
