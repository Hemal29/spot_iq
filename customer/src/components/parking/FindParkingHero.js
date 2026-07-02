import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCar, FaCalendarAlt, FaClock, FaArrowRight, FaCrosshairs, FaParking } from 'react-icons/fa';

const vehicleTypes = [
  { value: 'sedan', label: 'Sedan', icon: '🚗' },
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: 'hatchback', label: 'Hatchback', icon: '🚘' },
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { value: 'truck', label: 'Truck', icon: '🚛' },
];

const FindParkingHero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('sedan');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState('10:00');
  const [exitTime, setExitTime] = useState('12:00');
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('city', location.trim());
    if (vehicleType) params.set('type', vehicleType);
    navigate(`/find-parking?${params.toString()}`);
  };

  const handleCurrentLocation = () => {
    setLocation('Current Location Detected...');
    setTimeout(() => setLocation('SG Highway, Ahmedabad'), 1500);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] min-h-[90vh] flex items-center">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />

      {/* Large gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-[600px] h-[600px] bg-gradient-to-l from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />

      {/* 3D Isometric City Illustration */}
      <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 hidden lg:block">
        <div className="absolute bottom-[15%] right-[20%] perspective-1000">
          {/* Building 1 */}
          <div className="w-24 h-48 bg-gradient-to-t from-orange-500/20 to-orange-400/10 rounded-t-lg border border-orange-500/20 animate-float-slow" style={{ transform: 'rotateX(60deg) rotateZ(-30deg) translateZ(0)' }}>
            <div className="grid grid-cols-3 gap-1 p-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-orange-400/30 rounded-sm" />
              ))}
            </div>
          </div>
          {/* Building 2 */}
          <div className="w-20 h-36 bg-gradient-to-t from-blue-500/20 to-blue-400/10 rounded-t-lg border border-blue-500/20 ml-16 -mt-20 animate-float" style={{ transform: 'rotateX(60deg) rotateZ(-30deg) translateZ(0)' }}>
            <div className="grid grid-cols-2 gap-1 p-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-blue-400/30 rounded-sm" />
              ))}
            </div>
          </div>
          {/* Building 3 */}
          <div className="w-16 h-28 bg-gradient-to-t from-purple-500/20 to-purple-400/10 rounded-t-lg border border-purple-500/20 -ml-8 -mt-12 animate-float-slow" style={{ transform: 'rotateX(60deg) rotateZ(-30deg) translateZ(0)' }} />
          {/* Car on road */}
          <div className="absolute -bottom-4 left-8 text-3xl animate-float" style={{ animationDuration: '3s' }}>🚗</div>
          <div className="absolute -bottom-2 left-20 text-2xl animate-float" style={{ animationDuration: '4s', animationDelay: '1s' }}>🚙</div>
          {/* Trees */}
          <div className="absolute -bottom-2 -left-4 text-2xl animate-float-slow">🌳</div>
          <div className="absolute -bottom-4 left-32 text-xl animate-float-slow" style={{ animationDelay: '0.5s' }}>🌴</div>
          {/* Parking Pins */}
          <div className="absolute -top-4 left-6 text-orange-400 text-2xl animate-bounce">📍</div>
          <div className="absolute -top-2 right-4 text-orange-400 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>📍</div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text + Search */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6 animate-tilt-in">
              <FaParking className="text-orange-400" />
              Smart Parking — Ahmedabad
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 animate-tilt-in">
              Find Your Perfect{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">
                Parking Space
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mb-8 animate-slideUp animation-delay-100">
              Search, compare, and reserve parking instantly across 200+ locations in Ahmedabad.
              Smart pricing, real-time availability, AI-powered recommendations.
            </p>

            {/* Smart Search Card */}
            <form onSubmit={handleSearch} className="animate-scale-in animation-delay-200">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl shadow-orange-500/5 hover:border-orange-500/20 transition-all duration-500">
                {/* Location Row */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-orange-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Search by area, landmark, or location..."
                      className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCurrentLocation}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs rounded-lg transition-colors whitespace-nowrap"
                    >
                      <FaCrosshairs /> Current Location
                    </button>
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5">
                  {/* Vehicle Type */}
                  <div className="relative p-4">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Vehicle</label>
                    <button
                      type="button"
                      onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                      className="flex items-center gap-2 text-sm text-white w-full"
                    >
                      <span>{vehicleTypes.find(v => v.value === vehicleType)?.icon}</span>
                      <span>{vehicleTypes.find(v => v.value === vehicleType)?.label}</span>
                    </button>
                    {showVehicleDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E293B] border border-white/10 rounded-xl p-1 z-20 shadow-xl">
                        {vehicleTypes.map((v) => (
                          <button
                            key={v.value}
                            type="button"
                            onClick={() => { setVehicleType(v.value); setShowVehicleDropdown(false); }}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${vehicleType === v.value ? 'bg-orange-500/20 text-orange-400' : 'text-gray-300 hover:bg-white/5'}`}
                          >
                            <span>{v.icon}</span> {v.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="p-4">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500 text-xs" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Entry Time */}
                  <div className="p-4">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Entry Time</label>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-gray-500 text-xs" />
                      <input
                        type="time"
                        value={entryTime}
                        onChange={(e) => setEntryTime(e.target.value)}
                        className="bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Exit Time */}
                  <div className="p-4">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Exit Time</label>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-gray-500 text-xs" />
                      <input
                        type="time"
                        value={exitTime}
                        onChange={(e) => setExitTime(e.target.value)}
                        className="bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <div className="p-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                  >
                    <FaSearch />
                    Search Parking
                    <FaArrowRight className="text-sm" />
                  </button>
                </div>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 sm:gap-6 mt-6 text-xs text-gray-500 animate-slideUp animation-delay-300">
              <span className="flex items-center gap-1">🔒 Secure</span>
              <span className="flex items-center gap-1">⚡ Instant</span>
              <span className="flex items-center gap-1">🔄 Free Cancel</span>
              <span className="flex items-center gap-1">📱 QR Entry</span>
            </div>
          </div>

          {/* Right: Large 3D city (desktop) */}
          <div className="hidden lg:block relative h-[500px] perspective-1000">
            {/* Main parking building */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2" style={{ transform: 'rotateX(55deg) rotateZ(-35deg) translateZ(0)' }}>
              {/* Large parking structure */}
              <div className="relative">
                <div className="w-64 h-72 bg-gradient-to-t from-orange-500/15 via-orange-500/10 to-transparent rounded-lg border border-orange-500/20 backdrop-blur-sm">
                  <div className="grid grid-cols-4 gap-2 p-3">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className={`aspect-square rounded ${i % 3 === 0 ? 'bg-green-400/20 border border-green-400/30' : 'bg-white/5 border border-white/10'}`} />
                    ))}
                  </div>
                </div>
                {/* Roof */}
                <div className="absolute -top-2 -left-2 -right-2 h-3 bg-gradient-to-r from-blue-500/30 to-orange-500/30 rounded-t-lg" />
              </div>

              {/* Cars on road */}
              <div className="absolute -bottom-8 -left-16 text-3xl animate-float" style={{ animationDuration: '4s' }}>🚗</div>
              <div className="absolute -bottom-6 left-8 text-2xl animate-float" style={{ animationDuration: '5s', animationDelay: '1s' }}>🚙</div>
              <div className="absolute -bottom-10 left-20 text-3xl animate-float" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🚕</div>

              {/* Road markings */}
              <div className="absolute -bottom-12 -left-20 -right-4 h-1 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent" />
              <div className="absolute -bottom-16 -left-20 -right-4 h-1 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />
            </div>

            {/* Smaller buildings */}
            <div className="absolute bottom-32 left-8" style={{ transform: 'rotateX(55deg) rotateZ(-35deg) translateZ(0)' }}>
              <div className="w-16 h-24 bg-gradient-to-t from-blue-500/15 to-blue-500/5 rounded border border-blue-500/20">
                <div className="grid grid-cols-2 gap-1 p-1.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-blue-400/20 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-24 right-8" style={{ transform: 'rotateX(55deg) rotateZ(-35deg) translateZ(0)' }}>
              <div className="w-20 h-32 bg-gradient-to-t from-purple-500/15 to-purple-500/5 rounded border border-purple-500/20">
                <div className="grid grid-cols-2 gap-1 p-1.5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-purple-400/20 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Trees scattered */}
            <div className="absolute bottom-16 left-12 text-2xl animate-float-slow">🌳</div>
            <div className="absolute bottom-20 right-16 text-xl animate-float-slow" style={{ animationDelay: '0.8s' }}>🌴</div>
            <div className="absolute bottom-8 left-1/3 text-xl animate-float-slow" style={{ animationDelay: '1.5s' }}>🌳</div>

            {/* Floating parking pins */}
            <div className="absolute top-1/4 right-1/4 text-orange-400 text-3xl animate-bounce">📍</div>
            <div className="absolute top-1/3 left-1/4 text-orange-400 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>📍</div>
            <div className="absolute bottom-1/3 right-1/3 text-orange-400 text-xl animate-bounce" style={{ animationDelay: '0.8s' }}>📍</div>

            {/* Street lights */}
            <div className="absolute top-1/2 left-12 text-2xl">💡</div>
            <div className="absolute top-1/2 right-12 text-2xl">💡</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F172A] to-transparent" />
    </section>
  );
};

export default FindParkingHero;
