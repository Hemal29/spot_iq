import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaParking, FaStar, FaArrowRight, FaRupeeSign } from 'react-icons/fa';

const locations = [
  {
    area: 'SG Highway',
    address: 'Near Shivranjani Cross Road',
    spots: 120,
    price: '20/hr',
    rating: 4.5,
    gradient: 'from-blue-500 to-blue-700',
    icon: '🏢',
  },
  {
    area: 'CG Road',
    address: 'Opposite Parimal Garden',
    spots: 85,
    price: '25/hr',
    rating: 4.3,
    gradient: 'from-purple-500 to-purple-700',
    icon: '🛍️',
  },
  {
    area: 'Kankaria Lake',
    address: 'Lake Front, Maninagar',
    spots: 200,
    price: '15/hr',
    rating: 4.7,
    gradient: 'from-green-500 to-green-700',
    icon: '🌊',
  },
  {
    area: 'Sabarmati Riverfront',
    address: 'Sector 1, Riverfront West',
    spots: 300,
    price: '10/hr',
    rating: 4.6,
    gradient: 'from-cyan-500 to-cyan-700',
    icon: '🌉',
  },
  {
    area: 'AlphaOne Mall',
    address: 'Vastrapur, Near IIM',
    spots: 500,
    price: '30/hr',
    rating: 4.4,
    gradient: 'from-orange-500 to-orange-700',
    icon: '🏬',
  },
  {
    area: 'Navrangpura',
    address: 'Near Gujarat University',
    spots: 75,
    price: '20/hr',
    rating: 4.2,
    gradient: 'from-red-500 to-red-700',
    icon: '🏛️',
  },
];

const PopularLocations = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleLocationClick = (area) => {
    navigate(`/find-parking?city=${encodeURIComponent(area)}`);
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 lg:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
              <FaMapMarkerAlt /> Top Locations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Popular Parking Spots in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
                Ahmedabad
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">
              Most booked parking locations across the city.
            </p>
          </div>
          <button
            onClick={() => navigate('/find-parking')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All <FaArrowRight />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, i) => (
            <div
              key={location.area}
              onClick={() => handleLocationClick(location.area)}
              className="group cursor-pointer perspective-1000 animate-tilt-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="card-3d bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-500">
                {/* 3D Image Area */}
                <div className={`relative h-44 bg-gradient-to-br ${location.gradient} overflow-hidden`}>
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 glass text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaRupeeSign /> {location.price}
                  </div>
                  {/* Rating badge */}
                  <div className="absolute top-3 left-3 glass text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaStar className="text-yellow-300" /> {location.rating}
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {location.area}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="text-xs text-orange-500" />
                        {location.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <FaParking className="text-blue-500" />
                      <span>{location.spots} spots</span>
                    </div>
                    <button className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
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
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
          >
            View All Locations <FaArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
