import { useState, useEffect, useMemo } from 'react';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import {
  FaRupeeSign,
  FaChartLine,
  FaCalendarAlt,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

const periodTabs = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState([]);
  const [parkingRevenue, setParkingRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revenueRes, parkingRes] = await Promise.all([
        adminService.getRevenueReport({ period }),
        adminService.getRevenueByParking(),
      ]);
      setRevenueData(revenueRes.data || []);
      setParkingRevenue(parkingRes.data || []);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!revenueData.length) {
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        avgDailyRevenue: 0,
        growthRate: 0,
      };
    }

    const totalRevenue = revenueData.reduce(
      (sum, d) => sum + (d.amount || d.revenue || 0),
      0
    );

    const now = new Date();
    const monthlyData = revenueData.filter((d) => {
      const date = new Date(d.date || d.period);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
    const monthlyRevenue = monthlyData.reduce(
      (sum, d) => sum + (d.amount || d.revenue || 0),
      0
    );

    const daysWithData = revenueData.filter(
      (d) => (d.amount || d.revenue || 0) > 0
    ).length;
    const avgDailyRevenue =
      daysWithData > 0 ? totalRevenue / daysWithData : 0;

    const mid = Math.floor(revenueData.length / 2);
    const firstHalf = revenueData.slice(0, mid);
    const secondHalf = revenueData.slice(mid);
    const firstTotal = firstHalf.reduce(
      (sum, d) => sum + (d.amount || d.revenue || 0),
      0
    );
    const secondTotal = secondHalf.reduce(
      (sum, d) => sum + (d.amount || d.revenue || 0),
      0
    );
    const growthRate =
      firstTotal > 0
        ? ((secondTotal - firstTotal) / firstTotal) * 100
        : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      avgDailyRevenue,
      growthRate: Math.round(growthRate * 100) / 100,
    };
  }, [revenueData]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v || 0);

  const chartData = useMemo(() => {
    return revenueData.map((d) => ({
      ...d,
      displayDate: d.date
        ? new Date(d.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          })
        : d.period || '',
      revenue: d.amount || d.revenue || 0,
      bookings: d.bookings || d.count || 0,
    }));
  }, [revenueData]);

  const parkingChartData = useMemo(() => {
    return parkingRevenue.map((d) => ({
      name: d.name || d.parkingName || 'Unknown',
      revenue: d.amount || d.revenue || 0,
    }));
  }, [parkingRevenue]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1E293B] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-medium text-white">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const parkingTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1E293B] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-medium text-white">
          Revenue: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] p-6">
        <div className="flex items-center justify-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Revenue Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track and analyze revenue performance
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-white/10">
            {periodTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition ${
                  period === tab.key
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaRupeeSign className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Revenue
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  This Month
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChartLine className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg. Daily Revenue
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(stats.avgDailyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaPercentage className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Growth Rate
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.growthRate}%
                  </span>
                  {stats.growthRate !== 0 && (
                    <span
                      className={`flex items-center text-xs font-medium ${
                        stats.growthRate > 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {stats.growthRate > 0 ? (
                        <FaArrowUp className="mr-0.5" />
                      ) : (
                        <FaArrowDown className="mr-0.5" />
                      )}
                      {Math.abs(stats.growthRate).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Revenue Over Time
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#f97316"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#f97316"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#334155', strokeOpacity: 0.3 }}
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
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: '#f97316',
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-0.5 bg-orange-500 rounded" />
                Revenue
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-0.5 bg-blue-500 rounded" />
                Bookings
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Revenue by Parking
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={parkingChartData}
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    strokeOpacity={0.3}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#334155', strokeOpacity: 0.3 }}
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
                    width={90}
                  />
                  <Tooltip content={parkingTooltip} />
                  <Bar
                    dataKey="revenue"
                    fill="#f97316"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date / Period
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {chartData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-400 dark:text-gray-500"
                    >
                      <FaChartLine className="text-3xl mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">No revenue data available</p>
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
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {row.displayDate}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(row.revenue)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {row.bookings}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {growth !== 0 ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                growth > 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
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
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
