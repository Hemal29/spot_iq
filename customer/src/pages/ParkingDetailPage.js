import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt, FaStar, FaClock, FaCar, FaBolt, FaShieldAlt, FaVideo,
  FaBuilding, FaWifi, FaWheelchair, FaArrowLeft, FaCalendar, FaTag,
  FaChevronRight, FaCheckCircle, FaInfoCircle, FaParking,
} from 'react-icons/fa';
import parkingService from '../services/parkingService';
import GlassCard from '../components/common/GlassCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import PageTransition from '../components/common/PageTransition';

const amenityIcons = {
  ev: { icon: FaBolt, label: 'EV Charging', color: 'text-primary-400 bg-[#0a0a0b]0/10' },
  cctv: { icon: FaVideo, label: 'CCTV', color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#0a0a0b]0/10' },
  '24x7': { icon: FaClock, label: '24/7', color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#0a0a0b]0/10' },
  security: { icon: FaShieldAlt, label: 'Security', color: 'text-primary-400 bg-[#0a0a0b]0/10' },
  covered: { icon: FaBuilding, label: 'Covered', color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#0a0a0b]0/10' },
  handicapped: { icon: FaWheelchair, label: 'Accessible', color: 'text-primary-400 bg-primary-500/10' },
  wifi: { icon: FaWifi, label: 'WiFi', color: 'text-primary-400 bg-[#0a0a0b]0/10' },
  valet: { icon: FaCar, label: 'Valet', color: 'text-primary-400 bg-[#0a0a0b]0/10' },
};

const mockParking = {
  id: 1, parkingName: 'City Center Hub', city: 'Ahmedabad',
  address: 'MG Road, Near Kalupur Railway Station, Ahmedabad 380001',
  totalSlots: 200, availableSlots: 45, pricePerHour: 25, rating: 4.8,
  numReviews: 342, parkingType: 'multi-level', status: 'active', images: [],
  amenities: ['cctv', 'ev', 'covered', 'security', '24x7', 'wifi'],
  description: 'Premium multi-level parking facility in the heart of Ahmedabad. Equipped with EV charging stations, 24/7 CCTV surveillance, and AI-powered slot management. Walking distance from major shopping centers and business districts.',
  openingTime: '08:00', closingTime: '22:00',
};

const mockReviews = [
  { id: 1, name: 'Rahul Sharma', rating: 5, text: 'Excellent parking facility! Clean, well-lit, and the EV charging is super convenient. The AI slot system saved me so much time.', date: '2 days ago', avatar: 'R' },
  { id: 2, name: 'Priya Patel', rating: 4, text: 'Great location and reasonable prices. Only minor issue is finding the exit during peak hours. Overall highly recommended.', date: '1 week ago', avatar: 'P' },
  { id: 3, name: 'Amit Kumar', rating: 5, text: 'Best parking in Ahmedabad! Covered spots, great security, and the app integration is seamless. 10/10.', date: '2 weeks ago', avatar: 'A' },
];

function AIScoreCircle({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke="url(#scoreGrad)" strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9c6e24" />
            <stop offset="100%" stopColor="#d9a94f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#f9f0d7]">{score}</span>
        <span className="text-[9px] text-[#f9f0d7]/50">/100</span>
      </div>
    </div>
  );
}

export default function ParkingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(2);
  const [coupon, setCoupon] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await parkingService.getParkingById(id);
        setParking(res.data?.data || res.data || mockParking);
      } catch {
        setParking(mockParking);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <PageTransition><SkeletonLoader type="detail" /></PageTransition>;
  const p = parking || mockParking;
  const total = (p.pricePerHour || 25) * duration;
  const occupiedPct = p.totalSlots ? Math.round(((p.totalSlots - p.availableSlots) / p.totalSlots) * 100) : 0;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-4 transition-colors">
          <FaArrowLeft /> Back to results
        </motion.button>

        {/* Hero Image */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative h-[300px] lg:h-[400px] rounded-2xl overflow-hidden mb-6">
          {p.images?.[0] ? (
            <img src={p.images[0]} alt={p.parkingName} className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full overflow-hidden bg-black">
              <video
                src="/hero_video.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 bg-[#e7c588]/[0.06] mix-blend-overlay" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FaParking className="text-[#e7c588]/40 text-[120px]" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#f9f0d7] mb-2">{p.parkingName}</h1>
            <div className="flex items-center gap-4 text-[#f9f0d7]/80 text-sm">
              <span className="flex items-center gap-1"><FaMapMarkerAlt /> {p.city}, {p.address}</span>
              <span className="flex items-center gap-1"><FaStar className="text-primary-400" /> {Number(p.rating || 0).toFixed(1)} ({p.numReviews || 0})</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI Score */}
            <GlassCard>
              <div className="flex items-center gap-6">
                <AIScoreCircle score={92} />
                <div>
                  <h3 className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">AI Score</h3>
                  <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-3">Based on location, value, safety & convenience</p>
                  <div className="flex gap-4 text-xs">
                    {[{ l: 'Location', v: 95 }, { l: 'Value', v: 88 }, { l: 'Safety', v: 94 }, { l: 'Convenience', v: 91 }].map(s => (
                      <div key={s.l} className="text-center">
                        <div className="font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">{s.v}</div>
                        <div className="text-[#e7c588]/80 dark:text-[#e7c588]/80">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Quick Info */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Price', value: `₹${p.pricePerHour}/hr`, icon: FaTag, color: 'from-primary-400 to-[#e7c588]' },
                { label: 'Total Slots', value: p.totalSlots || 0, icon: FaParking, color: 'bg-primary-600' },
                { label: 'Available', value: p.availableSlots || 0, icon: FaCheckCircle, color: 'from-[#0a0a0b] to-[#e7c588]' },
                { label: 'Type', value: p.parkingType || 'multi-level', icon: FaBuilding, color: 'from-[#0a0a0b] to-[#e7c588]' },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <div className="glass-card p-4 text-center">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="text-[#f9f0d7] text-sm" />
                    </div>
                    <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">{item.label}</p>
                    <p className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  capitalize">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <GlassCard>
              <h3 className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-[#e7c588]/80 dark:text-[#e7c588]/80" /> About
              </h3>
              <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  leading-relaxed">{p.description || 'Premium parking facility with modern amenities and AI-powered management.'}</p>
            </GlassCard>

            {/* Amenities */}
            <GlassCard>
              <h3 className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(p.amenities || []).map(a => {
                  const am = amenityIcons[a] || { icon: FaCheckCircle, label: a, color: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#0a0a0b]0/10' };
                  return (
                    <div key={a} className="flex items-center gap-2 p-3 rounded-xl bg-[#0a0a0b]/5 border border-[#e7c588]/25">
                      <div className={`w-8 h-8 rounded-lg ${am.color} flex items-center justify-center`}>
                        <am.icon className="text-sm" />
                      </div>
                      <span className="text-sm text-[#f3e0ae] dark:text-[#e7c588]/80 ">{am.label}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Hours */}
            <GlassCard>
              <h3 className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-3 flex items-center gap-2">
                <FaClock className="text-[#e7c588]/80 dark:text-[#e7c588]/80" /> Operating Hours
              </h3>
              <div className="space-y-2">
                {[{ day: 'Mon - Sat', time: `${p.openingTime || '08:00'} - ${p.closingTime || '22:00'}` },
                  { day: 'Sunday', time: '09:00 - 20:00' }].map(h => (
                  <div key={h.day} className="flex justify-between items-center py-2 border-b border-[#e7c588]/25 last:border-0">
                    <span className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">{h.day}</span>
                    <span className="text-sm font-medium text-[#f9f0d7] dark:text-[#f9f0d7] ">{h.time}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Reviews */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">Reviews</h3>
                <span className="text-sm text-[#e7c588]/80">{p.numReviews || 0} reviews</span>
              </div>
              <div className="space-y-4">
                {mockReviews.map(r => (
                  <div key={r.id} className="p-4 rounded-xl bg-[#0a0a0b]/5 border border-[#e7c588]/25">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br bg-primary-400 flex items-center justify-center text-[#f9f0d7] text-xs font-bold">{r.avatar}</div>
                      <div>
                        <p className="text-sm font-medium text-[#f9f0d7] dark:text-[#f9f0d7] ">{r.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <FaStar key={i} className={`text-[10px] ${i < r.rating ? 'text-primary-400' : 'text-[#e7c588]/80'}`} />)}
                          <span className="text-[10px] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ml-1">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">{r.text}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column — Sticky Booking */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <GlassCard className="!p-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">₹{p.pricePerHour}</span>
                  <span className="text-sm text-[#e7c588]/80">/hr</span>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-1 block">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0b]/5 border border-[#e7c588]/25 text-[#f9f0d7] dark:text-[#f9f0d7]  text-sm focus:outline-none focus:border-primary-400/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-1 block">Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0b]/5 border border-[#e7c588]/25 text-[#f9f0d7] dark:text-[#f9f0d7]  text-sm focus:outline-none focus:border-primary-400/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-1 block">Duration</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 4, 8, 24].map(d => (
                        <button key={d} onClick={() => setDuration(d)}
                          className={`py-2 rounded-lg text-xs font-medium transition-all ${duration === d
                            ? 'bg-[#0a0a0b]0 text-[#f9f0d7] shadow-lg shadow-primary-400/25'
                            : 'bg-[#0a0a0b]/5 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:bg-[#0a0a0b]/10'}`}>
                          {d === 24 ? 'Full' : `${d}h`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-1 block">Coupon Code</label>
                    <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter code"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0b]/5 border border-[#e7c588]/25 text-[#f9f0d7] dark:text-[#f9f0d7]  text-sm placeholder-gray-500 focus:outline-none focus:border-primary-400/50" />
                  </div>
                </div>
                <div className="border-t border-[#e7c588]/25 pt-3 mb-4">
                  <div className="flex justify-between text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-1">
                    <span>₹{p.pricePerHour} × {duration}h</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-2">
                    <span>Platform fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">
                    <span>Total</span>
                    <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">₹{total}</span>
                  </div>
                </div>
                <Link to={`/booking/${p.id}`}
                  className="block w-full py-3 rounded-xl bg-primary-500 text-[#f9f0d7] font-semibold text-center hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-400/25 active:scale-[0.98] transition-all">
                  Book Now
                </Link>
                <p className="text-center text-[10px] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-2">Free cancellation up to 1 hour before</p>
              </GlassCard>

              {/* Availability Bar */}
              <GlassCard>
                <div className="flex justify-between text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-2">
                  <span>Occupancy</span>
                  <span>{occupiedPct}%</span>
                </div>
                <div className="h-2 bg-[#1c1c1f] dark:bg-[#1c1c1f]  rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${occupiedPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${occupiedPct > 80 ? 'bg-[#e7c588]' : occupiedPct > 50 ? 'bg-[#0a0a0b]0' : 'bg-[#0a0a0b]0'}`} />
                </div>
                <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-2">{p.availableSlots} of {p.totalSlots} slots available</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
