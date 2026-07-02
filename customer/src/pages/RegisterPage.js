import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { FaParking, FaShieldAlt, FaBolt, FaStar, FaCheckCircle } from 'react-icons/fa';

const perks = [
  'Real-time parking availability',
  'Secure payments via Razorpay',
  'Best rates guaranteed',
  'QR code entry — no waiting',
  'Free cancellation up to 2 hours',
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex overflow-hidden transition-colors duration-300">
      {/* Left: 3D City + Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-gradient-to-br from-orange-500 to-orange-700 dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-gradient-to-r from-white/20 dark:from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-gradient-to-l from-white/20 dark:from-blue-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 dark:bg-orange-500/10 border border-white/30 dark:border-orange-500/20 rounded-full text-white dark:text-orange-400 text-sm font-medium mb-6 animate-tilt-in">
            <FaParking /> Join 10,000+ Happy Drivers
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 animate-tilt-in">
            Join{' '}
            <span className="text-orange-200 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-orange-400 dark:to-orange-300">
              SpotIQ
            </span>
            {' '}Today
          </h1>

          <p className="text-lg text-orange-100 dark:text-gray-400 mb-8 animate-slideUp">
            Stress-free parking starts here. Sign up and enjoy seamless reservations across Ahmedabad.
          </p>

          <div className="space-y-3 mb-10 animate-slideUp" style={{ animationDelay: '0.15s' }}>
            {perks.map((text, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-white/30 dark:bg-gradient-to-br dark:from-orange-500 dark:to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <FaCheckCircle className="text-white text-sm" />
                </div>
                <span className="text-white/90 dark:text-gray-300 group-hover:text-white transition-colors">{text}</span>
              </div>
            ))}
          </div>

          <div className="perspective-1000 animate-float-slow" style={{ animationDuration: '8s' }}>
            <div className="grid grid-cols-6 gap-2" style={{ transform: 'rotateX(55deg) rotateZ(-35deg) translateZ(0)' }}>
              {[...Array(18)].map((_, i) => (
                <div key={i} className={`aspect-square rounded border backdrop-blur-sm transition-all hover:scale-110 ${
                  i % 4 === 0 ? 'bg-green-400/30 dark:bg-green-500/20 border-green-400/40 dark:border-green-500/30' :
                  i % 4 === 1 ? 'bg-white/30 dark:bg-orange-500/20 border-white/40 dark:border-orange-500/30' :
                  i % 4 === 2 ? 'bg-blue-300/30 dark:bg-blue-500/20 border-blue-300/40 dark:border-blue-500/30' :
                  'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10'
                }`} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: FaShieldAlt, text: 'Encrypted' },
              { icon: FaBolt, text: 'Fast' },
              { icon: FaStar, text: '4.8 Rating' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-full text-sm text-white/90 dark:text-gray-400">
                <f.icon className="text-white/80 dark:text-orange-400 text-xs" /> {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Register Card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[length:40px_40px] lg:hidden" />
        <div className="w-full max-w-md relative">
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-white mb-8 lg:hidden">
            <FaParking className="text-blue-500 dark:text-orange-400" />
            SpotIQ
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl dark:shadow-orange-500/5 transition-colors duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Join the SpotIQ community</p>
            </div>
            <RegisterForm />
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-blue-600/60 dark:text-orange-400/60 hover:text-blue-600 dark:hover:text-orange-400">Terms</Link>
            {' '}&{' '}
            <Link to="/privacy" className="text-blue-600/60 dark:text-orange-400/60 hover:text-blue-600 dark:hover:text-orange-400">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
