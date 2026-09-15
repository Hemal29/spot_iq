import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaParking, FaStar, FaArrowRight, FaRupeeSign, FaSpinner } from 'react-icons/fa';
import parkingService from '../../services/parkingService';

const GRADIENTS = [
  'bg-primary-600',
  'from-[#0a0a0b] to-[#e7c588]',
  'from-[#0a0a0b] to-[#e7c588]',
  'bg-primary-500',
  'from-primary-400 to-[#121214]',
  'from-[#0a0a0b] to-[#e7c588]',
];

const ICONS = ['🏢', '🛍️', '🌊', '🌉', '🏬', '🏛️'];

const PopularLocations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await parkingService.getAllParking({ limit: 6, sort: 'rating' });
        const items = (res.data?.data || []).map((p, i) => ({
          area: p.area || p.city,
          address: p.address,
          spots: p.totalSlots,
          price: `₹${p.pricePerHour}/hr`,
          rating: parseFloat(p.rating) || 0,
          gradient: GRADIENTS[i % GRADIENTS.length],
          icon: ICONS[i % ICONS.length],
        }));
        setLocations(items);
      } catch (err) {
        console.error('Failed to fetch popular locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleLocationClick = (area) => {
    navigate(`/find-parking?city=${encodeURIComponent(area)}`);
  };

  return (
    <section className="py-16 lg:py-24 bg-[#0a0a0b] dark:bg-[#121214]  relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0a0a0b]0/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0a0a0b]0/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 lg:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121214]/30 rounded-full text-primary-400 text-xs font-semibold mb-4">
              <FaMapMarkerAlt /> Top Locations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">
              Popular Parking Spots in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r bg-[#121214]">
                Ahmedabad
              </span>
            </h2>
            <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  text-lg mt-2">
              Most booked parking locations across the city.
            </p>
          </div>
          <button
            onClick={() => navigate('/find-parking')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f3e0ae] dark:text-[#e7c588]/80 transition-colors"
          >
            View All <FaArrowRight />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <FaSpinner className="animate-spin text-3xl text-[#e7c588]/80" />
            </div>
          ) : locations.length === 0 ? (
            <div className="col-span-full text-center py-16 text-[#e7c588]/80">
              No popular locations available right now.
            </div>
          ) : locations.map((location, i) => (
            <div
              key={location.area}
              onClick={() => handleLocationClick(location.area)}
              className="group cursor-pointer perspective-1000 animate-tilt-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="card-3d bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#e7c588]/25 dark:border-[#e7c588]/25/50 transition-all duration-500">
                {/* 3D Image Area */}
                <div className={`relative h-44 bg-gradient-to-br ${location.gradient} overflow-hidden`}>
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 glass text-[#f9f0d7] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaRupeeSign /> {location.price}
                  </div>
                  {/* Rating badge */}
                  <div className="absolute top-3 left-3 glass text-[#f9f0d7] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaStar className="text-primary-300" /> {location.rating}
                  </div>
                  {/* 3D floating icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl animate-float-slow filter drop-shadow-2xl">{location.icon}</span>
                  </div>
                  {/* Bottom gradient fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  group-hover:text-[#e7c588]/80hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors">
                        {location.area}
                      </h3>
                      <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="text-xs text-[#e7c588]/80" />
                        {location.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#e7c588]/25">
                    <div className="flex items-center gap-1.5 text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">
                      <FaParking className="text-[#e7c588]/80 dark:text-[#e7c588]/80" />
                      <span>{location.spots} spots</span>
                    </div>
                    <button className="text-xs font-semibold text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 group-hover:translate-x-1 transition-transform">
                      Book Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={() => navigate('/find-parking')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 border border-[#e7c588]/25 dark:border-[#e7c588]/25 rounded-xl hover:bg-[#0a0a0b] dark:hover:bg-[#121214] dark:bg-[#121214] transition-colors"
          >
            View All Locations <FaArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
