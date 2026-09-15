import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaParking, FaMapMarkerAlt, FaStar, FaShieldAlt } from 'react-icons/fa';

const stats = [
  { value: '4.8', label: 'Driver Rating', icon: FaStar },
  { value: '200+', label: 'Locations in Ahmedabad', icon: FaMapMarkerAlt },
  { value: '24/7', label: 'Support', icon: FaShieldAlt },
];

const floatingElements = [
  { icon: FaParking, className: 'top-20 left-[10%] text-[#e7c588]/20 text-6xl animate-float-slow' },
  { icon: FaMapMarkerAlt, className: 'top-40 right-[15%] text-[#f3e0ae]/15 text-5xl animate-float' },
  { icon: FaParking, className: 'bottom-32 left-[20%] text-[#e7c588]/10 text-7xl animate-float-slow' },
  { icon: FaMapMarkerAlt, className: 'bottom-24 right-[10%] text-[#f3e0ae]/20 text-4xl animate-float' },
];

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/find-parking?city=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-black min-h-[90vh] flex items-center">
      {/* Parking video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero_video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[#0a0a0b]" />
      <div className="absolute inset-0 bg-[#e7c588]/[0.06] mix-blend-overlay" />

      {/* Floating 3D icons */}
      {floatingElements.map((el, i) => (
        <div key={i} className={`absolute ${el.className}`}>
          <el.icon />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-[#f3e0ae] text-sm font-medium mb-6 animate-tilt-in">
            <FaParking className="text-[#e7c588]/80" />
            Ahmedabad's Smart Parking Solution
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          </div>

          {/* Main heading with 3D text effect */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#f9f0d7] leading-tight mb-6 animate-tilt-in">
            Park Smart in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e7c588] via-[#f3e0ae] to-[#bf8a2e]">
              Ahmedabad
            </span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl text-[#f3e0ae]/70 font-normal">
              Sabarmati Riverfront to SG Highway
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#f9f0d7]/70 max-w-2xl mx-auto mb-10 animate-slideUp animation-delay-100">
            Find, book, and pay for parking in seconds across Ahmedabad.
            From Kankaria Lake to AlphaOne Mall — never circle the block again.
          </p>

          {/* 3D Search Card */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-12 animate-scale-in animation-delay-200"
          >
            <div className="relative flex-1 w-full group perspective-1000">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 z-10" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by area — e.g. CG Road, Navrangpura, Vastrapur..."
                className="w-full pl-11 pr-4 py-4 bg-[#0a0a0b]/10  border border-[#e7c588]/25 rounded-2xl text-sm text-[#f9f0d7] placeholder-gray-200/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-300 shadow-xl card-3d"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-[#f9f0d7] font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-primary-400/30 hover:shadow-primary-400/50 card-3d"
            >
              <FaSearch />
              Find Parking
            </button>
          </form>

          {/* Quick location chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 animate-slideUp animation-delay-300">
            {['SG Highway', 'CG Road', 'Navrangpura', 'Vastrapur', 'Bodakdev', 'Maninagar'].map((loc) => (
              <button
                key={loc}
                onClick={() => { navigate(`/find-parking?city=${encodeURIComponent(loc)}`); }}
                className="px-4 py-1.5 glass hover:bg-[#0a0a0b]/20 rounded-full text-xs text-[#f3e0ae] hover:text-[#f9f0d7] transition-all duration-300 card-3d"
              >
                <FaMapMarkerAlt className="inline mr-1 text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[10px]" />
                {loc}
              </button>
            ))}
          </div>

          {/* 3D Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 animate-slideUp animation-delay-500">
            {stats.map((stat) => (
              <div key={stat.label} className="group perspective-1000">
                <div className="glass rounded-2xl p-4 sm:p-6 card-3d transition-all duration-500">
                  <stat.icon className="text-2xl text-[#e7c588]/80 dark:text-[#e7c588]/80 mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-[#f9f0d7] mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-[#f3e0ae]/70">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curved bottom separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="currentColor" className="text-gray-50" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
