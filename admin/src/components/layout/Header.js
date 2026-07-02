import React, { useState, useEffect, useRef } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaBars,
  FaSearch,
  FaBell,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaUserCog,
} from 'react-icons/fa';

const Header = () => {
  const { toggleCollapse, toggleMobile } = useSidebar();
  const { admin, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifCount = 3;

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-[#0B1120] border-b border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <FaBars className="text-lg" />
          </button>
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <FaBars className="text-lg" />
          </button>
          <div className="hidden sm:flex items-center ml-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
          >
            {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <FaBell className="text-lg" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0B1120] rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-white/10 py-2 animate-slideDown">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                </div>
                {[1, 2, 3].map((i) => (
                  <button
                    key={i}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">New booking #{i} received</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">2 min ago</p>
                  </button>
                ))}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <FaUserCircle className="text-2xl text-gray-400 dark:text-gray-500" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                  {admin?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Administrator</p>
              </div>
              <FaChevronDown className="text-xs text-gray-400 dark:text-gray-500 hidden md:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0B1120] rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-white/10 py-2 animate-slideDown">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{admin?.email || 'admin@spotiq.com'}</p>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <FaUserCog className="text-gray-400 dark:text-gray-500" />
                  Profile Settings
                </button>
                <div className="border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <FaSignOutAlt />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
