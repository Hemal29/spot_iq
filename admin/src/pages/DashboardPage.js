import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import adminService from '../services/adminService';
import {
  FaDollarSign, FaCalendarCheck, FaUsers, FaParking, FaThLarge, FaLock, FaStar, FaSun,
} from 'react-icons/fa';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function AnimatedValue({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    let start = 0;
    const duration = 800;
    const step = Math.max(1, Math.floor(num / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setDisplay(num);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, duration / 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{typeof value === 'number' ? display.toLocaleString() : display}{suffix}</span>;
}

const gradColors = {
  blue: 'linear-gradient(135deg, #2563eb, #60a5fa)',
  green: 'linear-gradient(135deg, #059669, #34d399)',
  purple: 'linear-gradient(135deg, #9333ea, #c084fc)',
  orange: 'linear-gradient(135deg, #ea580c, #fb923c)',
  teal: 'linear-gradient(135deg, #0d9488, #2dd4bf)',
  red: 'linear-gradient(135deg, #dc2626, #f87171)',
  yellow: 'linear-gradient(135deg, #ca8a04, #facc15)',
  pink: 'linear-gradient(135deg, #db2777, #f472b6)',
};

const statCards = [
  { title: 'Total Revenue', key: 'totalRevenue', icon: FaDollarSign, color: 'blue', prefix: '\u20B9' },
  { title: 'Total Bookings', key: 'totalBookings', icon: FaCalendarCheck, color: 'green', prefix: '' },
  { title: 'Active Users', key: 'activeUsers', icon: FaUsers, color: 'purple', prefix: '' },
  { title: 'Total Parkings', key: 'totalParkings', icon: FaParking, color: 'orange', prefix: '' },
  { title: 'Available Slots', key: 'availableSlots', icon: FaThLarge, color: 'teal', prefix: '' },
  { title: 'Occupied Slots', key: 'occupiedSlots', icon: FaLock, color: 'red', prefix: '' },
  { title: 'Pending Reviews', key: 'pendingReviews', icon: FaStar, color: 'yellow', prefix: '' },
  { title: 'New Today', key: 'newToday', icon: FaSun, color: 'pink', prefix: '' },
];

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-7 bg-gray-200 rounded w-16" />
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminService.getDashboardStats();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton />;

  const stats = data?.stats || data || {};
  const revenueData = data?.revenueData || [];
  const bookingTrendData = data?.bookingTrendData || [];
  const topParkings = data?.topParkings || data?.popularLocations || [];
  const recentBookings = data?.recentBookings || [];

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const statValues = {
    totalRevenue: formatCurrency(stats.totalRevenue || stats.total_revenue || 0),
    totalBookings: stats.totalBookings || stats.total_bookings || 0,
    activeUsers: stats.activeUsers || stats.active_users || stats.totalUsers || 0,
    totalParkings: stats.totalParkings || stats.parkingLocations || stats.total_parkings || 0,
    availableSlots: stats.availableSlots || stats.available_slots || 0,
    occupiedSlots: stats.occupiedSlots || stats.occupied_slots || 0,
    pendingReviews: stats.pendingReviews || stats.pending_reviews || 0,
    newToday: stats.newToday || stats.new_today || 0,
  };

  const bookingColumns = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'customerName', label: 'User', render: (_, row) => row.customerName || row.customer?.name || '-' },
    { key: 'parkingName', label: 'Parking', render: (_, row) => row.parkingName || row.parking?.name || '-' },
    { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          v === 'active' ? 'bg-green-100 text-green-700' :
          v === 'completed' ? 'bg-blue-100 text-blue-700' :
          v === 'cancelled' ? 'bg-red-100 text-red-700' :
          v === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>{v}</span>
      ),
    },
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of your parking business" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="relative overflow-hidden rounded-2xl shadow-md p-5 text-white"
              style={{ background: gradColors[card.color] }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-6 translate-y-6 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  <Icon className="text-xl text-white/60" />
                </div>
                <p className="text-2xl font-bold">
                  <AnimatedValue value={statValues[card.key]} prefix={card.prefix} />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  formatter={(v) => [formatCurrency(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Trends (30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h3>
          {recentBookings.length > 0 ? (
            <DataTable columns={bookingColumns} data={recentBookings.slice(0, 10)} pagination={false} />
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No recent bookings</p>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Parkings by Revenue</h3>
          {topParkings.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topParkings} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={90} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    formatter={(v) => [formatCurrency(v), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/parkings/add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            + Add Parking
          </Link>
          <Link
            to="/bookings"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            View Bookings
          </Link>
          <Link
            to="/users"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}
