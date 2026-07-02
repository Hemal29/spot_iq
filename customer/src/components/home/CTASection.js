import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaParking, FaMapMarkerAlt } from 'react-icons/fa';

const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* 3D Floating background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-orange-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" />
        <div className="hero-grid opacity-20" />
      </div>

      {/* Floating icons */}
      <div className="absolute top-1/4 left-[15%] text-blue-300/10 text-6xl animate-float-slow">
        <FaParking />
      </div>
      <div className="absolute bottom-1/4 right-[10%] text-blue-200/10 text-5xl animate-float">
        <FaMapMarkerAlt />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-blue-200 text-sm font-medium mb-6">
            <FaParking />
            Start Parking Smarter Today
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Ready to Park Stress-Free{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Across Ahmedabad?
            </span>
          </h2>

          <p className="text-lg text-blue-100/70 max-w-2xl mx-auto mb-10">
            Join 25,000+ drivers who already park smarter. From Sabarmati Riverfront to SG Highway —
            your perfect spot is waiting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 card-3d"
            >
              Get Started Free
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/find-parking"
              className="group inline-flex items-center gap-2 px-8 py-4 glass hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300 card-3d"
            >
              <FaMapMarkerAlt />
              Browse Locations
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-blue-200/50 text-sm">
            <span className="flex items-center gap-1">🔒 Secure Payments</span>
            <span className="flex items-center gap-1">⚡ Instant Booking</span>
            <span className="flex items-center gap-1">📱 QR Entry</span>
            <span className="flex items-center gap-1">🕐 24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V45C360 15 1080 15 1440 45V60H0Z" fill="currentColor" className="text-white dark:text-gray-900" />
        </svg>
      </div>
    </section>
  );
};

export default CTASection;
