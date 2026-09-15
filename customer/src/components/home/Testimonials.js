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
    <section className="py-16 lg:py-24 bg-[#0a0a0b] dark:bg-[#0a0a0b] relative overflow-hidden">
      {/* 3D background decoration */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#e7c588]/10 to-[#e7c588]/20/10/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#e7c588]/10 to-[#e7c588]/20/10/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121214]/30 rounded-full text-primary-400 text-xs font-semibold mb-4">
            <FaQuoteLeft /> Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-4">
            What Ahmedabad Says
          </h2>
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  text-lg">
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
              className="p-3 rounded-full bg-[#121214] dark:bg-[#121214] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-all card-3d"
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
                      ? 'bg-primary-400 scale-125 shadow-md shadow-primary-400/30'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-3 rounded-full bg-[#121214] dark:bg-[#121214] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-all card-3d"
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
    <div className="card-3d bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl p-6 lg:p-8 border border-[#e7c588]/25 dark:border-[#e7c588]/25/50 shadow-sm hover:shadow-xl transition-all duration-500 h-full relative overflow-hidden">
      <FaQuoteLeft className="text-[#f9f0d7]/40 text-5xl absolute top-4 left-4" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br bg-primary-600 flex items-center justify-center text-[#f9f0d7] font-bold text-lg shadow-md">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  text-sm">{name}</p>
            <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">{role}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`text-sm ${i < rating ? 'text-primary-400' : 'text-[#f3e0ae]'}`}
            />
          ))}
        </div>

        <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  leading-relaxed italic mb-4">
          &ldquo;{quote}&rdquo;
        </p>

        {highlight && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a0a0b]/20 rounded-full text-xs font-medium text-primary-400">
            <FaStar className="text-[10px]" /> {highlight}
          </div>
        )}
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-400/5 to-[#e7c588]/5 pointer-events-none" />
    </div>
  </div>
);

export default Testimonials;
