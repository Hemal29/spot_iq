import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { FaParking, FaShieldAlt, FaBolt, FaStar } from 'react-icons/fa';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex overflow-hidden transition-colors duration-300">
      {/* Left: 3D City + Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 dark:from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-l from-blue-300/20 dark:from-blue-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 dark:bg-orange-500/10 border border-blue-500/20 dark:border-orange-500/20 rounded-full text-blue-600 dark:text-orange-400 text-sm font-medium mb-6 animate-tilt-in">
            <FaParking /> Smart Parking — Ahmedabad
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 animate-tilt-in">
            Welcome Back to{' '}
            <span className="text-blue-200 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-orange-400 dark:to-orange-300">
              SpotIQ
            </span>
          </h1>

          <p className="text-lg text-blue-100 dark:text-gray-400 mb-8 animate-slideUp">
            Find and reserve the perfect parking spot in seconds. Your spot awaits.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-blue-200 dark:text-gray-400 text-sm mt-1">Parking Spots</div>
            </div>
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-blue-200 dark:text-gray-400 text-sm mt-1">Happy Users</div>
            </div>
          </div>

          <div className="perspective-1000 animate-float-slow" style={{ animationDuration: '8s' }}>
            <div className="flex gap-3" style={{ transform: 'rotateX(55deg) rotateZ(-35deg) translateZ(0)' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className={`w-12 h-12 rounded border backdrop-blur-sm transition-all hover:scale-110 ${
                      (i + j) % 3 === 0 ? 'bg-green-400/30 dark:bg-green-500/20 border-green-400/40 dark:border-green-500/30' :
                      (i + j) % 3 === 1 ? 'bg-blue-300/30 dark:bg-orange-500/20 border-blue-300/40 dark:border-orange-500/30' :
                      'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10'
                    }`} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: FaShieldAlt, text: 'Secure' },
              { icon: FaBolt, text: 'Instant' },
              { icon: FaStar, text: 'Premium' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 dark:bg-white/5 border border-white/10 rounded-full text-sm text-blue-100 dark:text-gray-400">
                <f.icon className="text-blue-200 dark:text-orange-400 text-xs" /> {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[length:40px_40px] lg:hidden" />
        <div className="w-full max-w-md relative">
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-white mb-8 lg:hidden">
            <FaParking className="text-blue-500 dark:text-orange-400" />
            SpotIQ
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl dark:shadow-orange-500/5 transition-colors duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Access your SpotIQ account</p>
            </div>
            <LoginForm />
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600/60 dark:text-orange-400/60 hover:text-blue-600 dark:hover:text-orange-400">Terms</Link>
            {' '}&{' '}
            <Link to="/privacy" className="text-blue-600/60 dark:text-orange-400/60 hover:text-blue-600 dark:hover:text-orange-400">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
