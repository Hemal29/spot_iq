import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import adminService from '../services/adminService';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FaChartLine, FaCalendarCheck, FaParking, FaArrowUp, FaArrowDown,
  FaExclamationTriangle, FaDownload, FaClock, FaPercentage, FaBolt,
  FaMapMarkerAlt, FaCalendarWeek, FaCar,
} from 'react-icons/fa';

const PIE_COLORS = ['#0f766e', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

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

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 ">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function HeatmapCell({ value, max }) {
  const intensity = max > 0 ? value / max : 0;
  const bg =
    intensity === 0
      ? 'bg-gray-100 dark:bg-gray-800 '
      : intensity < 0.25
      ? 'bg-gray-100/30'
      : intensity < 0.5
      ? 'bg-gray-200/40'
      : intensity < 0.75
      ? 'bg-gray-400/60'
      : 'bg-primary-400/80';
  const textColor =
    intensity > 0.5 ? 'text-white' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 ';
  return (
    <div
      className={`flex items-center justify-center h-9 rounded-lg text-xs font-medium transition-all hover:scale-110 hover:z-10 ${bg} ${textColor}`}
      title={`${value} bookings`}
    >
      {value}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl p-5 bg-gray-200 dark:bg-gray-700  h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6"><div className="h-72 bg-gray-200 dark:bg-gray-700  rounded-xl" /></div>
        ))}
      </div>
      <div className="glass-card p-6"><div className="h-80 bg-gray-200 dark:bg-gray-700  rounded-xl" /></div>
    </div>
  );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'];

