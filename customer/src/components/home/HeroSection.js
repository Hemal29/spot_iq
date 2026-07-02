import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaParking, FaMapMarkerAlt, FaStar, FaShieldAlt } from 'react-icons/fa';

const stats = [
  { value: '25,000+', label: 'Happy Customers', icon: FaStar },
  { value: '200+', label: 'Locations in Ahmedabad', icon: FaMapMarkerAlt },
  { value: '99.9%', label: 'Uptime', icon: FaShieldAlt },
];

const floatingElements = [
  { icon: FaParking, className: 'top-20 left-[10%] text-blue-300/20 text-6xl animate-float-slow' },
  { icon: FaMapMarkerAlt, className: 'top-40 right-[15%] text-blue-200/15 text-5xl animate-float' },
  { icon: FaParking, className: 'bottom-32 left-[20%] text-blue-300/10 text-7xl animate-float-slow' },
  { icon: FaMapMarkerAlt, className: 'bottom-24 right-[10%] text-blue-200/20 text-4xl animate-float' },
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
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 min-h-[90vh] flex items-center">
      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid opacity-40" />

      {/* Animated gradient orb */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" />

      {/* Floating 3D icons */}
      {floatingElements.map((el, i) => (
        <div key={i} className={`absolute ${el.className}`}>
          <el.icon />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-blue-200 text-sm font-medium mb-6 animate-tilt-in">
            <FaParking className="text-blue-300" />
            Ahmedabad's Smart Parking Solution
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Main heading with 3D text effect */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-tilt-in">
            Park Smart in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-200">
              Ahmedabad
            </span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl text-blue-200/70 font-normal">
              Sabarmati Riverfront to SG Highway
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100/70 max-w-2xl mx-auto mb-10 animate-slideUp animation-delay-100">
            Find, book, and pay for parking in seconds across 200+ locations in Ahmedabad.
            From Kankaria Lake to AlphaOne Mall — never circle the block again.
          </p>

          {/* 3D Search Card */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-12 animate-scale-in animation-delay-200"
          >
            <div className="relative flex-1 w-full group perspective-1000">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 z-10" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by area — e.g. CG Road, Navrangpura, Vastrapur..."
                className="w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-xl card-3d"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 card-3d"
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
                className="px-4 py-1.5 glass hover:bg-white/20 rounded-full text-xs text-blue-200 hover:text-white transition-all duration-300 card-3d"
              >
                <FaMapMarkerAlt className="inline mr-1 text-orange-400 text-[10px]" />
                {loc}
              </button>
            ))}
          </div>

          {/* 3D Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 animate-slideUp animation-delay-500">
            {stats.map((stat) => (
              <div key={stat.label} className="group perspective-1000">
                <div className="glass rounded-2xl p-4 sm:p-6 card-3d transition-all duration-500">
                  <stat.icon className="text-2xl text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-blue-200/70">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curved bottom separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="currentColor" className="text-gray-50 dark:text-gray-950" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
