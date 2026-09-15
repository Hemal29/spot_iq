import React, { useState, useEffect, useRef } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaBars,
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
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900  border-b border-gray-200 dark:border-gray-700  shadow-smnone">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-500  hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800 "
          >
            <FaBars className="text-lg" />
          </button>
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-500  hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800 "
          >
            <FaBars className="text-lg" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800   transition-colors"
          >
            {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800  transition-colors"
            >
              <FaUserCircle className="text-2xl text-gray-400 dark:text-gray-500 " />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300  leading-tight">
                  {admin?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 ">Administrator</p>
              </div>
              <FaChevronDown className="text-xs text-gray-400 dark:text-gray-500  hidden md:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900  rounded-xl shadow-lg  border border-gray-200 dark:border-gray-700  py-2 animate-slideDown">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 ">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 ">{admin?.email || 'admin@spotiq.com'}</p>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 "
                >
                  <FaUserCog className="text-gray-400 dark:text-gray-500 " />
                  Profile Settings
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700/50 ">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50:bg-red-500/10"
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
