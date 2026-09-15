import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaDollarSign, FaCalendarCheck, FaUsers, FaParking, FaThLarge, FaLock, FaStar, FaSun,
  FaPlus, FaUserCog, FaBell, FaMapMarkerAlt, FaChevronRight, FaCreditCard,
  FaSyncAlt, FaDownload, FaRegCalendarCheck, FaRobot,
} from 'react-icons/fa';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function AnimatedValue({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
    if (num === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, Math.floor(Math.abs(num) / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= Math.abs(num)) { setDisplay(num); clearInterval(timer); }
      else { setDisplay(num < 0 ? -start : start); }
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>;
}

const gradCards = [
  { key: 'totalRevenue', title: 'Total Revenue', icon: FaDollarSign, gradient: 'bg-gray-700', prefix: '\u20B9' },
  { key: 'totalBookings', title: 'Total Bookings', icon: FaCalendarCheck, gradient: 'bg-primary-400', prefix: '' },
  { key: 'activeUsers', title: 'Active Users', icon: FaUsers, gradient: 'bg-primary-400', prefix: '' },
  { key: 'totalParkings', title: 'Parking Locations', icon: FaParking, gradient: 'bg-primary-400', prefix: '' },
  { key: 'availableSlots', title: 'Available Slots', icon: FaThLarge, gradient: 'bg-primary-400', prefix: '' },
  { key: 'occupiedSlots', title: 'Occupied Slots', icon: FaLock, gradient: 'bg-red-600', prefix: '' },
  { key: 'pendingReviews', title: 'Pending Reviews', icon: FaStar, gradient: 'bg-gray-500', prefix: '' },
  { key: 'todayBookings', title: "Today's Bookings", icon: FaSun, gradient: 'bg-primary-400', prefix: '' },
];

const quickActions = [
  { label: 'Add Parking', to: '/parking/add', icon: FaPlus, gradient: 'bg-primary-600' },
  { label: 'View Bookings', to: '/bookings', icon: FaRegCalendarCheck, gradient: 'bg-primary-400' },
  { label: 'Manage Users', to: '/users', icon: FaUserCog, gradient: 'from-purple-500 to-purple-600' },
  { label: 'Revenue', to: '/revenue', icon: FaDollarSign, gradient: 'bg-primary-600' },
  { label: 'AI Insights', to: '/ai-insights', icon: FaRobot, gradient: 'from-pink-500 to-pink-600' },
  { label: 'Reports', to: '/reports', icon: FaDownload, gradient: 'bg-primary-500' },
];

function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl p-5 bg-gray-200 dark:bg-gray-700  h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6"><div className="h-72 bg-gray-200 dark:bg-gray-700  rounded-xl" /></div>
        <div className="glass-card p-6"><div className="h-72 bg-gray-200 dark:bg-gray-700  rounded-xl" /></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await adminService.getDashboardStats();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setTimeout(() => setRefreshing(false), 500);
    toast.success('Dashboard refreshed');
  };

  if (loading) return <SkeletonLoader />;

  const d = data?.data || {};
  const revenue = d.revenue || {};
  const bookingsData = d.bookings || {};
  const usersData = d.users || {};
  const parkingsData = d.parkings || {};
  const slotsData = d.slots || {};

  const statValues = {
    totalRevenue: revenue.total || 0,
    totalBookings: bookingsData.total || 0,
    activeUsers: usersData.active || 0,
    totalParkings: parkingsData.total || 0,
    availableSlots: slotsData.available || 0,
    occupiedSlots: slotsData.occupied || 0,
    pendingReviews: 0,
    todayBookings: bookingsData.today || 0,
  };

  const weeklyTrends = (d.weeklyTrends || []).map((t) => ({
    date: t.date ? new Date(t.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) : '',
    count: Number(t.count || 0),
  }));

  const recentBookings = (d.recentBookings || []).map((b) => ({
    id: b.id,
    user: b.User?.name || 'N/A',
    parking: b.Parking?.parkingName || 'N/A',
    amount: b.totalAmount,
    status: b.bookingStatus,
    date: b.createdAt,
  }));

  const topParkings = (d.topParkings || []).map((p) => ({
    fullName: p.parkingName,
    city: p.city,
    revenue: Number(p.revenue || 0),
    bookings: Number(p.bookingCount || 0),
  }));

  const occupancyData = [
    { name: 'Available', value: slotsData.available || 0, fill: '#10b981' },
    { name: 'Occupied', value: slotsData.occupied || 0, fill: '#f43f5e' },
  ];

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 ">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const bookingColumns = [
    { key: 'user', label: 'Customer', render: (v) => <span className="font-medium text-gray-900 dark:text-gray-100 ">{v}</span> },
    { key: 'parking', label: 'Parking', render: (v) => <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 dark:text-gray-500 "><FaMapMarkerAlt className="text-[10px] text-gray-400" />{v}</span> },
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-semibold text-gray-900 dark:text-gray-100 ">{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => { const s = { active: 'bg-gray-100/10 text-gray-600', completed: 'bg-gray-100/10 text-gray-700 dark:text-gray-300 ', cancelled: 'bg-red-100/10 text-red-700', upcoming: 'bg-gray-100/10 text-gray-600' }; return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${s[v] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{v}</span>; } },
    { key: 'date', label: 'Date', render: (v) => <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500  text-sm">{v ? new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '-'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Complete business overview and analytics"
        action={
          <button onClick={handleRefresh} disabled={refreshing} className="btn-ghost text-xs">
            <FaSyncAlt className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {gradCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className={`relative overflow-hidden rounded-2xl shadow-lg p-5 text-white ${card.gradient}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-6 translate-y-6 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  <Icon className="text-xl text-white/60" />
                </div>
                <p className="text-2xl font-bold"><AnimatedValue value={statValues[card.key]} prefix={card.prefix} /></p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Revenue Overview</h3>
            <Link to="/revenue" className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 flex items-center gap-1">View Details <FaChevronRight className="text-xs" /></Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends.length > 0 ? weeklyTrends : [{ date: 'Mon', count: 0 }]}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Bookings" stroke="#0f766e" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-4">Slot Occupancy</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                  {occupancyData.map((entry, i) => <Cell key={i} fill={entry.fill} strokeWidth={0} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2">
            {occupancyData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.fill }} />
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 ">
              {slotsData.total > 0 ? Math.round(((slotsData.occupied || 0) / slotsData.total) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Occupancy Rate</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Booking Trends</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Last 7 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends.length > 0 ? weeklyTrends : [{ date: 'Mon', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.25}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-4">Top Parking Areas</h3>
          {topParkings.length > 0 ? (
            <div className="space-y-3">
              {topParkings.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800  transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100  truncate">{p.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{p.city} &middot; {p.bookings} bookings</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-400">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-8 text-center">No data available</p>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Recent Bookings</h3>
            <Link to="/bookings" className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 flex items-center gap-1">View All <FaChevronRight className="text-xs" /></Link>
          </div>
          {recentBookings.length > 0 ? (
            <DataTable columns={bookingColumns} data={recentBookings.slice(0, 8)} pagination={false} />
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-8 text-center">No recent bookings</p>
          )}
        </GlassCard>

        <GlassCard delay={0.35}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Recent Activity</h3>
            <Link to="/notifications" className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-600"><FaBell /></Link>
          </div>
          <div className="space-y-3">
            {recentBookings.slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 ">
                <div className="w-8 h-8 rounded-lg bg-gray-50/10 flex items-center justify-center shrink-0"><FaCalendarCheck className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 "><span className="font-medium">{b.user}</span> booked at <span className="font-medium">{b.parking}</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-0.5">{b.date ? new Date(b.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                </div>
                <span className="text-xs font-semibold text-primary-400">{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.4}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800  transition-all group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white text-lg" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ">{action.label}</span>
            </Link>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.45}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Recent Payments</h3>
            <Link to="/payments" className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 flex items-center gap-1">View All <FaChevronRight className="text-xs" /></Link>
          </div>
          <div className="space-y-3">
            {recentBookings.slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 ">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-50/10 flex items-center justify-center"><FaCreditCard className="text-primary-400 text-sm" /></div>
                  <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{b.user}</p><p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{b.parking}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-400">{formatCurrency(b.amount)}</p>
                  <span className={`text-xs ${b.status === 'completed' ? 'text-primary-400' : b.status === 'cancelled' ? 'text-red-500' : 'text-primary-400'}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-4">Top Customers</h3>
          <div className="space-y-3">
            {recentBookings.slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 ">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{b.user?.charAt(0) || 'U'}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-gray-100  truncate">{b.user}</p><p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">1 bookings</p></div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
