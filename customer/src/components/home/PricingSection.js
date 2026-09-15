import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaStar, FaRupeeSign } from 'react-icons/fa';

const plans = [
  {
    name: 'Hourly',
    price: '₹20',
    period: '/hour',
    description: 'Perfect for quick stops near CG Road or Navrangpura.',
    features: [
      { included: true, text: 'Pay per hour usage' },
      { included: true, text: 'No commitment required' },
      { included: true, text: 'All Ahmedabad locations' },
      { included: false, text: 'Reserved slot guarantee' },
      { included: false, text: 'Priority support' },
    ],
    cta: 'Book Now',
    popular: false,
    gradient: 'bg-primary-400',
    shadow: 'shadow-primary-400/20',
  },
  {
    name: 'Daily',
    price: '₹120',
    period: '/day',
    description: 'Best for a full day at AlphaOne Mall or SG Highway offices.',
    features: [
      { included: true, text: 'Up to 12 hours parking' },
      { included: true, text: 'Covered parking available' },
      { included: true, text: 'All Ahmedabad locations' },
      { included: true, text: 'Reserved slot guarantee' },
      { included: false, text: 'Priority support' },
    ],
    cta: 'Book Daily',
    popular: true,
    gradient: 'bg-primary-600',
    shadow: 'shadow-primary-400/30',
  },
  {
    name: 'Monthly',
    price: '₹1,999',
    period: '/month',
    description: 'Ideal for regular commuters on CG Road and SG Highway.',
    features: [
      { included: true, text: 'Unlimited entries' },
      { included: true, text: 'Dedicated reserved spot' },
      { included: true, text: 'All Ahmedabad locations' },
      { included: true, text: 'Reserved slot guarantee' },
      { included: true, text: 'Priority support' },
    ],
    cta: 'Subscribe',
    popular: false,
    gradient: 'from-[#0a0a0b] to-[#e7c588]',
    shadow: 'shadow-primary-400/20',
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 lg:py-24 bg-[#0a0a0b] dark:bg-[#121214]  relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-400/5 to-primary-400/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121214]/30 rounded-full text-primary-400 text-xs font-semibold mb-4">
            <FaRupeeSign /> Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  text-lg">
            No hidden charges. What you see is what you pay across all Ahmedabad locations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`group perspective-1000 animate-tilt-in`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`card-3d relative rounded-2xl p-8 flex flex-col transition-all duration-500 ${
                plan.popular
                  ? 'bg-[#0a0a0b] dark:bg-[#0a0a0b] border-2 border-gray-400 shadow-xl shadow-primary-400/20 scale-105'
                  : 'bg-[#0a0a0b] dark:bg-[#0a0a0b] border border-[#e7c588]/25 dark:border-[#e7c588]/25 shadow-sm hover:shadow-xl'
              }`}>
                {/* Glow on popular */}
                {plan.popular && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary-400/5 to-transparent pointer-events-none" />
                )}

                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-[#f9f0d7] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary-400/30 flex items-center gap-1">
                    <FaStar className="text-primary-300" /> Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-5 shadow-lg ${plan.shadow} group-hover:scale-110 transition-transform duration-500`}>
                    <FaRupeeSign className="text-xl text-[#f9f0d7]" />
                  </div>

                  <h3 className={`text-lg font-semibold mb-1 ${plan.popular ? 'text-[#e7c588]/80' : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 '}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">{plan.price}</span>
                    <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">{plan.period}</span>
                  </div>
                  <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-6">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        {feat.included ? (
                          <FaCheckCircle className="text-primary-400 flex-shrink-0" />
                        ) : (
                          <FaTimesCircle className="text-[#e7c588]/80 flex-shrink-0" />
                        )}
                        <span className={!feat.included ? 'text-[#e7c588]/80 dark:text-[#e7c588]/80 ' : 'text-[#f3e0ae] dark:text-[#e7c588]/80 '}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/find-parking"
                    className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 card-3d ${
                      plan.popular
                        ? 'bg-primary-500 text-[#f9f0d7] hover:bg-primary-600 shadow-lg shadow-primary-400/30'
                        : 'bg-primary-500 text-[#f9f0d7] hover:bg-primary-600 shadow-lg shadow-primary-400/20'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
