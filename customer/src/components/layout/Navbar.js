import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FaParking, FaUser, FaCaretDown, FaSignOutAlt, FaBell, FaCar,
  FaCog, FaBars, FaTimes, FaSun, FaMoon, FaSearch, FaMapMarkerAlt,
  FaRupeeSign, FaQuestionCircle, FaHeadset, FaCalendarCheck, FaRobot, FaCommentDots,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useParking } from '../../context/ParkingContext';
import ChatBot from '../chatbot/ChatBot';

const cities = [
  { name: 'Ahmedabad', value: 'Ahmedabad' },
  { name: 'Surat', value: 'Surat' },
  { name: 'Vadodara', value: 'Vadodara' },
  { name: 'Rajkot', value: 'Rajkot' },
  { name: 'All Cities', value: '' },
];

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/find-parking', label: 'Find Parking' },
  { path: '/my-bookings', label: 'My Bookings' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, notifications } = useApp();
  const { filters, setFilters } = useParking();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cityRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-parking?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      closeMobile();
    }
  };

  const handleCityChange = (city) => {
    setFilters({ city: city.value });
    setCityOpen(false);
  };

  const selectedCity = cities.find((c) => c.value === filters.city) || cities[0];

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm dark:bg-gray-900 dark:border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400" onClick={closeMobile}>
            <FaParking className="text-2xl" />
            SpotIQ
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
            <a href="/#pricing" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <FaRupeeSign className="inline mr-1 text-xs" />Pricing
            </a>
            <a href="/#how-it-works" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <FaQuestionCircle className="inline mr-1 text-xs" />How It Works
            </a>
          </div>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-2">
            {/* 1. City Selector */}
            <div className="relative" ref={cityRef}>
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <FaMapMarkerAlt className="text-blue-500" />
                <span className="max-w-[100px] truncate">{selectedCity.name}</span>
                <FaCaretDown className={`text-xs transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
              </button>
              {cityOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fadeIn">
                  {cities.map((city) => (
                    <button
                      key={city.value}
                      onClick={() => handleCityChange(city)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        city.value === filters.city
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search parking..."
                    className="w-48 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
              )}
            </div>

            {/* 3. Notification bell with badge */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <FaBell />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* 4. Quick Book Now CTA */}
            {isAuthenticated && (
              <Link
                to="/find-parking"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm"
              >
                <FaCalendarCheck />
                Book Now
              </Link>
            )}

            {/* 5. Support */}
            <a
              href="mailto:support@spotiq.in"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Support"
            >
              <FaHeadset />
            </a>

            {/* 6. AI Chatbot */}
            <button
              onClick={() => setChatbotOpen(!chatbotOpen)}
              className={`p-2 rounded-lg transition-colors ${chatbotOpen ? 'text-orange-400 bg-orange-500/10' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-label="AI Chatbot"
            >
              {chatbotOpen ? <FaCommentDots className="text-orange-400" /> : <FaRobot />}
            </button>

            {/* 7. Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name || 'User'}</span>
                  <FaCaretDown className={`text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>
                      <FaUser className="text-gray-400" /> Profile
                    </Link>
                    <Link to="/my-vehicles" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>
                      <FaCar className="text-gray-400" /> My Vehicles
                    </Link>
                    <Link to="/notifications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>
                      <FaBell className="text-gray-400" /> Notifications
                    </Link>
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaSearch />
            </button>
            {/* Mobile notification */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaBell />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setChatbotOpen(!chatbotOpen)}
              className={`p-2 rounded-lg transition-colors ${chatbotOpen ? 'text-orange-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-label="AI Chatbot"
            >
              <FaRobot />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-2 pb-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parking by name or city..."
                className="w-full px-4 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeMobile}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600" onClick={closeMobile}>
            <FaParking className="text-2xl" />
            SpotIQ
          </Link>
          <button onClick={closeMobile} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="px-3 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={mobileNavLinkClass} onClick={closeMobile}>
              {link.label}
            </NavLink>
          ))}
          <a href="/#pricing" className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={closeMobile}>
            <FaRupeeSign className="text-gray-400" /> Pricing
          </a>
          <a href="/#how-it-works" className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={closeMobile}>
            <FaQuestionCircle className="text-gray-400" /> How It Works
          </a>

          <hr className="my-3 border-gray-200 dark:border-gray-700" />

          {/* Mobile city selector */}
          <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">City</p>
          {cities.map((city) => (
            <button
              key={city.value}
              onClick={() => { handleCityChange(city); closeMobile(); }}
              className={`w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                city.value === filters.city
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FaMapMarkerAlt className={city.value === filters.city ? 'text-blue-600' : 'text-gray-400'} />
              {city.name}
            </button>
          ))}

          {/* Mobile quick links */}
          {isAuthenticated && (
            <>
              <hr className="my-3 border-gray-200 dark:border-gray-700" />
              <Link
                to="/find-parking"
                className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                onClick={closeMobile}
              >
                <FaCalendarCheck /> Book Now
              </Link>
            </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-center gap-2 mb-3">
            <a href="mailto:support@spotiq.in" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
              <FaHeadset /> Support
            </a>
          </div>
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={closeMobile}>
                <FaCog className="text-gray-400" /> Profile
              </Link>
              <Link to="/my-vehicles" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={closeMobile}>
                <FaCar className="text-gray-400" /> My Vehicles
              </Link>
              <button
                onClick={() => { closeMobile(); logout(); }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="block w-full text-center px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50" onClick={closeMobile}>
                Login
              </Link>
              <Link to="/register" className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" onClick={closeMobile}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* AI Chatbot */}
      <ChatBot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </nav>
  );
};

export default Navbar;
