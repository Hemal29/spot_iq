import React from 'react';
import { FaSearch, FaCalendarCheck, FaCar, FaMobileAlt, FaQrcode, FaSmile } from 'react-icons/fa';

const steps = [
  {
    number: 1,
    icon: FaSearch,
    title: 'Find Your Spot',
    description: 'Search by landmark — CG Road, Kankaria Lake, or anywhere in Ahmedabad. See live availability with prices.',
    color: 'bg-primary-600',
    shadow: 'shadow-primary-400/30',
  },
  {
    number: 2,
    icon: FaCalendarCheck,
    title: 'Book Instantly',
    description: 'Pick your time slot and reserve in seconds. Get a QR code for contactless entry at the gate.',
    color: 'bg-primary-600',
    shadow: 'shadow-primary-400/30',
  },
  {
    number: 3,
    icon: FaQrcode,
    title: 'Scan & Park',
    description: 'Arrive at the parking lot, scan your QR code at the gate, and park. It\'s that simple.',
    color: 'bg-primary-400',
    shadow: 'shadow-primary-400/30',
  },
  {
    number: 4,
    icon: FaMobileAlt,
    title: 'Track & Extend',
    description: 'Get reminders before time runs out. Extend your booking remotely from the app — no rush.',
    color: 'from-[#0a0a0b] to-[#e7c588]',
    shadow: 'shadow-primary-400/30',
  },
  {
    number: 5,
    icon: FaCar,
    title: 'Drive Out',
    description: 'Exit smoothly. Payment is already done. Rate your experience and earn loyalty points.',
    color: 'bg-primary-500',
    shadow: 'shadow-primary-400/30',
  },
  {
    number: 6,
    icon: FaSmile,
    title: 'Save Every Time',
    description: 'The more you park, the more you save. Weekly passes, referral bonuses, and special offers.',
    color: 'from-[#0a0a0b] to-[#e7c588]',
    shadow: 'shadow-primary-400/30',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-[#0a0a0b] dark:bg-[#121214]  relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50/50 via-transparent to-transparent/20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121214]/30 rounded-full text-primary-400 text-xs font-semibold mb-4">
            <FaCalendarCheck /> How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-4">
            Park in 3... 2... 1...
          </h2>
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  text-lg">
            From search to save — six simple steps to hassle-free parking.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connector line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-200 to-[#e7c588]" />

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col lg:flex-row items-center gap-6 lg:gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content card */}
                <div className={`flex-1 w-full lg:w-1/2 ${index % 2 === 1 ? 'lg:text-right' : ''}`}>
                  <div className="group perspective-1000 animate-tilt-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`card-3d bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl p-6 border border-[#e7c588]/25 dark:border-[#e7c588]/25/50 shadow-sm hover:shadow-xl transition-all duration-500 ${
                      index % 2 === 1 ? 'lg:ml-auto' : ''
                    } max-w-lg`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg ${step.shadow} group-hover:scale-110 transition-transform duration-500`}>
                          <step.icon className="text-lg text-[#f9f0d7]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-1 group-hover:text-[#e7c588]/80hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center number (desktop) */}
                <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br bg-[#121214] text-[#f9f0d7] font-bold text-lg shadow-lg shadow-primary-400/30 z-10 flex-shrink-0 animate-float-slow">
                  {String(step.number).padStart(2, '0')}
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden lg:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
