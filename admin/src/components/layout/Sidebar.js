import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import {
  FaChartPie, FaParking, FaThLarge, FaCalendarCheck, FaUsers,
  FaCreditCard, FaStar, FaChartLine, FaCog, FaSignOutAlt,
  FaTimes, FaUserTie, FaMoneyBillWave, FaTag, FaBell,
  FaHeadset, FaFileAlt, FaUserCircle, FaChevronLeft, FaLightbulb,
} from 'react-icons/fa';

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: FaChartPie, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/parking', icon: FaParking, label: 'Parking' },
      { to: '/slots', icon: FaThLarge, label: 'Slots' },
      { to: '/bookings', icon: FaCalendarCheck, label: 'Bookings' },
      { to: '/users', icon: FaUsers, label: 'Customers' },
      { to: '/owners', icon: FaUserTie, label: 'Owners' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/payments', icon: FaCreditCard, label: 'Payments' },
      { to: '/revenue', icon: FaMoneyBillWave, label: 'Revenue' },
      { to: '/coupons', icon: FaTag, label: 'Coupons' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/reviews', icon: FaStar, label: 'Reviews' },
      { to: '/analytics', icon: FaChartLine, label: 'Analytics' },
      { to: '/ai-insights', icon: FaLightbulb, label: 'AI Insights' },
      { to: '/notifications', icon: FaBell, label: 'Notifications' },
      { to: '/tickets', icon: FaHeadset, label: 'Tickets' },
      { to: '/reports', icon: FaFileAlt, label: 'Reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/profile', icon: FaUserCircle, label: 'Profile' },
      { to: '/settings', icon: FaCog, label: 'Settings' },
    ],
  },
];

function NavTooltip({ label, show, children }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      {show && hover && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap pointer-events-none">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
        </div>
      )}
    </div>
  );
}

const Sidebar = () => {
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-400/25 shrink-0">
            <span className="text-white font-bold text-base">S</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-bold text-lg tracking-tight truncate">SpotIQ</span>
          )}
        </div>
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavTooltip key={item.to} label={item.label} show={isCollapsed}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => isMobileOpen && toggleMobile()}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-400/15 to-primary-400/5 text-gray-400 dark:text-gray-500 shadow-sm shadow-primary-400/5'
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-200 hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-500 rounded-r-full shadow-sm shadow-primary-400/50" />
                        )}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-base shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'bg-gray-500/20 text-gray-400 dark:text-gray-500 shadow-sm shadow-primary-400/10'
                            : 'bg-white/5 text-gray-400 dark:text-gray-500 group-hover:bg-white/10 group-hover:text-gray-200'
                        }`}>
                          <item.icon className="text-sm" />
                        </div>
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </NavTooltip>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/5 shrink-0 space-y-1">
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-colors"
        >
          <FaChevronLeft className={`text-xs transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-base shrink-0 group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
            <FaSignOutAlt className="text-sm" />
          </div>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 bg-[#f9fafb] dark:bg-gray-900 border-r border-white/5 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60  animate-fadeIn"
            onClick={toggleMobile}
          />
          <aside className="absolute left-0 top-0 w-64 h-full bg-[#f9fafb] dark:bg-gray-900 shadow-2xl shadow-black/50 animate-slideInLeft">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
