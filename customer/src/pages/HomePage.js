import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCar,
  FaMotorcycle,
  FaPlug,
  FaSearch,
  FaBuilding,
  FaHome,
  FaBolt,
  FaMoon,
  FaRobot,
  FaSatelliteDish,
  FaCreditCard,
  FaShieldAlt,
  FaMobileAlt,
  FaLeaf,
  FaStar,
  FaArrowRight,
  FaPlay,
} from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import parkingService from '../services/parkingService';
import GlassCard from '../components/common/GlassCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import PageTransition from '../components/common/PageTransition';

const MOCK_LOCATIONS = [
  { _id: 'sg-highway', name: 'SG Highway Hub', area: 'SG Highway • Satellite', city: 'Ahmedabad', rating: 4.8, pricePerHour: 40, slots: '120+ slots', tag: 'Busiest', image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80&auto=format&fit=crop', video: '/hero_video.mp4' },
  { _id: 'cg-road', name: 'CG Road Central', area: 'CG Road • Navrangpura', city: 'Ahmedabad', rating: 4.7, pricePerHour: 35, slots: '80+ slots', tag: 'Shopping', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop', video: '/hero_video.mp4' },
  { _id: 'riverfront', name: 'Riverfront East', area: 'Sabarmati Riverfront', city: 'Ahmedabad', rating: 4.9, pricePerHour: 30, slots: '200+ slots', tag: 'Premium', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80&auto=format&fit=crop', video: '/hero_video.mp4' },
  { _id: 'kankaria', name: 'Kankaria Lake Gate', area: 'Kankaria • Maninagar', city: 'Ahmedabad', rating: 4.6, pricePerHour: 20, slots: '150+ slots', tag: 'Family', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80&auto=format&fit=crop', video: '/hero_video.mp4' },
  { _id: 'vastrapur', name: 'AlphaOne Mall Parking', area: 'Vastrapur • Bodakdev', city: 'Ahmedabad', rating: 4.5, pricePerHour: 30, slots: '300+ slots', tag: 'Mall', image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&q=80&auto=format&fit=crop', video: '/hero_video.mp4' },
  { _id: 'airport', name: 'Airport Terminal Parking', area: 'SVPI Airport • Hansol', city: 'Ahmedabad', rating: 4.7, pricePerHour: 50, slots: '500+ slots', tag: '24/7', image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&q=80&auto=format&fit=crop', video: '/hero_video.mp4' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(target, 10);
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar
          key={i}
          className={`text-xs ${i < Math.floor(rating) ? 'text-[#d9a94f]' : 'text-[#e7c588]/80'}`}
        />
      ))}}
      <span className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  ml-1">{rating}</span>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const res = await parkingService.getAllParking({ limit: 6 });
        setParkings(res.data?.data || res.data || []);
      } catch {
        setParkings(MOCK_LOCATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('q', location);
    if (date) params.set('date', date);
    if (time) params.set('time', time);
    params.set('vehicle', vehicleType);
    navigate(`/parking?${params.toString()}`);
  };

  const suggestions = [
    { label: 'Near Office', icon: FaBuilding },
    { label: 'Near Home', icon: FaHome },
    { label: 'EV Charging', icon: FaBolt },
    { label: 'Night Safe', icon: FaMoon },
  ];

  const features = [
    { icon: FaRobot, title: 'AI Recommendations', desc: 'Smart algorithms find the best parking for you', color: 'from-[#0a0a0b] to-[#3d2f14]' },
    { icon: FaSatelliteDish, title: 'Real-time Availability', desc: 'Live slot updates so you never arrive to a full lot', color: 'from-[#bf8a2e] to-[#e7c588]' },
    { icon: FaCreditCard, title: 'Instant Payments', desc: 'One-tap payment with UPI, cards, and wallets', color: 'from-[#0a0a0b] to-[#7a5620]' },
    { icon: FaShieldAlt, title: 'Safe & Secure', desc: 'CCTV monitored with 24/7 security', color: 'from-[#1c1c1f] to-[#0a0a0b]' },
    { icon: FaMobileAlt, title: 'Easy Booking', desc: 'Book in under 30 seconds', color: 'from-[#9c6e24] to-[#e7c588]' },
    { icon: FaLeaf, title: 'Eco-Friendly', desc: 'Reduce carbon footprint with optimized routes', color: 'from-[#0a0a0b] to-[#e7c588]' },
  ];

  const steps = [
    { num: 1, title: 'Search', desc: 'Enter your destination' },
    { num: 2, title: 'Compare', desc: 'AI finds best options' },
    { num: 3, title: 'Book', desc: 'Reserve your spot' },
    { num: 4, title: 'Park', desc: 'Navigate and park' },
  ];

  const displayLocations = (parkings.length > 0 ? parkings : MOCK_LOCATIONS).map((loc, i) => ({
    ...MOCK_LOCATIONS[i % MOCK_LOCATIONS.length],
    ...loc,
    video: loc.video || MOCK_LOCATIONS[i % MOCK_LOCATIONS.length].video,
    image: loc.image || MOCK_LOCATIONS[i % MOCK_LOCATIONS.length].image,
    area: loc.area || MOCK_LOCATIONS[i % MOCK_LOCATIONS.length].area,
  }));

  return (
    <PageTransition>
      <main className="overflow-hidden">
        <section className="relative min-h-[100vh] flex items-center -mt-20 pt-32 pb-16 overflow-hidden bg-[#0a0a0b]">
          {/* Parking hero video background */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/hero_video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          {/* Cinematic overlay — dark + gold tint for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[#0a0a0b]/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[#e7c588]/[0.07] mix-blend-overlay" />

          <div className="relative max-w-7xl mx-auto px-4 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={stagger} initial="hidden" animate="visible">
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0a0b]/10 backdrop-blur-md border border-[#e7c588]/30 text-sm font-medium text-[#f3e0ae] mb-6"
                >
                  <img src="/logoSpotIQ.png" alt="SpotIQ" className="w-5 h-5 object-contain" />
                  Ahmedabad&apos;s Premium Smart Parking
                  <span className="w-2 h-2 rounded-full bg-[#e7c588] animate-pulse" />
                </motion.div>
                <motion.h1
                  variants={fadeUp}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight"
                >
                  <span className="text-[#f9f0d7] block drop-shadow-2xl">Smart Parking</span>
                  <span className="bg-gradient-to-r from-[#f9f0d7] via-[#e7c588] to-[#bf8a2e] bg-clip-text text-transparent">
                    Powered by AI
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  custom={1}
                  className="mt-6 text-lg text-[#f3e0ae]/90 max-w-lg leading-relaxed"
                >
                  Find, reserve and pay for parking instantly with real-time availability and AI recommendations.
                </motion.p>

                <motion.form
                  variants={fadeUp}
                  custom={2}
                  onSubmit={handleSearch}
                  className="mt-8 bg-black/50 backdrop-blur-xl rounded-2xl border border-[#e7c588]/25 shadow-2xl p-6 space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]" />
                      <input
                        type="text"
                        placeholder="Where are you going?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0b]/10 border border-[#e7c588]/25 text-[#f9f0d7] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e7c588]/60 focus:border-[#e7c588]/60 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0b]/10 border border-[#e7c588]/25 text-[#f9f0d7] [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-[#e7c588]/60 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0b]/10 border border-[#e7c588]/25 text-[#f9f0d7] [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-[#e7c588]/60 transition-all"
                      />
                    </div>
                    <div className="relative flex gap-2">
                      {[
                        { key: 'car', icon: FaCar, label: 'Car' },
                        { key: 'bike', icon: FaMotorcycle, label: 'Bike' },
                        { key: 'ev', icon: FaPlug, label: 'EV' },
                      ].map(({ key, icon: Icon, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setVehicleType(key)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-medium ${
                            vehicleType === key
                              ? 'bg-[#e7c588] text-black border-[#e7c588] shadow-lg shadow-[#e7c588]/30'
                              : 'bg-[#0a0a0b]/10 border-[#e7c588]/25 text-[#f3e0ae] hover:border-[#e7c588]/50 hover:text-[#f9f0d7]'
                          }`}
                        >
                          <Icon />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#e7c588] text-black font-bold rounded-xl shadow-lg shadow-[#e7c588]/30 hover:shadow-xl hover:shadow-[#e7c588]/40 hover:bg-[#f3e0ae] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <FaSearch />
                    Find Parking
                  </button>
                </motion.form>

                <motion.div variants={fadeUp} custom={3} className="mt-5 flex flex-wrap gap-2">
                  {suggestions.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => { setLocation(label.replace('Near ', '').replace('EV ', '').replace('Night ', '')); navigate(`/parking?q=${label}`); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0a0a0b]/10 backdrop-blur-md border border-[#e7c588]/25 text-sm text-[#f3e0ae] hover:bg-[#e7c588]/20 hover:text-[#f9f0d7] hover:border-[#e7c588]/40 transition-all cursor-pointer"
                    >
                      <Icon className="text-xs text-[#e7c588]" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:block relative"
              >
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-[#e7c588]/20 rounded-3xl rotate-6 blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e7c588]/20 to-transparent rounded-3xl" />
                  <div className="absolute inset-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-[#e7c588]/25 shadow-2xl flex items-center justify-center overflow-hidden">
                    <img
                      src="/logoSpotIQ-full.png"
                      alt="SpotIQ premium parking"
                      className="absolute inset-0 w-full h-full object-contain p-8 opacity-90"
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-[#e7c588]/25">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e7c588] animate-pulse" />
                        <span className="text-sm text-[#f9f0d7] font-medium">Live availability</span>
                      </div>
                      <span className="text-sm font-bold text-[#e7c588]">500+ spots</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { value: 500, suffix: '+', label: 'Locations' },
                { value: 50, suffix: 'K+', label: 'Bookings' },
                { value: 4.8, suffix: '★', label: 'Rating' },
                { value: 24, suffix: '/7', label: 'Available' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  custom={i}
                  className="text-center py-6 rounded-2xl bg-black/50 backdrop-blur-xl border border-[#e7c588]/25 shadow-xl"
                >
                  <div className="text-3xl font-extrabold text-[#e7c588]">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-[#e7c588]/80 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {isAuthenticated && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <GlassCard className="p-8 relative overflow-hidden" delay={0}>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400/5 to-gray-400/5 rounded-2xl" />
                  <div className="relative">
                    <motion.div variants={fadeUp}>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">
                        {getGreeting()} 👋 {user?.name || 'there'}
                      </h2>
                      <p className="mt-2 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">
                        Recommended parking near your destination
                      </p>
                    </motion.div>

                    <motion.div variants={fadeUp} custom={1} className="mt-8 grid sm:grid-cols-3 gap-4">
                      {[
                        {
                          icon: FaBuilding,
                          title: 'Cheapest Nearby',
                          desc: 'Starting at ₹15/hr',
                          gradient: 'from-[#0a0a0b] to-primary-400',
                        },
                        {
                          icon: FaBolt,
                          title: 'EV Charging',
                          desc: '3 stations available',
                          gradient: 'bg-primary-400',
                        },
                        {
                          icon: FaShieldAlt,
                          title: 'Safest Option',
                          desc: 'CCTV monitored',
                          gradient: 'from-[#0a0a0b] to-[#e7c588]',
                        },
                      ].map((card, i) => (
                        <motion.div
                          key={card.title}
                          whileHover={{ y: -6, scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="relative overflow-hidden rounded-xl p-5 cursor-pointer group"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                              <card.icon className="text-xl text-[#f9f0d7]" />
                            </div>
                            <h3 className="mt-4 font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">{card.title}</h3>
                            <p className="mt-1 text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">{card.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </section>
        )}

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#f9f0d7] dark:text-[#f9f0d7] "
              >
                Why Choose{' '}
                <span className="bg-gradient-to-r from-[#bf8a2e] via-[#e7c588] to-[#9c6e24] bg-clip-text text-transparent">
                  SpotIQ
                </span>
                ?
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="mt-4 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  max-w-2xl mx-auto">
                Premium, secure and effortless parking — with a touch of luxury, powered by AI.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feat, i) => (
                <GlassCard key={feat.title} delay={i * 0.05} className="p-6 group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <feat.icon className="text-2xl text-[#f9f0d7]" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">{feat.title}</h3>
                  <p className="mt-2 text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  leading-relaxed">{feat.desc}</p>
                </GlassCard>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#f9f0d7] dark:text-[#f9f0d7] "
              >
                How It{' '}
                <span className="bg-gradient-to-r from-[#bf8a2e] to-[#e7c588] bg-clip-text text-transparent">
                  Works
                </span>
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="relative grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-[#e7c588]/25 " />

              {steps.map((step, i) => (
                <motion.div key={step.num} variants={fadeUp} custom={i} className="relative text-center">
                  <div className="relative z-10 mx-auto w-14 h-14 rounded-full bg-[#0a0a0b] ring-1 ring-[#e7c588]/50 flex items-center justify-center text-[#e7c588] font-bold text-lg shadow-xl shadow-black/20">
                    {step.num}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">{step.title}</h3>
                  <p className="mt-2 text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#f9f0d7] dark:text-[#f9f0d7] "
              >
                Popular{' '}
                <span className="bg-gradient-to-r from-[#bf8a2e] via-[#e7c588] to-[#9c6e24] bg-clip-text text-transparent">
                  Parking Locations
                </span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="mt-4 text-[#e7c588]/80 max-w-2xl mx-auto">
                Top Ahmedabad areas — SG Highway, CG Road, Riverfront, Kankaria, Vastrapur & Airport. Tap a card to book.
              </motion.p>
            </motion.div>

            {loading ? (
              <SkeletonLoader type="card" count={6} />
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayLocations.map((loc, i) => (
                  <motion.div key={loc._id || i} variants={fadeUp} custom={i}>
                    <GlassCard className="overflow-hidden group" delay={i * 0.05}>
                      <div className="relative h-56 overflow-hidden bg-black">
                        <video
                          src={loc.video || '/hero_video.mp4'}
                          poster={loc.image}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* readability overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                        <div className="absolute inset-0 bg-[#e7c588]/[0.06] mix-blend-overlay" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          {loc.tag && (
                            <span className="px-3 py-1 rounded-full bg-[#e7c588] text-black text-xs font-bold">
                              {loc.tag}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#e7c588]/25 text-xs font-medium text-[#f9f0d7]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e7c588] animate-pulse" />
                            Live
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#e7c588]/30 text-sm font-bold text-[#e7c588]">
                          ₹{loc.pricePerHour}/hr
                        </div>
                        <div className="absolute bottom-3 left-4 right-4">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#f3e0ae]/90 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[10px]" />
                            {loc.area || loc.city}
                          </p>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-[#f9f0d7] group-hover:text-[#e7c588] transition-colors">
                            {loc.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-[#e7c588]/80 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs text-[#e7c588]" />
                          {loc.area || loc.city} • {loc.slots || 'Slots available'}
                        </p>
                        <div className="mt-3">
                          <StarRating rating={loc.rating} />
                        </div>
                        <Link
                          to={`/parking/${loc._id}`}
                          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a0a0b] text-[#e7c588] border border-[#e7c588]/40 text-sm font-semibold rounded-xl hover:bg-[#e7c588] hover:text-black hover:shadow-lg hover:shadow-[#e7c588]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Book Now
                          <FaArrowRight className="text-xs" />
                        </Link>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="relative overflow-hidden rounded-3xl bg-[#0a0a0b] ring-1 ring-[#e7c588]/30 p-12 sm:p-16 text-center"
            >
              <div className="absolute inset-0">
                <div className="absolute top-10 left-[20%] w-40 h-40 bg-[#e7c588]/15 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-[25%] w-52 h-52 bg-[#e7c588]/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <motion.h2
                variants={fadeUp}
                className="relative text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#f9f0d7]"
              >
                Ready to Find Perfect Parking?
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="relative mt-4 text-[#f3e0ae]/90 text-lg max-w-xl mx-auto">
                Join 10,000+ drivers who trust SpotIQ
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="relative mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-[#e7c588] text-black font-bold rounded-xl hover:bg-[#f3e0ae] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#e7c588]/25"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-3.5 border-2 border-[#e7c588]/40 text-[#f3e0ae] font-bold rounded-xl hover:bg-[#e7c588]/10 hover:border-[#e7c588] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
