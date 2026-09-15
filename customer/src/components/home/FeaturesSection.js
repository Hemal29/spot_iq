import React from 'react';
import { FaClock, FaShieldAlt, FaChargingStation, FaHeadset, FaCalendarCheck, FaMapMarkerAlt } from 'react-icons/fa';

const features = [
  {
    icon: FaClock,
    title: 'Real-Time Availability',
    description: 'Live updates on parking spot availability across Ahmedabad so you never waste time searching.',
    gradient: 'bg-primary-400',
    shadow: 'shadow-primary-400/20',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure Payments',
    description: 'Pay seamlessly with Razorpay. Your data is always protected with bank-grade encryption.',
    gradient: 'from-[#0a0a0b] to-[#e7c588]',
    shadow: 'shadow-primary-400/20',
  },
  {
    icon: FaChargingStation,
    title: 'EV Charging Spots',
    description: 'Find parking with EV charging stations at SG Highway, AlphaOne, and more Ahmedabad hotspots.',
    gradient: 'from-[#0a0a0b] to-[#e7c588]',
    shadow: 'shadow-primary-400/20',
  },
  {
    icon: FaHeadset,
    title: '24/7 Gujarati Support',
    description: 'Our support team speaks Gujarati, Hindi, and English. Available around the clock.',
    gradient: 'bg-primary-500',
    shadow: 'shadow-primary-400/20',
  },
  {
    icon: FaCalendarCheck,
    title: 'Pre-Book Anywhere',
    description: 'Book your spot from Sabarmati Riverfront to SG Highway with just a few taps.',
    gradient: 'from-primary-500 to-primary-400',
    shadow: 'shadow-primary-400/20',
  },
  {
    icon: FaMapMarkerAlt,
    title: '200+ Ahmedabad Locations',
    description: 'From Kankaria Lake to Science City — parking available at every corner of the city.',
    gradient: 'from-[#121214] to-[#3d2f14]',
    shadow: 'shadow-primary-400/20',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-[#0a0a0b] dark:bg-[#0a0a0b] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#e7c588]/10 to-[#e7c588]/30/10/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121214]/30 rounded-full text-primary-400 text-xs font-semibold mb-4">
            <FaCalendarCheck /> Why SpotIQ?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-4">
            Built for Ahmedabad
          </h2>
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  text-lg">
            Smart parking features designed for the way Ahmedabad moves.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group perspective-1000 animate-tilt-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="card-3d bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl p-6 lg:p-8 border border-[#e7c588]/25 dark:border-[#e7c588]/25/50 shadow-sm hover:shadow-xl transition-all duration-500 h-full">
                {/* 3D Icon container */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="text-xl text-[#f9f0d7]" />
                </div>
                <h3 className="text-lg font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-2 group-hover:text-[#e7c588]/80hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  leading-relaxed">
                  {feature.description}
                </p>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-400/5 to-[#e7c588]/5 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