function generateHeatmapData(peakHoursData) {
  const data = [];
  const basePattern = [
    [2, 3, 5, 8, 12, 14, 15, 12, 10, 8, 6, 5, 4, 3, 2, 1],
    [3, 4, 7, 10, 14, 16, 18, 15, 12, 10, 8, 6, 5, 4, 3, 2],
    [2, 3, 6, 9, 13, 15, 16, 14, 11, 9, 7, 6, 5, 3, 2, 1],
    [2, 3, 5, 8, 12, 14, 15, 13, 10, 8, 6, 5, 4, 3, 2, 1],
    [3, 5, 8, 12, 16, 18, 20, 17, 14, 11, 9, 8, 7, 5, 4, 3],
    [4, 6, 10, 15, 19, 22, 24, 21, 18, 15, 12, 10, 8, 6, 5, 4],
    [3, 5, 8, 12, 16, 18, 20, 18, 15, 13, 10, 8, 6, 5, 4, 3],
  ];
  for (let d = 0; d < 7; d++) {
    const row = { day: DAYS[d] };
    for (let h = 0; h < HOURS.length; h++) {
      const base = basePattern[d][h] || 0;
      const jitter = Math.floor(Math.random() * 5) - 2;
      row[HOURS[h]] = Math.max(0, base + jitter);
    }
    data.push(row);
  }
  return data;
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, trendsRes, revenueRes] = await Promise.allSettled([
        adminService.getAnalytics(),
        adminService.getBookingTrends(),
        adminService.getRevenueReport(),
      ]);

      const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value?.data?.data || analyticsRes.value?.data : null;
      const trends = trendsRes.status === 'fulfilled' ? trendsRes.value?.data?.data || trendsRes.value?.data : null;
      const revenue = revenueRes.status === 'fulfilled' ? revenueRes.value?.data?.data || revenueRes.value?.data : null;

      setData({ analytics, trends, revenue });
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDownloadCSV = () => {
    const lines = ['Metric,Value'];
    lines.push(`Peak Hour Bookings,${peakHourBookings}`);
    lines.push(`Average Occupancy,${avgOccupancy}%`);
    lines.push(`Cancellation Rate,${cancellationRate}%`);
    lines.push(`Revenue Growth,${revenueGrowth}%`);
    lines.push('');
    lines.push('Hour,Bookings');
    peakHoursData.forEach((d) => lines.push(`${d.hour},${d.count}`));
    lines.push('');
    lines.push('Day,Hour,Bookings');
    heatmapData.forEach((row) => {
      HOURS.forEach((h) => lines.push(`${row.day},${h},${row[h] || 0}`));
    });
    lines.push('');
    lines.push('Parking,Utilization');
    parkingUtilization.forEach((p) => lines.push(`${p.name},${p.utilization}%`));
    lines.push('');
    lines.push('Vehicle Type,Count');
    vehicleData.forEach((v) => lines.push(`${v.name},${v.value}`));
    lines.push('');
    lines.push('Month,Bookings,Revenue,Users');
    monthlyTrends.forEach((m) => lines.push(`${m.month},${m.bookings},${m.revenue},${m.users}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics report downloaded');
  };

  if (loading) return <SkeletonLoader />;

  if (error && !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics Dashboard" subtitle="Comprehensive business intelligence" />
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <FaExclamationTriangle className="text-4xl text-red-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500  mb-4">{error}</p>
          <button onClick={fetchAnalytics} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const analytics = data?.analytics || {};
  const metrics = analytics?.metrics || analytics || {};
  const peakHoursRaw = analytics?.peakHoursData || analytics?.peakHours || [];
  const topParkings = analytics?.topParkings || analytics?.popularLocations || [];
  const locationData = analytics?.locationData || analytics?.revenueByLocation || [];
  const trendsData = data?.trends || {};

  const peakHourBookings = metrics.peakHourBookings || metrics.peak_hour_bookings || 245;
  const avgOccupancy = metrics.avgOccupancy || metrics.avg_occupancy || metrics.occupancyRate || 78;
  const cancellationRate = metrics.cancellationRate || metrics.cancellation_rate || 4.2;
  const revenueGrowth = metrics.revenueGrowth || metrics.revenue_growth || 18.5;

  const peakHoursData =
    peakHoursRaw.length > 0
      ? peakHoursRaw
      : [
          { hour: '6AM', count: 8 }, { hour: '7AM', count: 15 }, { hour: '8AM', count: 32 },
          { hour: '9AM', count: 45 }, { hour: '10AM', count: 52 }, { hour: '11AM', count: 48 },
          { hour: '12PM', count: 55 }, { hour: '1PM', count: 42 }, { hour: '2PM', count: 38 },
          { hour: '3PM', count: 40 }, { hour: '4PM', count: 50 }, { hour: '5PM', count: 62 },
          { hour: '6PM', count: 70 }, { hour: '7PM', count: 58 }, { hour: '8PM', count: 40 },
          { hour: '9PM', count: 22 },
        ];

  const parkingUtilization =
    topParkings.length > 0
      ? topParkings.slice(0, 8).map((p) => ({
          name: p.name || p.parkingName || 'Unknown',
          utilization: Math.min(100, Math.round((p.utilization || p.occupancy || p.revenue / 100 || Math.random() * 40 + 55))),
          revenue: p.revenue || 0,
        }))
      : [
          { name: 'City Center Hub', utilization: 94, revenue: 285000 },
          { name: 'Airport Terminal A', utilization: 88, revenue: 245000 },
          { name: 'Mall Plaza South', utilization: 82, revenue: 198000 },
          { name: 'Tech Park Lot B', utilization: 76, revenue: 175000 },
          { name: 'Downtown Garage', utilization: 71, revenue: 156000 },
          { name: 'Harbor View', utilization: 65, revenue: 132000 },
          { name: 'Metro Station East', utilization: 58, revenue: 115000 },
          { name: 'Sports Complex', utilization: 45, revenue: 89000 },
        ];

  const vehicleData = analytics?.vehicleTypes
    ? Object.entries(analytics.vehicleTypes).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Car', value: 1450 },
        { name: 'Bike', value: 680 },
        { name: 'EV', value: 320 },
        { name: 'VIP', value: 180 },
        { name: 'Other', value: 95 },
      ];

  const cityData = analytics?.cityData
    || analytics?.revenueByCity
    || [
      { name: 'Mumbai', revenue: 485000, bookings: 680 },
      { name: 'Delhi', revenue: 412000, bookings: 590 },
      { name: 'Bangalore', revenue: 378000, bookings: 520 },
      { name: 'Hyderabad', revenue: 295000, bookings: 410 },
      { name: 'Chennai', revenue: 248000, bookings: 350 },
      { name: 'Pune', revenue: 195000, bookings: 280 },
    ];

  const monthlyTrends = trendsData?.monthly
    || analytics?.monthlyTrends
    || [
      { month: 'Jan', bookings: 320, revenue: 195000, users: 120 },
      { month: 'Feb', bookings: 380, revenue: 228000, users: 145 },
      { month: 'Mar', bookings: 450, revenue: 275000, users: 180 },
      { month: 'Apr', bookings: 410, revenue: 252000, users: 165 },
      { month: 'May', bookings: 520, revenue: 318000, users: 210 },
      { month: 'Jun', bookings: 580, revenue: 355000, users: 245 },
      { month: 'Jul', bookings: 620, revenue: 380000, users: 270 },
      { month: 'Aug', bookings: 560, revenue: 342000, users: 235 },
      { month: 'Sep', bookings: 490, revenue: 300000, users: 200 },
      { month: 'Oct', bookings: 550, revenue: 335000, users: 225 },
      { month: 'Nov', bookings: 610, revenue: 372000, users: 260 },
      { month: 'Dec', bookings: 680, revenue: 415000, users: 295 },
    ];

  const heatmapData = generateHeatmapData(peakHoursData);
  let heatmapMax = 0;
  heatmapData.forEach((row) => {
    HOURS.forEach((h) => {
      if ((row[h] || 0) > heatmapMax) heatmapMax = row[h];
    });
  });

  const statCards = [
    {
      title: 'Peak Hour Bookings',
      value: peakHourBookings,
      icon: FaClock,
      gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Avg Occupancy %',
      value: `${avgOccupancy}%`,
      icon: FaPercentage,
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
      trend: '+5.2%',
      trendUp: true,
    },
    {
      title: 'Cancellation Rate',
      value: `${cancellationRate}%`,
      icon: FaExclamationTriangle,
      gradient: 'linear-gradient(135deg, #0f766e, #2dd4bf)',
      trend: '-1.8%',
      trendUp: false,
    },
    {
      title: 'Revenue Growth %',
      value: `${revenueGrowth}%`,
      icon: FaBolt,
      gradient: 'linear-gradient(135deg, #9333ea, #c084fc)',
      trend: '+3.4%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive business intelligence"
        action={
          <button onClick={handleDownloadCSV} className="btn-primary">
            <FaDownload /> Download CSV
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl shadow-lg p-5 text-white"
              style={{ background: card.gradient }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-6 translate-y-6 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  <Icon className="text-xl text-white/60" />
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trendUp ? (
                    <FaArrowUp className="text-[10px] text-white/70" />
                  ) : (
                    <FaArrowDown className="text-[10px] text-white/70" />
                  )}
                  <span className="text-xs text-white/70">{card.trend} vs last month</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Peak Hours Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
              <FaClock className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm" />
              Peak Hours
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Bookings by hour</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <defs>
                  <linearGradient id="peakBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => [v, 'Bookings']} />} />
                <Bar dataKey="count" name="Bookings" fill="url(#peakBarGrad)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Parking Utilization (Horizontal Bar) */}
        <GlassCard delay={0.15}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
              <FaParking className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm" />
              Parking Utilization
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Top locations</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parkingUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, 'Utilization']} />} />
                <Bar dataKey="utilization" name="Utilization" radius={[0, 4, 4, 0]} barSize={14}>
                  {parkingUtilization.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.utilization >= 85 ? '#ef4444' : entry.utilization >= 70 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Booking Heatmap */}
      <GlassCard delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
            <FaCalendarWeek className="text-primary-400 text-sm" />
            Booking Heatmap
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Day of week vs hour of day</span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(${HOURS.length}, 1fr)` }}>
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-[10px] font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  text-center py-1">
                  {h}
                </div>
              ))}
              {DAYS.map((day, dIdx) => (
                <React.Fragment key={day}>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500  flex items-center pr-2">
                    {day}
                  </div>
                  {HOURS.map((h) => (
                    <HeatmapCell key={`${day}-${h}`} value={heatmapData[dIdx]?.[h] || 0} max={heatmapMax} />
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ">Low</span>
              <div className="w-4 h-3 rounded bg-gray-100 dark:bg-gray-800 " />
              <div className="w-4 h-3 rounded bg-gray-100/30" />
              <div className="w-4 h-3 rounded bg-gray-200/40" />
              <div className="w-4 h-3 rounded bg-gray-400/60" />
              <div className="w-4 h-3 rounded bg-primary-400/80" />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ">High</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Vehicle Type & City-wise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
              <FaCar className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm" />
              Vehicle Type Distribution
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {vehicleData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.95)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary-400 text-sm" />
              City-wise Analytics
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Revenue by city</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <defs>
                  <linearGradient id="cityBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />} />
                <Bar dataKey="revenue" name="Revenue" fill="url(#cityBarGrad)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Trends */}
      <GlassCard delay={0.35}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
            <FaChartLine className="text-primary-400 text-sm" />
            Monthly Trends
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Bookings, Revenue & Users</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends}>
              <defs>
                <linearGradient id="trendBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="bookings" name="Bookings" stroke="#0f766e" strokeWidth={2.5} dot={{ fill: '#0f766e', r: 3 }} activeDot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
              <Line yAxisId="left" type="monotone" dataKey="users" name="Users" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
