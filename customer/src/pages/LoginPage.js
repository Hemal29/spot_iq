import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { FaParking, FaShieldAlt, FaBolt, FaStar } from 'react-icons/fa';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] dark:bg-[#121214]  flex overflow-hidden transition-colors duration-300">
      {/* Left: video + brand */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-black overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero_video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/85" />
        <div className="absolute inset-0 bg-[#e7c588]/[0.06] mix-blend-overlay" />

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0a0a0b]0/10/10 border border-primary-400/20/20 rounded-full text-primary-400 text-sm font-medium mb-6 animate-tilt-in">
            <FaParking /> Smart Parking — Ahmedabad
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#f9f0d7] leading-tight mb-4 animate-tilt-in">
            Welcome Back to{' '}
            <span className="bg-gradient-to-r from-[#e7c588] to-[#f3e0ae] bg-clip-text text-transparent">
              SpotIQ
            </span>
          </h1>

          <p className="text-lg text-[#f9f0d7]  mb-8 animate-slideUp">
            Find and reserve the perfect parking spot in seconds. Your spot awaits.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="bg-[#0a0a0b]/10   border border-[#e7c588]/25 rounded-xl p-5">
              <div className="text-3xl font-bold text-[#f9f0d7]">50K+</div>
              <div className="text-[#f3e0ae]  text-sm mt-1">Parking Spots</div>
            </div>
            <div className="bg-[#0a0a0b]/10   border border-[#e7c588]/25 rounded-xl p-5">
              <div className="text-3xl font-bold text-[#f9f0d7]">10K+</div>
              <div className="text-[#f3e0ae]  text-sm mt-1">Happy Users</div>
            </div>
          </div>

          <div className="perspective-1000 animate-float-slow" style={{ animationDuration: '8s' }}>
            <div className="flex gap-3" style={{ transform: 'rotateX(55deg) rotateZ(-35deg) translateZ(0)' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className={`w-12 h-12 rounded border  transition-all hover:scale-110 ${
                      (i + j) % 3 === 0 ? 'bg-primary-500/30/20 border-primary-300/40/30' :
                      (i + j) % 3 === 1 ? 'bg-gray-300/30/20 border-[#e7c588]/25/40/30' :
                      'bg-[#0a0a0b]/10  border-[#e7c588]/25 '
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
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0b]/10  border border-[#e7c588]/25 rounded-full text-sm text-[#f9f0d7] ">
                <f.icon className="text-[#f3e0ae]  text-xs" /> {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[length:40px_40px] lg:hidden" />
        <div className="w-full max-w-md relative">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-8 lg:hidden">
            <FaParking className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 " />
            SpotIQ
          </div>

          <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b]   border border-[#e7c588]/25 dark:border-[#e7c588]/25  rounded-3xl p-8 shadow-xl /5 transition-colors duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">Sign In</h2>
              <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mt-2">Access your SpotIQ account</p>
            </div>
            <LoginForm />
          </div>

          <p className="text-center text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-6">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-[#e7c588]/60 /60 hover:text-primary-400 ">Terms</Link>
            {' '}&{' '}
            <Link to="/privacy" className="text-[#e7c588]/60 /60 hover:text-primary-400 ">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
