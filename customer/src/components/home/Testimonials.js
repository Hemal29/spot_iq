import React, { useState } from 'react';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Rahul Patel',
    role: 'Daily Commuter, SG Highway',
    quote: 'SpotIQ ne mera roz ka parking ka tension khatam kar diya! Ab main office 20 minute pehle pahunchta hoon. Real-time availability bohot helpful hai.',
    rating: 5,
    highlight: 'Saved 20 mins daily',
  },
  {
    name: 'Priya Shah',
    role: 'Business Owner, CG Road',
    quote: 'CG Road pe parking milna mushkil tha. SpotIQ se pehle se book karke aati hoon. QR code se entry bhi fast ho gayi. Highly recommended!',
    rating: 5,
    highlight: 'Stress-free parking',
  },
  {
    name: 'Amit Desai',
    role: 'EV Owner, Navrangpura',
    quote: 'EV charging spots dikhate hain SpotIQ mein. Kankaria Lake ke paas charging ke saath parking mil gayi. Exact location bhi bata deta hai.',
    rating: 4,
    highlight: 'EV spots available',
  },
  {
    name: 'Sneha Mehta',
    role: 'Student, IIM Ahmedabad',
    quote: 'Weekend mein AlphaOne Mall jaana hota hai toh pehle hi book kar leti hoon. Fare bhi reasonable hai. Student ke liye perfect!',
    rating: 5,
    highlight: 'Student friendly',
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* 3D background decoration */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-800/10 dark:to-purple-800/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-pink-200/20 dark:from-orange-800/10 dark:to-pink-800/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
            <FaQuoteLeft /> Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Ahmedabad Says
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Hear from thousands of satisfied drivers across the city.
          </p>
        </div>

        {/* Desktop: 2x2 grid */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {testimonials.map((item, index) => (
            <TestimonialCard key={index} {...item} index={index} />
          ))}
        </div>

        {/* Tablet: scrollable */}
        <div className="hidden md:flex lg:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
          {testimonials.map((item, index) => (
            <div key={index} className="snap-center shrink-0 w-[400px]">
              <TestimonialCard {...item} index={index} />
            </div>
          ))}
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden">
          <div className="perspective-1000">
            <div className="card-3d">
              <TestimonialCard {...testimonials[current]} index={current} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all card-3d"
            >
              <FaChevronLeft />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'bg-blue-600 scale-125 shadow-md shadow-blue-500/30'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all card-3d"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ name, role, quote, rating, highlight, index }) => (
  <div
    className="group perspective-1000 animate-tilt-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-500 h-full relative overflow-hidden">
      <FaQuoteLeft className="text-blue-100 dark:text-blue-900/40 text-5xl absolute top-4 left-4" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-4">
          &ldquo;{quote}&rdquo;
        </p>

        {highlight && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400">
            <FaStar className="text-[10px]" /> {highlight}
          </div>
        )}
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
    </div>
  </div>
);

export default Testimonials;
