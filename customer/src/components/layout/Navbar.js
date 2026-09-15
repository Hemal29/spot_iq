import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaSignOutAlt, FaBell, FaCar, FaCog, FaBars, FaTimes,
  FaSun, FaMoon, FaSearch, FaMapMarkerAlt, FaCalendarCheck, FaHeart,
  FaStar, FaWallet, FaQuestionCircle, FaArrowRight, FaMicrophone,
  FaMicrophoneSlash, FaChevronRight, FaHistory, FaExclamationTriangle,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useParking } from '../../context/ParkingContext';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/find-parking', label: 'Find Parking' },
  { path: '/my-bookings', label: 'My Bookings' },
  { path: '/recommendations', label: 'AI Insights' },
  { path: '/saved-parking', label: 'Saved Parking' },
  { path: '/find-parking?quick=ev', label: 'EV Charging' },
  { path: '/monthly-passes', label: 'Monthly Passes' },
  { path: '/wallet', label: 'Wallet' },
  { path: '/rewards', label: 'Rewards' },
  { path: '/support', label: 'Support' },
  { path: '/contact', label: 'Contact' },
];

const profileMenuItems = [
  { label: 'My Profile', path: '/profile', icon: FaUser },
  { label: 'My Vehicles', path: '/profile', icon: FaCar },
  { label: 'Wallet', path: '/my-bookings', icon: FaWallet },
  { label: 'Booking History', path: '/my-bookings', icon: FaHistory },
  { label: 'Rewards', path: '/my-bookings', icon: FaStar },
  { label: 'Settings', path: '/profile', icon: FaCog },
  { label: 'Help Center', path: '/contact', icon: FaQuestionCircle },
];

const cities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'];

