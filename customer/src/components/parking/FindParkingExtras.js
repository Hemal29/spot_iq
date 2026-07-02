import React, { useState } from 'react';
import { FaRobot, FaLightbulb, FaBrain, FaChartLine, FaCar, FaMapMarkedAlt, FaRupeeSign, FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaWalking, FaChargingStation, FaCoffee, FaUtensils, FaGasPump, FaHospital, FaShoppingBag, FaShieldAlt } from 'react-icons/fa';

/* ─── AI Recommendations ─── */
const AIRecommendations = () => {
  const tips = [
    { icon: FaLightbulb, text: 'Peak hours 6-8 PM at CG Road — book before 4 PM for 20% off', color: 'text-yellow-400' },
    { icon: FaBrain, text: 'Kankaria Lake lots fill by noon on weekends. Reserve now!', color: 'text-purple-400' },
    { icon: FaChartLine, text: 'SG Highway rates drop 30% after 9 PM — great for late bookings', color: 'text-green-400' },
    { icon: FaRobot, text: "You typically park 2.3 hrs — try AlphaOne Mall's 3-hr pass", color: 'text-blue-400' },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FaRobot className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Recommendations</h2>
            <p className="text-sm text-gray-400">Smart insights based on traffic, trends & your past bookings</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, i) => (
            <div key={i} className="group bg-[#1E293B] border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-1">
              <tip.icon className={`${tip.color} text-2xl mb-3 group-hover:scale-110 transition-transform`} />
              <p className="text-sm text-gray-300 leading-relaxed">{tip.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 border border-[#0F172A] text-[8px] flex items-center justify-center text-white font-bold">
                      {['🤖', '⚡', '🎯'][j]}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-500">AI confidence: {90 - i * 8}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── ML Availability Prediction ─── */
const MLAvailabilityCard = () => {
  const slots = [
    { loc: 'SG Highway', rate: 82, trend: 'up', time: '2-4 PM' },
    { loc: 'CG Road', rate: 45, trend: 'down', time: 'Now' },
    { loc: 'Kankaria', rate: 93, trend: 'up', time: 'All day' },
    { loc: 'Riverfront', rate: 67, trend: 'stable', time: 'Evening' },
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FaBrain className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">ML-Predicted Availability</h3>
              <p className="text-sm text-gray-400">Real-time predictions powered by TensorFlow.js model</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slots.map((slot, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">{slot.loc}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${slot.trend === 'up' ? 'bg-green-500/20 text-green-400' : slot.trend === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {slot.trend === 'up' ? '↑ Filling' : slot.trend === 'down' ? '↓ Opening' : '→ Stable'}
                  </span>
                </div>
                <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${slot.rate > 70 ? 'bg-gradient-to-r from-orange-500 to-red-500' : slot.rate > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                    style={{ width: `${slot.rate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{slot.rate}% filled</span>
                  <span className="text-gray-500">{slot.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Mini Map ─── */
const MiniMap = () => {
  const locations = [
    { name: 'SG Highway Parking', status: 'available', x: '25%', y: '25%' },
    { name: 'CG Road Lot', status: 'busy', x: '55%', y: '35%' },
    { name: 'Kankaria Parking', status: 'full', x: '35%', y: '60%' },
    { name: 'Riverfront', status: 'available', x: '70%', y: '55%' },
    { name: 'AlphaOne Mall', status: 'busy', x: '45%', y: '45%' },
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <FaMapMarkedAlt className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Live Map — Ahmedabad</h3>
              <p className="text-sm text-gray-400">Real-time parking availability across the city</p>
            </div>
          </div>
          <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-white/5 overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
            {/* Roads */}
            <div className="absolute top-1/2 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent" />
            <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent" />
            <div className="absolute top-[30%] left-0 right-0 h-2 bg-white/5" />
            <div className="absolute top-[70%] left-0 right-0 h-2 bg-white/5" />
            <div className="absolute left-[30%] top-0 bottom-0 w-2 bg-white/5" />
            <div className="absolute left-[65%] top-0 bottom-0 w-2 bg-white/5" />
            {/* Markers */}
            {locations.map((loc, i) => {
              const colorMap = { available: 'bg-green-500', busy: 'bg-yellow-500', full: 'bg-red-500' };
              return (
                <div key={i} className="absolute group" style={{ left: loc.x, top: loc.y }}>
                  <div className={`w-4 h-4 ${colorMap[loc.status]} rounded-full shadow-lg animate-pulse`} />
                  <div className={`w-8 h-8 ${colorMap[loc.status]} rounded-full opacity-20 absolute -top-2 -left-2 animate-ping`} style={{ animationDuration: '2s' }} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
                    {loc.name}
                  </div>
                </div>
              );
            })}
            {/* Center building */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-20">🏢</div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Busy</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Full</span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Cost Calculator ─── */
const CostCalculator = () => {
  const [hours, setHours] = useState(2);
  const [rate, setRate] = useState(40);
  const [isPeak, setIsPeak] = useState(false);

  const baseCost = hours * rate;
  const peakSurcharge = isPeak ? baseCost * 0.2 : 0;
  const total = baseCost + peakSurcharge;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <FaRupeeSign className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Parking Cost Calculator</h3>
              <p className="text-sm text-gray-400">Estimate your parking cost before booking</p>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Hours <span className="text-white font-semibold">{hours}h</span></label>
                <input type="range" min="1" max="24" value={hours} onChange={e => setHours(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>1h</span><span>6h</span><span>12h</span><span>24h</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Rate (₹/hr)</label>
                <input type="range" min="10" max="150" value={rate} onChange={e => setRate(parseInt(e.target.value))} className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>₹10</span><span>₹150</span>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isPeak} onChange={e => setIsPeak(e.target.checked)} className="w-4 h-4 accent-orange-500 rounded" />
                <span className="text-sm text-gray-300">Peak hours (6 PM - 9 PM — 20% surcharge)</span>
              </label>
            </div>
            <div className="bg-white/5 rounded-xl p-6 flex flex-col justify-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300 mb-2">₹{total}</div>
              <p className="text-sm text-gray-400 mb-4">Estimated total for {hours}h parking</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-400"><span>Base ({hours}h × ₹{rate}/hr)</span><span className="text-gray-300">₹{baseCost}</span></div>
                {isPeak && <div className="flex justify-between text-orange-400"><span>Peak surcharge (20%)</span><span>₹{peakSurcharge}</span></div>}
                <div className="pt-1.5 border-t border-white/10 flex justify-between text-white font-semibold"><span>Total</span><span>₹{total}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Nearby Facilities ─── */
const NearbyFacilities = () => {
  const facilities = [
    { icon: FaWalking, name: 'Sabarmati Riverfront Walk', distance: '0.3 km' },
    { icon: FaChargingStation, name: 'EV Charging Station', distance: '0.5 km' },
    { icon: FaCoffee, name: "Starbucks - SG Highway", distance: '0.2 km' },
    { icon: FaUtensils, name: 'Food Court - AlphaOne', distance: '0.8 km' },
    { icon: FaGasPump, name: 'Indian Oil Petrol Pump', distance: '0.4 km' },
    { icon: FaHospital, name: 'Shalby Hospital', distance: '1.2 km' },
    { icon: FaShoppingBag, name: 'CG Road Shopping', distance: '0.6 km' },
    { icon: FaShieldAlt, name: 'Police Chowki', distance: '0.7 km' },
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 lg:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FaWalking className="text-orange-400" /> Nearby Facilities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {facilities.map((f, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-orange-500/30 transition-all">
                <f.icon className="text-orange-400 mb-2" />
                <p className="text-xs text-gray-300 font-medium leading-tight">{f.name}</p>
                <p className="text-[10px] text-gray-500 mt-1">{f.distance}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Review Carousel ─── */
const ReviewCarousel = () => {
  const reviews = [
    { name: 'Priya M.', avatar: '👩', rating: 5, text: 'Found parking near Maninagar in seconds! SpotIQ saved my Sunday outing. 👌', location: 'Maninagar' },
    { name: 'Rahul S.', avatar: '👨', rating: 4, text: 'AI prediction was spot on. Got 40% off at SG Highway!', location: 'SG Highway' },
    { name: 'Neha P.', avatar: '👩‍💼', rating: 5, text: 'QR entry is super smooth. No more waiting at gates.', location: 'Navrangpura' },
    { name: 'Amit K.', avatar: '👨‍💻', rating: 4, text: 'Cost calculator helped me save ₹200 on weekly parking.', location: 'CG Road' },
    { name: 'Sneha D.', avatar: '👩‍🎓', rating: 5, text: 'Kankaria on weekends is nightmare — SpotIQ made it a breeze!', location: 'Kankaria' },
    { name: 'Vikas R.', avatar: '👨‍👦', rating: 4, text: 'Booked riverfront parking in 30 seconds. Highly recommend!', location: 'Sabarmati' },
  ];

  const [currentReview, setCurrentReview] = useState(0);

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 lg:p-8 overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <FaStar className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">What Parkers Say</h3>
              <p className="text-sm text-gray-400">Real reviews from Ahmedabad drivers</p>
            </div>
          </div>
          <div className="relative">
            <div className="flex gap-6 overflow-hidden">
              {[0, 1, 2].map((offset) => {
                const idx = (currentReview + offset) % reviews.length;
                const r = reviews[idx];
                return (
                  <div key={idx} className="min-w-[280px] lg:min-w-[320px] bg-white/5 rounded-xl p-5 border border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{r.avatar}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{r.name}</p>
                        <p className="text-[10px] text-gray-500">{r.location}</p>
                      </div>
                      <div className="ml-auto flex text-yellow-400 text-xs">
                        {[...Array(r.rating)].map((_, i) => <FaStar key={i} />)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{r.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setCurrentReview(prev => (prev - 1 + reviews.length) % reviews.length)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500/20 hover:border-orange-500/30 transition-all">
                <FaChevronLeft className="text-gray-400 text-sm" />
              </button>
              <div className="flex gap-1.5">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => setCurrentReview(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentReview ? 'bg-orange-500 w-4' : 'bg-white/20'}`} />
                ))}
              </div>
              <button onClick={() => setCurrentReview(prev => (prev + 1) % reviews.length)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500/20 hover:border-orange-500/30 transition-all">
                <FaChevronRight className="text-gray-400 text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Smart Stats ─── */
const SmartStats = () => {
  const stats = [
    { value: '200+', label: 'Parking Lots', icon: FaCar },
    { value: '15K+', label: 'Happy Drivers', icon: '😊' },
    { value: '₹2 Cr+', label: 'Driver Savings', icon: '💰' },
    { value: '4.8', label: 'App Rating', icon: FaStar },
    { value: '98%', label: 'Satisfaction', icon: '👍' },
    { value: '<30s', label: 'Avg. Booking', icon: '⚡' },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-orange-500/10 via-[#1E293B] to-blue-500/10 border border-orange-500/20 rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="text-2xl mb-2 group-hover:scale-125 transition-transform inline-block">{typeof s.icon === 'string' ? s.icon : <s.icon className="text-orange-400 mx-auto" />}</div>
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Export ─── */
const FindParkingExtras = () => {
  return (
    <>
      <SmartStats />
      <AIRecommendations />
      <MLAvailabilityCard />
      <MiniMap />
      <NearbyFacilities />
      <CostCalculator />
      <ReviewCarousel />
    </>
  );
};

export default FindParkingExtras;
