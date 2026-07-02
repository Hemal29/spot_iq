import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt, FaDownload, FaFileExcel, FaFilePdf,
  FaChartLine, FaMoneyBillWave, FaUsers, FaParking,
} from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import adminService from '../services/adminService';

const datePresets = [
  { key: '7d', label: 'Last 7 Days', days: 7 },
  { key: '30d', label: 'Last 30 Days', days: 30 },
  { key: '90d', label: 'Last 90 Days', days: 90 },
  { key: 'year', label: 'This Year', days: 365 },
  { key: 'custom', label: 'Custom', days: null },
];

const PIE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'];
const STATUS_BAR_COLORS = { completed: '#10b981', cancelled: '#ef4444', upcoming: '#3b82f6', active: '#f59e0b' };

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const formatNumber = (v) =>
  new Intl.NumberFormat('en-IN').format(v || 0);

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    fetchReports();
  }, [range, customStart, customEnd]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (range === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      } else {
        const preset = datePresets.find((p) => p.key === range);
        if (preset && preset.days) {
          params.days = preset.days;
        }
      }
      const res = await adminService.getReports(params);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (!data) return [];
    const metrics = data.metrics || data.summary || {};
    return [
      { label: 'Total Bookings', value: formatNumber(metrics.totalBookings || metrics.totalBookings || 0), icon: FaChartLine, color: 'from-blue-500 to-blue-600' },
      { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue || metrics.totalRevenue || 0), icon: FaMoneyBillWave, color: 'from-green-500 to-green-600' },
      { label: 'Active Customers', value: formatNumber(metrics.activeCustomers || metrics.activeCustomers || 0), icon: FaUsers, color: 'from-purple-500 to-purple-600' },
      { label: 'Total Parkings', value: formatNumber(metrics.totalParkings || metrics.totalParkings || 0), icon: FaParking, color: 'from-orange-500 to-orange-600' },
    ];
  }, [data]);

  const bookingTrend = data?.bookingTrend || data?.bookingsOverTime || [];
  const revenueBreakdown = data?.revenueBreakdown || data?.revenueByCategory || [];
  const bookingsByStatus = data?.bookingsByStatus || data?.statusDistribution || [];
  const detailRows = data?.details || data?.dailyData || [];
  const statusColorMap = { completed: 'text-green-600', cancelled: 'text-red-600', upcoming: 'text-blue-600', active: 'text-yellow-600' };

  const handleExportCSV = () => {
    if (detailRows.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = Object.keys(detailRows[0]).filter((k) => k !== '_id' && k !== 'id').join(',');
    const csv = [headers, ...detailRows.map((r) =>
      Object.entries(r).filter(([k]) => k !== '_id' && k !== 'id').map(([, v]) => `"${v ?? ''}"`).join(',')
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive analytics and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition"
          >
            <FaFileExcel className="text-green-600" />
            Export CSV
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition">
            <FaFilePdf className="text-red-500" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {datePresets.map((p) => (
          <button
            key={p.key}
            onClick={() => setRange(p.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              range === p.key
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
            }`}
          >
            {p.label}
          </button>
        ))}
        {range === 'custom' && (
          <div className="flex items-center gap-2 ml-1">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Bookings Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.95)',
                  }}
                  formatter={(v) => [v, 'Bookings']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={55}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueBreakdown.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(v) => [formatCurrency(v), 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Bookings by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bookingsByStatus.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={STATUS_BAR_COLORS[entry.name] || PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          {data?.metrics ? (
            <div className="space-y-4">
              {[
                { label: 'Avg Booking Value', value: formatCurrency(data.metrics.avgBookingValue || 0) },
                { label: 'Avg Duration', value: `${data.metrics.avgDuration || 0} hrs` },
                { label: 'Cancellation Rate', value: data.metrics.cancellationRate ? `${(data.metrics.cancellationRate * 100).toFixed(1)}%` : '-' },
                { label: 'Peak Day', value: data.metrics.peakDay || '-' },
                { label: 'Peak Hour', value: data.metrics.peakHour ? `${data.metrics.peakHour}:00` : '-' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{s.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No additional metrics available</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Detailed Report</h3>
        </div>
        {detailRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaChartLine className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No detailed data available for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bookings</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Customers</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row, idx) => {
                  const status = row.bookings > 0 ? (row.bookings > row.prevBookings ? 'up' : 'down') : 'neutral';
                  return (
                    <tr key={row._id || idx} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.bookings ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatCurrency(row.revenue || 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.newCustomers ?? row.new_customers ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          status === 'up' ? 'text-green-600' : status === 'down' ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === 'up' ? 'bg-green-500' : status === 'down' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          {status === 'up' ? 'Growing' : status === 'down' ? 'Declining' : 'Stable'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