const dummyNotifications = {
  today: [
    { id: 1, title: 'Booking Confirmed', desc: 'Your parking at MG Road is confirmed.', time: '2m ago', icon: FaCalendarCheck },
    { id: 2, title: 'Payment Received', desc: '\u20b9250 payment processed.', time: '1h ago', icon: FaWallet },
  ],
  yesterday: [
    { id: 3, title: 'Reward Earned', desc: 'You earned 50 points!', time: '1d ago', icon: FaStar },
  ],
  earlier: [
    { id: 4, title: 'Welcome to SpotIQ', desc: 'Complete your profile.', time: '3d ago', icon: FaUser },
  ],
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, notifications } = useApp();
  const { filters, setFilters } = useParking();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // idle | listening | processing | error
  const [voiceError, setVoiceError] = useState('');
  const [voiceTooltip, setVoiceTooltip] = useState('Click to search by voice');
  const recognitionRef = useRef(null);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const cityRef = useRef(null);
  const navScrollRef = useRef(null);

  const unreadCount = notifications?.length || 0;

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
    setCityOpen(false);
  }, [location.pathname]);

  // Voice search: check browser support
  const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;
  const isVoiceSupported = !!SpeechRecognition;

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  const startVoiceSearch = useCallback(() => {
    if (!isVoiceSupported) {
      setVoiceStatus('error');
      setVoiceError('Voice search is not supported in this browser. Please use Chrome or Edge.');
      setVoiceTooltip('Unsupported browser');
      setTimeout(() => { setVoiceStatus('idle'); setVoiceError(''); setVoiceTooltip('Click to search by voice'); }, 4000);
      return;
    }

    // If already listening, stop
    if (isListening) {
      stopListening();
      setVoiceStatus('idle');
      setVoiceTooltip('Click to search by voice');
      return;
    }

    setVoiceError('');
    setVoiceStatus('processing');
    setVoiceTooltip('Requesting microphone access...');

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('listening');
      setVoiceTooltip('Listening... Speak now');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results in real-time
      if (interimTranscript) {
        setSearchQuery(interimTranscript);
        setVoiceTooltip('Listening... (adjusting...)');
      }

      // When final, set the query and search
      if (finalTranscript) {
        setSearchQuery(finalTranscript);
        setVoiceStatus('processing');
        setVoiceTooltip('Processing...');
        // Auto-search after short delay
        setTimeout(() => {
          navigate(`/find-parking?q=${encodeURIComponent(finalTranscript.trim())}`);
          setSearchQuery('');
          setIsListening(false);
          setVoiceStatus('idle');
          setVoiceTooltip('Click to search by voice');
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      let errorMsg = '';
      let tooltip = '';

      switch (event.error) {
        case 'no-speech':
          errorMsg = 'No speech detected. Please try again.';
          tooltip = 'No speech detected';
          break;
        case 'audio-capture':
          errorMsg = 'No microphone found. Please check your device.';
          tooltip = 'No microphone found';
          break;
        case 'not-allowed':
          errorMsg = 'Microphone permission denied. Please allow access in your browser settings.';
          tooltip = 'Permission denied';
          break;
        case 'network':
          errorMsg = 'Network error. Please check your connection.';
          tooltip = 'Network error';
          break;
        case 'aborted':
          errorMsg = '';
          tooltip = 'Click to search by voice';
          break;
        default:
          errorMsg = 'Voice recognition error. Please try again.';
          tooltip = 'Recognition error';
      }

      if (errorMsg) {
        setVoiceStatus('error');
        setVoiceError(errorMsg);
        setVoiceTooltip(tooltip);
        setTimeout(() => { setVoiceStatus('idle'); setVoiceError(''); setVoiceTooltip('Click to search by voice'); }, 4000);
      } else {
        setVoiceStatus('idle');
        setVoiceTooltip('Click to search by voice');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (voiceStatus === 'listening') {
        setVoiceStatus('idle');
        setVoiceTooltip('Click to search by voice');
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setVoiceStatus('error');
      setVoiceError('Could not start voice recognition. Please try again.');
      setVoiceTooltip('Start failed');
      setTimeout(() => { setVoiceStatus('idle'); setVoiceError(''); setVoiceTooltip('Click to search by voice'); }, 4000);
    }
  }, [isVoiceSupported, isListening, stopListening, navigate, voiceStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-parking?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.name) { const p = user.name.split(' '); return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase(); }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    return user?.name || 'User';
  };

  const isLinkActive = (link) => {
    const base = link.path.split('?')[0];
    if (base === '/') return location.pathname === '/';
    return location.pathname === base || location.pathname.startsWith(`${base}/`);
  };

  const activeLabel = navLinks.find((l) => isLinkActive(l))?.label;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#0a0a0b]/90 backdrop-blur-xl border-[#e7c588]/25 shadow-lg shadow-black/30'
            : 'bg-[#0a0a0b]/40 backdrop-blur-md border-[#e7c588]/25'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="w-11 h-11 rounded-xl bg-[#0a0a0b] flex items-center justify-center shadow-lg shadow-black/30 ring-1 ring-[#e7c588]/40 group-hover:ring-[#e7c588] group-hover:shadow-[#e7c588]/20 transition-all overflow-hidden"
              >
                <img src="/logoSpotIQ.png" alt="SpotIQ" className="w-9 h-9 object-contain" />
              </motion.div>
              <span className="text-xl font-extrabold hidden sm:block tracking-tight">
                <span className="text-[#f9f0d7] dark:text-[#f9f0d7] ">Spot</span>
                <span className="text-[#bf8a2e] dark:text-[#e7c588]">IQ</span>
              </span>
            </Link>

            {/* Nav Links — horizontal scrollable row */}
            <div
              ref={navScrollRef}
              className="hidden md:flex items-center gap-1 ml-4 flex-1 overflow-x-auto scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {navLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <NavLink
                    key={`${link.path}-${link.label}`}
                    to={link.path}
                    className={`relative shrink-0 px-3 py-2 text-[13px] font-medium transition-colors duration-200 whitespace-nowrap ${
                      active
                        ? 'text-[#e7c588]'
                        : 'text-[#f9f0d7]/60 hover:text-[#f9f0d7]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Search Bar — lg+ */}
            <div className="hidden lg:flex flex-1 max-w-sm mx-4">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative flex items-center w-full rounded-full bg-[#121214] dark:bg-[#121214]  border border-[#e7c588]/25 dark:border-[#e7c588]/25  focus-within:ring-2 focus-within:ring-primary-400/30 focus-within:border-primary-400/40 transition-all duration-200">
                  <FaSearch className="absolute left-4 text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search parking, city, landmark..."
                    className="w-full pl-11 pr-24 py-2.5 text-sm bg-transparent text-[#f9f0d7] dark:text-[#f9f0d7]  placeholder-gray-500 focus:outline-none rounded-full"
                  />
                  <div className="absolute right-3 flex items-center gap-1">
                    <button type="button" onClick={() => navigate('/find-parking')} className="p-1.5 rounded-full text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:bg-[#0a0a0b]:bg-[#0a0a0b]0/10 transition-colors" title="Use location">
                      <FaMapMarkerAlt className="text-xs" />
                    </button>
                    {/* Voice Search Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={startVoiceSearch}
                        disabled={!isVoiceSupported && voiceStatus !== 'error'}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          isListening
                            ? 'text-[#f9f0d7] bg-[#e7c588] shadow-lg shadow-[#e7c588]/20 animate-pulse'
                            : voiceStatus === 'error'
                              ? 'text-[#e7c588] bg-[#e7c588]/10'
                              : voiceStatus === 'processing'
                                ? 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#0a0a0b]/10'
                                : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:bg-[#0a0a0b]:bg-[#0a0a0b]0/10'
                        }`}
                        title={voiceTooltip}
                      >
                        {isListening ? (
                          <FaMicrophoneSlash className="text-xs" />
                        ) : voiceStatus === 'error' ? (
                          <FaExclamationTriangle className="text-xs" />
                        ) : voiceStatus === 'processing' ? (
                          <div className="w-2.5 h-2.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaMicrophone className="text-xs" />
                        )}
                      </button>
                      {/* Tooltip */}
                      <AnimatePresence>
                        {(voiceTooltip !== 'Click to search by voice' || isListening) && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-[#0a0a0b] text-[#f9f0d7] text-[11px] font-medium rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-lg"
                          >
                            {voiceTooltip}
                            <div className="absolute -top-1 right-3 w-2 h-2 bg-[#0a0a0b] rotate-45" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">

              {/* City Selector */}
              {isAuthenticated && (
                <div className="relative hidden lg:block" ref={cityRef}>
                  <button
                    onClick={() => setCityOpen(!cityOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  bg-[#121214] dark:bg-[#121214]  hover:bg-[#1c1c1f] dark:hover:bg-[#1c1c1f] dark:bg-[#1c1c1f]  transition-colors"
                  >
                    <FaMapMarkerAlt className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-xs" />
                    <span className="hidden xl:inline">{filters?.city || 'All Cities'}</span>
                    <FaChevronRight className={`text-[8px] transition-transform ${cityOpen ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {cityOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-[#0a0a0b] dark:bg-[#0a0a0b]  border border-[#e7c588]/25 dark:border-[#e7c588]/25  rounded-2xl shadow-2xl py-2 z-50"
                      >
                        <button
                          onClick={() => { setFilters({ city: '' }); setCityOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-xl mx-1 ${
                            !filters?.city ? 'text-primary-400 bg-[#0a0a0b]/10 font-medium' : 'text-[#f3e0ae] dark:text-[#e7c588]/80  hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] '
                          }`}
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          <FaMapMarkerAlt className={`text-xs ${!filters?.city ? 'text-[#e7c588]/80' : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 '}`} />
                          All Cities
                        </button>
                        {cities.map((city) => (
                          <button
                            key={city}
                            onClick={() => { setFilters({ city }); setCityOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-xl mx-1 ${
                              filters?.city === city
                                ? 'text-primary-400 bg-[#0a0a0b]/10 font-medium'
                                : 'text-[#f3e0ae] dark:text-[#e7c588]/80  hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] '
                            }`}
                            style={{ width: 'calc(100% - 8px)' }}
                          >
                            <FaMapMarkerAlt className={`text-xs ${filters?.city === city ? 'text-[#e7c588]/80' : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 '}`} />
                            {city}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="relative p-2.5 rounded-xl text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  bg-[#121214] dark:bg-[#121214]  hover:bg-[#1c1c1f] dark:hover:bg-[#1c1c1f] dark:bg-[#1c1c1f]  transition-colors"
                    aria-label="Notifications"
                  >
                    <FaBell className="text-sm" />
                    {unreadCount > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#e7c588] text-[#f9f0d7] text-[10px] font-bold rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-[#0a0a0b] dark:bg-[#0a0a0b]  border border-[#e7c588]/25 dark:border-[#e7c588]/25  rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7c588]/25 dark:border-[#e7c588]/25/50 ">
                          <h3 className="text-sm font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">Notifications</h3>
                          <button className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 font-medium transition-colors">Mark all read</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {Object.entries(dummyNotifications).map(([group, items]) => (
                            <div key={group}>
                              <div className="px-5 py-2 bg-[#0a0a0b] dark:bg-[#121214] ">
                                <p className="text-[10px] font-bold text-[#e7c588]/80 dark:text-[#e7c588]/80  uppercase tracking-wider">{group.charAt(0).toUpperCase() + group.slice(1)}</p>
                              </div>
                              {items.map((notif) => {
                                const Icon = notif.icon;
                                return (
                                  <div key={notif.id} className="flex items-start gap-3 px-5 py-3 hover:bg-[#0a0a0b] dark:hover:bg-[#121214] dark:bg-[#121214]  transition-colors cursor-pointer border-b border-gray-50  last:border-0">
                                    <div className="w-9 h-9 rounded-xl bg-[#0a0a0b]/10 flex items-center justify-center shrink-0 mt-0.5">
                                      <Icon className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-[#f9f0d7] dark:text-[#f9f0d7]  truncate">{notif.title}</p>
                                      <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  truncate mt-0.5">{notif.desc}</p>
                                    </div>
                                    <span className="text-[10px] text-[#e7c588]/80 dark:text-[#e7c588]/80  shrink-0 mt-1">{notif.time}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  bg-[#121214] dark:bg-[#121214]  hover:bg-[#1c1c1f] dark:hover:bg-[#1c1c1f] dark:bg-[#1c1c1f]  transition-colors overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div key="sun" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} transition={{ duration: 0.2 }}>
                      <FaSun className="text-primary-400 text-sm" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }} transition={{ duration: 0.2 }}>
                      <FaMoon className="text-sm" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Favorites */}
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/find-parking')}
                  className="hidden sm:flex p-2.5 rounded-xl text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  bg-[#121214] dark:bg-[#121214]  hover:bg-[#1c1c1f] dark:hover:bg-[#1c1c1f] dark:bg-[#1c1c1f]  hover:text-[#e7c588]  transition-colors"
                  aria-label="Favorites"
                >
                  <FaHeart className="text-sm" />
                </button>
              )}

              {/* Profile Avatar / Login */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary-400/30 transition-all"
                  >
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={getUserDisplayName()} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br bg-primary-500 flex items-center justify-center text-[#f9f0d7] text-xs font-bold shadow-md shadow-primary-400/20">
                        {getUserInitials()}
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-[#0a0a0b] dark:bg-[#0a0a0b]  border border-[#e7c588]/25 dark:border-[#e7c588]/25  rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-[#e7c588]/25 dark:border-[#e7c588]/25/50 ">
                          <div className="flex items-center gap-3">
                            {user?.profilePhoto ? (
                              <img src={user.profilePhoto} alt={getUserDisplayName()} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-primary-500 flex items-center justify-center text-[#f9f0d7] text-sm font-bold shadow-md shadow-primary-400/20">
                                {getUserInitials()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  truncate">{getUserDisplayName()}</p>
                              <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  truncate">{user?.email || ''}</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2 px-2">
                          {profileMenuItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <React.Fragment key={item.label}>
                                {idx === 3 && <div className="my-1.5 border-t border-[#e7c588]/25 dark:border-[#e7c588]/25/50 " />}
                                <Link
                                  to={item.path}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f3e0ae] dark:text-[#e7c588]/80  rounded-xl hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214]  transition-colors"
                                  onClick={() => setProfileOpen(false)}
                                >
                                  <Icon className="text-[#e7c588]/80 dark:text-[#e7c588]/80  text-sm" />
                                  <span>{item.label}</span>
                                </Link>
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="border-t border-[#e7c588]/25 dark:border-[#e7c588]/25/50  py-2 px-2">
                          <button
                            onClick={() => { setProfileOpen(false); logout(); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#e7c588] rounded-xl hover:bg-[#e7c588]:bg-[#e7c588]/10 w-full text-left transition-colors"
                          >
                            <FaSignOutAlt className="text-sm" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  hover:text-primary-400  transition-colors">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-semibold text-[#f9f0d7] bg-primary-500 hover:bg-primary-600 rounded-xl transition-all shadow-md shadow-primary-400/20">Sign Up</Link>
                </div>
              )}

              {/* Book Now */}
              {isAuthenticated && location.pathname !== '/find-parking' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/find-parking')}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#f9f0d7] bg-primary-500 rounded-xl shadow-lg shadow-primary-400/25 hover:shadow-xl hover:shadow-primary-400/30 transition-shadow ml-1"
                >
                  Book Now
                  <FaArrowRight className="text-xs" />
                </motion.button>
              )}

              {/* Mobile Hamburger — only below md */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2.5 rounded-xl text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  bg-[#121214] dark:bg-[#121214]  hover:bg-[#1c1c1f] dark:hover:bg-[#1c1c1f] dark:bg-[#1c1c1f]  transition-colors md:hidden"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Voice Search Error Toast */}
      <AnimatePresence>
        {voiceStatus === 'error' && voiceError && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[60] max-w-sm w-full mx-4 px-4 py-3 bg-[#e7c588]/20 border border-[#e7c588]/40 rounded-xl shadow-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#e7c588]/20 flex items-center justify-center shrink-0">
              <FaExclamationTriangle className="text-[#e7c588] text-sm" />
            </div>
            <p className="text-sm text-[#e7c588] font-medium">{voiceError}</p>
            <button
              onClick={() => { setVoiceStatus('idle'); setVoiceError(''); setVoiceTooltip('Click to search by voice'); }}
              className="ml-auto p-1 rounded-full hover:bg-[#e7c588]:bg-[#e7c588]/20 text-[#e7c588] transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer — below md only */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50  z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 bg-[#0a0a0b] dark:bg-[#0a0a0b]  shadow-2xl z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-20 border-b border-[#e7c588]/25 dark:border-[#e7c588]/25  shrink-0">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <div className="w-10 h-10 rounded-xl bg-[#0a0a0b] flex items-center justify-center shadow-lg ring-1 ring-[#e7c588]/40 overflow-hidden">
                    <img src="/logoSpotIQ.png" alt="SpotIQ" className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-xl font-extrabold">
                    <span className="text-[#f9f0d7] dark:text-[#f9f0d7] ">Spot</span>
                    <span className="text-[#bf8a2e] dark:text-[#e7c588]">IQ</span>
                  </span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2.5 rounded-xl text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  bg-[#121214] dark:bg-[#121214]  hover:bg-[#1c1c1f] dark:hover:bg-[#1c1c1f] dark:bg-[#1c1c1f]  transition-colors">
                  <FaTimes className="text-sm" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Search */}
                <div className="px-4 pt-5 pb-3">
                  <form onSubmit={handleSearch}>
                    <div className="relative flex items-center rounded-xl bg-[#121214] dark:bg-[#121214]  border border-[#e7c588]/25 dark:border-[#e7c588]/25 ">
                      <FaSearch className="absolute left-3.5 text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search parking spots..."
                        className="w-full pl-10 pr-12 py-3 text-sm bg-transparent text-[#f9f0d7] dark:text-[#f9f0d7]  placeholder-gray-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={startVoiceSearch}
                        className={`absolute right-2 p-1.5 rounded-full transition-all duration-200 ${
                          isListening
                            ? 'text-[#f9f0d7] bg-[#e7c588] shadow-lg shadow-[#e7c588]/20 animate-pulse'
                            : voiceStatus === 'error'
                              ? 'text-[#e7c588] bg-[#e7c588]/10'
                              : voiceStatus === 'processing'
                                ? 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#0a0a0b]/10'
                                : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:bg-[#0a0a0b]:bg-[#0a0a0b]0/10'
                        }`}
                      >
                        {isListening ? (
                          <FaMicrophoneSlash className="text-xs" />
                        ) : voiceStatus === 'error' ? (
                          <FaExclamationTriangle className="text-xs" />
                        ) : voiceStatus === 'processing' ? (
                          <div className="w-2.5 h-2.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaMicrophone className="text-xs" />
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* All nav links */}
                <div className="px-3 py-2">
                  <p className="px-3 py-2 text-[10px] font-bold text-[#e7c588]/80 dark:text-[#e7c588]/80  uppercase tracking-widest">Navigation</p>
                  <div className="space-y-0.5">
                    {navLinks.map((link, idx) => {
                      const active = isLinkActive(link);
                      return (
                        <motion.div key={`${link.path}-${link.label}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * idx }}>
                          <NavLink
                            to={link.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              active ? 'text-[#e7c588] bg-[#e7c588]/10' : 'text-[#f9f0d7]/70 hover:text-[#f9f0d7] hover:bg-white/5'
                            }`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span>{link.label}</span>
                            <FaChevronRight className="text-[10px] text-[#e7c588]/80" />
                          </NavLink>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Book Now */}
                {isAuthenticated && (
                  <div className="px-4 py-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { navigate('/find-parking'); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#f9f0d7] bg-primary-500 rounded-xl shadow-lg shadow-primary-400/25"
                    >
                      <FaCalendarCheck className="text-sm" />
                      Book Now
                    </motion.button>
                  </div>
                )}

                {/* Theme */}
                <div className="px-4 py-2">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214]  transition-colors"
                  >
                    {theme === 'dark' ? <FaSun className="text-primary-400 text-sm" /> : <FaMoon className="text-sm" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-[#e7c588]/25 dark:border-[#e7c588]/25  p-4 shrink-0">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={getUserDisplayName()} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-primary-500 flex items-center justify-center text-[#f9f0d7] text-sm font-bold shadow-md shadow-primary-400/20">
                          {getUserInitials()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  truncate">{user?.email || ''}</p>
                      </div>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f3e0ae] dark:text-[#e7c588]/80  rounded-xl hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214]  transition-colors" onClick={() => setMobileOpen(false)}>
                      <FaUser className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm" /> My Profile
                    </Link>
                    <button onClick={() => { setMobileOpen(false); logout(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#e7c588] rounded-xl hover:bg-[#e7c588]:bg-[#e7c588]/10 w-full text-left transition-colors">
                      <FaSignOutAlt className="text-sm" /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="block w-full text-center px-4 py-3 text-sm font-medium text-primary-400 border border-primary-400/30 rounded-xl hover:bg-[#0a0a0b]:bg-[#0a0a0b]0/10 transition-colors" onClick={() => setMobileOpen(false)}>Login</Link>
                    <Link to="/register" className="block w-full text-center px-4 py-3 text-sm font-semibold text-[#f9f0d7] bg-primary-500 rounded-xl shadow-lg shadow-primary-400/25" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
};

export default Navbar;
