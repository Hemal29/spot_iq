import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import {
  FaChartPie, FaParking, FaThLarge, FaCalendarCheck, FaUsers,
  FaCreditCard, FaStar, FaChartLine, FaCog, FaSignOutAlt,
  FaTimes, FaUserTie, FaMoneyBillWave, FaTag, FaBell,
  FaHeadset, FaFileAlt, FaUserCircle, FaChevronLeft,
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
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-bold text-lg whitespace-nowrap tracking-tight">SpotIQ</span>
          )}
        </div>
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
        >
          <FaTimes />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!isCollapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => isMobileOpen && toggleMobile()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`
                  }
                >
                  <item.icon className="text-base flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/5">
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center w-full mb-2 px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <FaChevronLeft className={`text-xs transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="text-base flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 bg-[#0F172A] border-r border-white/5 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobile} />
          <aside className="relative w-64 h-full bg-[#0F172A] animate-slideInLeft">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
