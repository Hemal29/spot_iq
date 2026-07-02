import React from 'react';
import { FaClock, FaShieldAlt, FaChargingStation, FaHeadset, FaCalendarCheck, FaMapMarkerAlt } from 'react-icons/fa';

const features = [
  {
    icon: FaClock,
    title: 'Real-Time Availability',
    description: 'Live updates on parking spot availability across Ahmedabad so you never waste time searching.',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure Payments',
    description: 'Pay seamlessly with Razorpay. Your data is always protected with bank-grade encryption.',
    gradient: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20',
  },
  {
    icon: FaChargingStation,
    title: 'EV Charging Spots',
    description: 'Find parking with EV charging stations at SG Highway, AlphaOne, and more Ahmedabad hotspots.',
    gradient: 'from-green-500 to-emerald-500',
    shadow: 'shadow-green-500/20',
  },
  {
    icon: FaHeadset,
    title: '24/7 Gujarati Support',
    description: 'Our support team speaks Gujarati, Hindi, and English. Available around the clock.',
    gradient: 'from-orange-500 to-red-500',
    shadow: 'shadow-orange-500/20',
  },
  {
    icon: FaCalendarCheck,
    title: 'Pre-Book Anywhere',
    description: 'Book your spot from Sabarmati Riverfront to SG Highway with just a few taps.',
    gradient: 'from-indigo-500 to-blue-500',
    shadow: 'shadow-indigo-500/20',
  },
  {
    icon: FaMapMarkerAlt,
    title: '200+ Ahmedabad Locations',
    description: 'From Kankaria Lake to Science City — parking available at every corner of the city.',
    gradient: 'from-teal-500 to-cyan-500',
    shadow: 'shadow-teal-500/20',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/30 to-purple-100/30 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
            <FaCalendarCheck /> Why SpotIQ?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for Ahmedabad
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
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
              <div className="card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-500 h-full">
                {/* 3D Icon container */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="text-xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
