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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0a0a0b]/20/10 border border-[#e7c588]/25/20 rounded-full text-[#f9f0d7]  text-sm font-medium mb-6 animate-tilt-in">
            <FaParking /> Smart Parking — Ahmedabad
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#f9f0d7] leading-tight mb-4 animate-tilt-in">
            Join{' '}
            <span className="bg-gradient-to-r from-[#e7c588] to-[#f3e0ae] bg-clip-text text-transparent">
              SpotIQ
            </span>
            {' '}Today
          </h1>

          <p className="text-lg text-[#f9f0d7]  mb-8 animate-slideUp">
            Stress-free parking starts here. Sign up and enjoy seamless reservations across Ahmedabad.
          </p>

          <div className="space-y-3 mb-10 animate-slideUp" style={{ animationDelay: '0.15s' }}>
            {perks.map((text, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-[#0a0a0b]/30br flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <FaCheckCircle className="text-[#f9f0d7] text-sm" />
                </div>
                <span className="text-[#f9f0d7]/90  group-hover:text-[#f9f0d7] transition-colors">{text}</span>
              </div>
            ))}
          </div>

          <div className="perspective-1000 animate-float-slow" style={{ animationDuration: '8s' }}>
            <div className="grid grid-cols-6 gap-2" style={{ transform: 'rotateX(55deg) rotateZ(-35deg) translateZ(0)' }}>
              {[...Array(18)].map((_, i) => (
                <div key={i} className={`aspect-square rounded border  transition-all hover:scale-110 ${
                  i % 4 === 0 ? 'bg-primary-500/30/20 border-primary-300/40/30' :
                  i % 4 === 1 ? 'bg-[#0a0a0b]/30/20 border-[#e7c588]/25/30' :
                  i % 4 === 2 ? 'bg-gray-300/30/20 border-[#e7c588]/25/40/30' :
                  'bg-[#0a0a0b]/10  border-[#e7c588]/25 '
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
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0b]/20  border border-[#e7c588]/25  rounded-full text-sm text-[#f9f0d7]/90 ">
                <f.icon className="text-[#f9f0d7]/80  text-xs" /> {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Register Card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[length:40px_40px] lg:hidden" />
        <div className="w-full max-w-md relative">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-8 lg:hidden">
            <FaParking className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 " />
            SpotIQ
          </div>

          <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b]   border border-[#e7c588]/25 dark:border-[#e7c588]/25  rounded-3xl p-8 shadow-xl /5 transition-colors duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">Create Account</h2>
              <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mt-2">Join the SpotIQ community</p>
            </div>
            <RegisterForm />
          </div>

          <p className="text-center text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-6">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-[#e7c588]/60 /60 hover:text-primary-400 ">Terms</Link>
            {' '}&{' '}
            <Link to="/privacy" className="text-[#e7c588]/60 /60 hover:text-primary-400 ">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
