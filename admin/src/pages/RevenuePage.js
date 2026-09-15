import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  FaRupeeSign,
  FaChartLine,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaDownload,
  FaCar,
  FaParking,
  FaReceipt,
  FaBuilding,
} from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const periodTabs = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const CHART_COLORS = [
  '#0f766e', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#14b8a6', '#6366f1',
];

function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 " />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700  rounded w-1/2 mb-2" />
          <div className="h-7 bg-gray-200 dark:bg-gray-700  rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState([]);
  const [parkingRevenue, setParkingRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [revenueRes, parkingRes] = await Promise.all([
        adminService.getRevenueReport({ period }),
        adminService.getRevenueByParking(),
      ]);
      const revBody = revenueRes.data?.data || revenueRes.data || {};
      const revList = Array.isArray(revBody.breakdown) ? revBody.breakdown : Array.isArray(revBody) ? revBody : [];
      setRevenueData(revList);
      const rawParking = parkingRes.data?.data || parkingRes.data || [];
      setParkingRevenue(Array.isArray(rawParking) ? rawParking : []);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      setError('Failed to load revenue data');
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!revenueData.length) {
      return { totalRevenue: 0, monthlyRevenue: 0, avgPerBooking: 0, topParkingRevenue: 0 };
    }

    const totalRevenue = revenueData.reduce(
      (sum, d) => sum + Number(d.amount || d.totalRevenue || d.revenue || 0), 0
    );

    const totalBookings = revenueData.reduce(
      (sum, d) => sum + Number(d.bookings || d.count || 0), 0
    );
    const avgPerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const now = new Date();
    const monthlyData = revenueData.filter((d) => {
      const date = new Date(d.date || d.period);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
    const monthlyRevenue = monthlyData.reduce(
      (sum, d) => sum + Number(d.amount || d.totalRevenue || d.revenue || 0), 0
    );

    const topParkingRevenue = parkingRevenue.length > 0
      ? (Math.max(...parkingRevenue.map((d) => Number(d.amount || d.revenue || 0))) || 0)
      : 0;

    return { totalRevenue, monthlyRevenue, avgPerBooking, topParkingRevenue };
  }, [revenueData, parkingRevenue]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v || 0);

  const chartData = useMemo(() => {
    return revenueData.map((d, idx) => ({
      ...d,
      displayDate: d.date
        ? new Date(d.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          })
        : d.period || `Period ${idx + 1}`,
      revenue: Number(d.amount || d.totalRevenue || d.revenue || 0),
      bookings: Number(d.bookings || d.count || 0),
    }));
  }, [revenueData]);

  const parkingChartData = useMemo(() => {
    return parkingRevenue.map((d, idx) => ({
      name: d.name || d.parkingName || 'Unknown',
      revenue: Number(d.amount || d.revenue || 0),
      fill: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [parkingRevenue]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#f3f4f6] border border-white/10 rounded-xl p-3 shadow-xl ">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-medium text-white">
            {entry.name === 'revenue' ? 'Revenue' : entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const parkingTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#f3f4f6] border border-white/10 rounded-xl p-3 shadow-xl ">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-medium text-white">
          Revenue: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  };

  const exportReport = () => {
    if (!chartData.length) {
      toast.warning('No data to export');
      return;
    }
    const headers = ['Period', 'Revenue', 'Bookings'];
    const rows = chartData.map((d) => [d.displayDate, d.revenue, d.bookings]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Revenue report exported successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Revenue Analytics" subtitle="Track and analyze revenue performance" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700  rounded w-1/3 mb-4" />
            <div className="h-80 bg-gray-200 dark:bg-gray-700  rounded-xl" />
          </div>
          <div className="glass-card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700  rounded w-1/2 mb-4" />
            <div className="h-80 bg-gray-200 dark:bg-gray-700  rounded-xl" />
          </div>
        </div>
        <div className="glass-card p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700  rounded w-1/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700  rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !revenueData.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Revenue Analytics" subtitle="Track and analyze revenue performance" />
        <div className="glass-card flex flex-col items-center justify-center min-h-[400px] text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-100/20 flex items-center justify-center mb-4">
              <FaExclamationTriangle className="text-2xl text-red-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500  mb-4">{error}</p>
            <button onClick={fetchData} className="btn-primary">
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Revenue Analytics"
          subtitle="Track and analyze revenue performance across all parking locations"
          action={
            <div className="flex items-center gap-3">
              <button onClick={exportReport} className="btn-primary">
                <FaDownload className="text-sm" />
                Export Report
              </button>
              <div className="flex items-center gap-1 glass-card !rounded-xl p-1">
                {periodTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPeriod(tab.key)}
                    className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      period === tab.key
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-500  hover:text-gray-700 dark:text-gray-300  hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800 '
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: FaRupeeSign,
            gradient: 'bg-gray-700',
            subtext: 'All time',
          },
          {
            label: 'Monthly Revenue',
            value: formatCurrency(stats.monthlyRevenue),
            icon: FaCalendarAlt,
            gradient: 'bg-primary-400',
            subtext: 'Current month',
          },
          {
            label: 'Avg per Booking',
            value: formatCurrency(stats.avgPerBooking),
            icon: FaReceipt,
            gradient: 'bg-primary-400',
            subtext: 'Across all bookings',
          },
          {
            label: 'Top Parking Revenue',
            value: formatCurrency(stats.topParkingRevenue),
            icon: FaParking,
            gradient: 'bg-primary-400',
            subtext: 'Highest earning',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card p-5 overflow-hidden relative group"
          >
            <div className={`absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity ${stat.gradient}`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">{stat.label}</p>
                <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 ">{stat.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500  mt-1">{stat.subtext}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Revenue Breakdown</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-0.5">
                Revenue by {period} period
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
              <span className="w-3 h-3 rounded-sm bg-primary-500" />
              Revenue
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  strokeOpacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155', strokeOpacity: 0.2 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15, 118, 110, 0.05)' }} />
                <Bar
                  dataKey="revenue"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Parking Chart */}
        <div className="glass-card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Revenue by Parking</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-0.5">
              Top earning locations
            </p>
          </div>
          <div className="h-80">
            {parkingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={parkingChartData}
                  layout="vertical"
                  margin={{ left: 5, right: 15, top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    strokeOpacity={0.2}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#334155', strokeOpacity: 0.2 }}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={parkingTooltip} cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {parkingChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 ">
                <FaBuilding className="text-3xl mb-2 text-gray-300" />
                <p className="text-sm">No parking data available</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Revenue Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700  flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Revenue Details</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-0.5">
              Detailed breakdown by period
            </p>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">
            {chartData.length} period{chartData.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700  bg-gray-50/50[0.02]">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">
                  Period
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">
                  Revenue
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">
                  Transactions
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chartData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 "
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800  flex items-center justify-center mb-3">
                        <FaChartLine className="text-2xl text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">No revenue data available</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500  mt-1">Data will appear once bookings are made</p>
                    </div>
                  </td>
                </tr>
              ) : (
                chartData.map((row, idx) => {
                  const prevRevenue =
                    idx > 0 ? chartData[idx - 1].revenue : row.revenue;
                  const growth =
                    prevRevenue > 0
                      ? ((row.revenue - prevRevenue) / prevRevenue) * 100
                      : 0;

                  return (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100/20 flex items-center justify-center">
                            <FaCalendarAlt className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                            {row.displayDate}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ">
                          {formatCurrency(row.revenue)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 ">
                          <FaCar className="text-xs text-gray-400" />
                          {row.bookings}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {idx > 0 && growth !== 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              growth > 0
                                ? 'bg-gray-100/20 text-primary-400'
                                : 'bg-red-100/20 text-red-600'
                            }`}
                          >
                            {growth > 0 ? (
                              <FaArrowUp className="text-[10px]" />
                            ) : (
                              <FaArrowDown className="text-[10px]" />
                            )}
                            {Math.abs(growth).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ">-</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
            {chartData.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700  bg-gray-50/50[0.02]">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ">Total</span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ">
                      {formatCurrency(chartData.reduce((sum, d) => sum + Number(d.revenue), 0))}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ">
                      {chartData.reduce((sum, d) => sum + Number(d.bookings), 0)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {chartData.length > 1 ? (
                      (() => {
                        const first = chartData[0].revenue;
                        const last = chartData[chartData.length - 1].revenue;
                        const totalGrowth = first > 0 ? ((last - first) / first) * 100 : 0;
                        return (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            totalGrowth >= 0
                              ? 'bg-gray-100/20 text-primary-400'
                              : 'bg-red-100/20 text-red-600'
                          }`}>
                            {totalGrowth >= 0 ? (
                              <FaArrowUp className="text-[10px]" />
                            ) : (
                              <FaArrowDown className="text-[10px]" />
                            )}
                            {Math.abs(totalGrowth).toFixed(1)}%
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
