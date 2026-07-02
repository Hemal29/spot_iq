import { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import adminService from '../services/adminService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FaDollarSign, FaCalendarCheck, FaParking, FaChartLine, FaDownload } from 'react-icons/fa';

const datePresets = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'custom', label: 'Custom' },
];

const PIE_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const chartTabs = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'growth', label: 'Growth' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeChart, setActiveChart] = useState('revenue');

  useEffect(() => {
    fetchAnalytics();
  }, [range, customStart, customEnd]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (range === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      } else {
        params.days = parseInt(range);
      }
      const res = await adminService.getAnalytics(params);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const revenue = data?.revenueData || [];
    const bookings = data?.bookingTrendData || [];
    const topParkings = data?.topParkings || [];
    const metrics = data?.metrics || {};

    const lines = ['Metric,Value'];
    if (metrics.totalRevenue) lines.push(`Total Revenue,${metrics.totalRevenue}`);
    if (metrics.totalBookings) lines.push(`Total Bookings,${metrics.totalBookings}`);
    if (metrics.occupancyRate) lines.push(`Occupancy Rate,${metrics.occupancyRate}%`);
    if (metrics.customerGrowth) lines.push(`Customer Growth,${metrics.customerGrowth}%`);
    if (metrics.avgBookingValue) lines.push(`Avg Booking Value,${metrics.avgBookingValue}`);
    lines.push('');
    lines.push('Date,Revenue');
    revenue.forEach((r) => lines.push(`${r.date},${r.revenue || 0}`));
    lines.push('');
    lines.push('Date,Bookings');
    bookings.forEach((b) => lines.push(`${b.date},${b.count || 0}`));
    lines.push('');
    lines.push('Parking,Revenue');
    topParkings.forEach((p) => lines.push(`${p.name},${p.revenue || 0}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner />;

  const metrics = data?.metrics || {};
  const revenueData = data?.revenueData || [];
  const bookingTrendData = data?.bookingTrendData || [];
  const peakHoursData = data?.peakHoursData || [];
  const growthData = data?.growthData || [];
  const topParkings = data?.topParkings || data?.popularLocations || [];
  const locationData = data?.locationData || data?.revenueByLocation || [];

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const statCardsData = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue || metrics.total_revenue || 0),
      icon: FaDollarSign,
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      title: 'Total Bookings',
      value: metrics.totalBookings || metrics.total_bookings || 0,
      icon: FaCalendarCheck,
      gradient: 'from-green-600 to-green-400',
    },
    {
      title: 'Occupancy Rate',
      value: (metrics.occupancyRate || metrics.occupancy_rate || 0) + '%',
      icon: FaParking,
      gradient: 'from-orange-600 to-orange-400',
    },
    {
      title: 'Customer Growth',
      value: (metrics.customerGrowth || metrics.customer_growth || 0) + '%',
      icon: FaChartLine,
      gradient: 'from-purple-600 to-purple-400',
    },
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revArea)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bookings':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookingTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'growth':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                formatter={(v) => [`${v}%`, 'Growth']}
              />
              <Line type="monotone" dataKey="growth" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Insights and performance metrics"
        action={
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 shadow-md"
          >
            <FaDownload />
            Download Report
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {datePresets.map((p) => (
          <button
            key={p.key}
            onClick={() => setRange(p.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
              range === p.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
        {range === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsData.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-blue-600 to-blue-400 p-5 text-white"
              style={{
                background: card.gradient === 'from-blue-600 to-blue-400'
                  ? 'linear-gradient(135deg, #2563eb, #60a5fa)'
                  : card.gradient === 'from-green-600 to-green-400'
                  ? 'linear-gradient(135deg, #059669, #34d399)'
                  : card.gradient === 'from-orange-600 to-orange-400'
                  ? 'linear-gradient(135deg, #ea580c, #fb923c)'
                  : 'linear-gradient(135deg, #9333ea, #c084fc)',
              }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 translate-x-6 -translate-y-6 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 w-20 h-20 -translate-x-5 translate-y-5 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  <Icon className="text-xl text-white/60" />
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-1 mb-4">
            {chartTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveChart(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  activeChart === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="h-80">
            {renderChart()}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Parkings</h3>
          <div className="h-80">
            {topParkings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topParkings} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={80} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    formatter={(v) => [formatCurrency(v), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peak Hours</h3>
          <div className="h-72">
            {peakHoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    formatter={(v) => [v, 'Bookings']}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">No peak hours data</p>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Location</h3>
          <div className="h-72 flex items-center justify-center">
            {locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {locationData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    formatter={(v) => [formatCurrency(v), 'Revenue']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center">No location data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
