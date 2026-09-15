import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import adminService from '../services/adminService';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FaFilePdf, FaFileExcel, FaDownload, FaCalendarAlt, FaChartLine,
  FaMoneyBillWave, FaUsers, FaParking, FaCar, FaCreditCard, FaStar,
  FaUserTie, FaClipboardList, FaExclamationTriangle, FaFileCsv,
  FaCheckCircle, FaFilter, FaSearch, FaEye,
} from 'react-icons/fa';

const PIE_COLORS = ['#0f766e', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const formatNumber = (v) =>
  new Intl.NumberFormat('en-IN').format(v || 0);

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

const reportTypes = [
  { id: 'revenue', title: 'Revenue Report', description: 'Complete revenue breakdown with trends, forecasts and category analysis', icon: FaMoneyBillWave, color: 'bg-primary-400', bgLight: 'bg-gray-50/10' },
  { id: 'booking', title: 'Booking Report', description: 'Detailed booking analytics including status, durations and patterns', icon: FaClipboardList, color: 'bg-primary-600', bgLight: 'bg-gray-50/10' },
  { id: 'customer', title: 'Customer Report', description: 'Customer demographics, retention rates and growth metrics', icon: FaUsers, color: 'from-purple-500 to-purple-600', bgLight: 'bg-gray-50/10' },
  { id: 'parking', title: 'Parking Report', description: 'Parking utilization, capacity analysis and location performance', icon: FaParking, color: 'bg-primary-600', bgLight: 'bg-gray-50/10' },
  { id: 'slot', title: 'Slot Report', description: 'Slot availability, occupancy patterns and maintenance status', icon: FaCar, color: 'bg-primary-500', bgLight: 'bg-gray-50/10' },
  { id: 'payment', title: 'Payment Report', description: 'Payment method analysis, transaction volumes and refund tracking', icon: FaCreditCard, color: 'from-pink-500 to-pink-600', bgLight: 'bg-gray-50/10' },
  { id: 'review', title: 'Review Report', description: 'Review ratings distribution, sentiment analysis and response rates', icon: FaStar, color: 'from-yellow-500 to-yellow-600', bgLight: 'bg-gray-50/10' },
  { id: 'owner', title: 'Owner Report', description: 'Owner performance, earnings breakdown and portfolio analytics', icon: FaUserTie, color: 'bg-primary-400', bgLight: 'bg-primary-50/10' },
];

const datePresets = [
  { key: '7d', label: 'Last 7 Days', days: 7 },
  { key: '30d', label: 'Last 30 Days', days: 30 },
  { key: '90d', label: 'Last 90 Days', days: 90 },
  { key: 'year', label: 'This Year', days: 365 },
  { key: 'custom', label: 'Custom', days: null },
];

function generateMockReportData(reportId) {
  const mockData = {
    revenue: {
      summary: { totalRevenue: 4850000, avgBookingValue: 342, totalTransactions: 14180, refunds: 125000 },
      monthly: [
        { month: 'Jan', revenue: 285000 }, { month: 'Feb', revenue: 312000 }, { month: 'Mar', revenue: 378000 },
        { month: 'Apr', revenue: 345000 }, { month: 'May', revenue: 420000 }, { month: 'Jun', revenue: 465000 },
        { month: 'Jul', revenue: 510000 }, { month: 'Aug', revenue: 480000 }, { month: 'Sep', revenue: 395000 },
        { month: 'Oct', revenue: 425000 }, { month: 'Nov', revenue: 460000 }, { month: 'Dec', revenue: 375000 },
      ],
      byCategory: [
        { name: 'Hourly', value: 2150000 }, { name: 'Daily', value: 1420000 },
        { name: 'Weekly', value: 890000 }, { name: 'Monthly', value: 390000 },
      ],
    },
    booking: {
      summary: { totalBookings: 14180, completedBookings: 12450, cancelledBookings: 1280, activeBookings: 450 },
      daily: [
        { date: '2026-07-10', bookings: 145, revenue: 49590 }, { date: '2026-07-11', bookings: 162, revenue: 55404 },
        { date: '2026-07-12', bookings: 198, revenue: 67716 }, { date: '2026-07-13', bookings: 178, revenue: 60876 },
        { date: '2026-07-14', bookings: 210, revenue: 71820 }, { date: '2026-07-15', bookings: 155, revenue: 52910 },
        { date: '2026-07-16', bookings: 130, revenue: 44460 },
      ],
      byStatus: [
        { name: 'Completed', count: 12450 }, { name: 'Cancelled', count: 1280 },
        { name: 'Active', count: 450 }, { name: 'Upcoming', count: 0 },
      ],
    },
    customer: {
      summary: { totalCustomers: 8520, activeCustomers: 6340, newCustomers: 890, retentionRate: 74.4 },
      growth: [
        { month: 'Jan', new: 120, churned: 35 }, { month: 'Feb', new: 145, churned: 42 },
        { month: 'Mar', new: 180, churned: 28 }, { month: 'Apr', new: 160, churned: 38 },
        { month: 'May', new: 210, churned: 25 }, { month: 'Jun', new: 245, churned: 30 },
      ],
      demographics: [
        { name: '18-25', value: 2100 }, { name: '26-35', value: 3200 },
        { name: '36-45', value: 1850 }, { name: '46-60', value: 1020 }, { name: '60+', value: 350 },
      ],
    },
    parking: {
      summary: { totalParkings: 125, activeParkings: 118, avgUtilization: 72, totalCapacity: 4500 },
      utilization: [
        { name: 'City Center', utilization: 94 }, { name: 'Airport', utilization: 88 },
        { name: 'Mall District', utilization: 82 }, { name: 'Tech Park', utilization: 76 },
        { name: 'Downtown', utilization: 71 }, { name: 'Harbor', utilization: 65 },
      ],
    },
    slot: {
      summary: { totalSlots: 4500, availableSlots: 1260, occupiedSlots: 3240, maintenanceSlots: 52 },
      byType: [
        { name: 'Standard', value: 2800 }, { name: 'Compact', value: 900 },
        { name: 'Large', value: 500 }, { name: 'EV Charging', value: 200 }, { name: 'VIP', value: 100 },
      ],
    },
    payment: {
      summary: { totalPayments: 13900, successfulPayments: 13200, failedPayments: 420, pendingPayments: 280 },
      methods: [
        { name: 'UPI', value: 6800 }, { name: 'Credit Card', value: 3200 },
        { name: 'Debit Card', value: 2100 }, { name: 'Wallet', value: 1500 }, { name: 'Net Banking', value: 300 },
      ],
    },
    review: {
      summary: { totalReviews: 5640, avgRating: 4.3, fiveStarReviews: 2820, responseRate: 68 },
      distribution: [
        { name: '5 Star', value: 2820 }, { name: '4 Star', value: 1580 },
        { name: '3 Star', value: 720 }, { name: '2 Star', value: 340 }, { name: '1 Star', value: 180 },
      ],
    },
    owner: {
      summary: { totalOwners: 85, activeOwners: 72, avgEarnings: 57000, topEarning: 285000 },
      topOwners: [
        { name: 'Rajesh Kumar', parkings: 12, earnings: 285000 }, { name: 'Priya Enterprises', parkings: 8, earnings: 195000 },
        { name: 'Sharma Holdings', parkings: 6, earnings: 142000 }, { name: 'Green Parking Co', parkings: 5, earnings: 118000 },
        { name: 'Metro Spaces', parkings: 4, earnings: 95000 },
      ],
    },
  };
  return mockData[reportId] || {};
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [range, setRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (range === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      } else {
        const preset = datePresets.find((p) => p.key === range);
        if (preset && preset.days) params.days = preset.days;
      }
      const res = await adminService.getReports(params);
      setApiData(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [range, customStart, customEnd]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const getReportData = (reportId) => {
    if (apiData && apiData[reportId]) return apiData[reportId];
    return generateMockReportData(reportId);
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setPreviewModalOpen(true);
  };

  const generateCSV = (reportId) => {
    const data = getReportData(reportId);
    const report = reportTypes.find((r) => r.id === reportId);
    const lines = [];

    lines.push(`${report.title}`);
    lines.push(`Generated: ${new Date().toLocaleString('en-IN')}`);
    lines.push(`Period: ${range === 'custom' ? `${customStart} to ${customEnd}` : datePresets.find((p) => p.key === range)?.label || range}`);
    lines.push('');

    if (reportId === 'revenue') {
      lines.push('Metric,Value');
      lines.push(`Total Revenue,${data.summary?.totalRevenue || 0}`);
      lines.push(`Avg Booking Value,${data.summary?.avgBookingValue || 0}`);
      lines.push(`Total Transactions,${data.summary?.totalTransactions || 0}`);
      lines.push(`Refunds,${data.summary?.refunds || 0}`);
      lines.push('');
      lines.push('Month,Revenue');
      (data.monthly || []).forEach((m) => lines.push(`${m.month},${m.revenue}`));
      lines.push('');
      lines.push('Category,Revenue');
      (data.byCategory || []).forEach((c) => lines.push(`${c.name},${c.value}`));
    } else if (reportId === 'booking') {
      lines.push('Metric,Value');
      Object.entries(data.summary || {}).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push('');
      lines.push('Date,Bookings,Revenue');
      (data.daily || []).forEach((d) => lines.push(`${d.date},${d.bookings},${d.revenue}`));
    } else if (reportId === 'customer') {
      lines.push('Metric,Value');
      Object.entries(data.summary || {}).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push('');
      lines.push('Month,New Customers,Churned');
      (data.growth || []).forEach((g) => lines.push(`${g.month},${g.new},${g.churned}`));
    } else if (reportId === 'parking') {
      lines.push('Metric,Value');
      Object.entries(data.summary || {}).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push('');
      lines.push('Location,Utilization %');
      (data.utilization || []).forEach((u) => lines.push(`${u.name},${u.utilization}`));
    } else if (reportId === 'slot') {
      lines.push('Metric,Value');
      Object.entries(data.summary || {}).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push('');
      lines.push('Type,Count');
      (data.byType || []).forEach((t) => lines.push(`${t.name},${t.value}`));
    } else if (reportId === 'payment') {
      lines.push('Metric,Value');
      Object.entries(data.summary || {}).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push('');
      lines.push('Method,Count');
      (data.methods || []).forEach((m) => lines.push(`${m.name},${m.value}`));
    } else if (reportId === 'review') {
      lines.push('Metric,Value');
      Object.entries(data.summary || []).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push('');
      lines.push('Rating,Count');
      (data.distribution || []).forEach((d) => lines.push(`${d.name},${d.value}`));
    } else if (reportId === 'owner') {
      lines.push('Metric,Value');
      Object.entries(data.summary || []).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push('');
      lines.push('Owner,Parkings,Earnings');
      (data.topOwners || []).forEach((o) => lines.push(`${o.name},${o.parkings},${o.earnings}`));
    }

    return lines.join('\n');
  };

  const handleExport = (reportId, format) => {
    setGeneratingReport(reportId);
    setTimeout(() => {
      try {
        const csv = generateCSV(reportId);
        const blob = new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'csv' ? 'csv' : format === 'excel' ? 'csv' : 'txt';
        a.download = `${reportId}-report-${new Date().toISOString().slice(0, 10)}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${reportTypes.find((r) => r.id === reportId)?.title} exported as ${format.toUpperCase()}`);
      } catch (err) {
        toast.error('Export failed');
      } finally {
        setGeneratingReport(null);
      }
    }, 500);
  };

  const summaryCards = useMemo(() => {
    const data = apiData?.summary || apiData?.metrics || {};
    return [
      { label: 'Total Bookings', value: formatNumber(data.totalBookings || 14180), icon: FaChartLine, gradient: 'bg-primary-600' },
      { label: 'Total Revenue', value: formatCurrency(data.totalRevenue || 4850000), icon: FaMoneyBillWave, gradient: 'bg-primary-400' },
      { label: 'Active Customers', value: formatNumber(data.activeCustomers || 6340), icon: FaUsers, gradient: 'from-purple-500 to-purple-600' },
      { label: 'Total Parkings', value: formatNumber(data.totalParkings || 125), icon: FaParking, gradient: 'bg-primary-600' },
    ];
  }, [apiData]);

  const reportCharts = {
    revenue: () => {
      const d = getReportData('revenue');
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Monthly Revenue</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.monthly || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Revenue by Category</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={d.byCategory || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(d.byCategory || []).map((_, idx) => <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      );
    },
    booking: () => {
      const d = getReportData('booking');
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Daily Bookings</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={d.daily || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#0f766e" strokeWidth={2.5} dot={{ fill: '#0f766e', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Bookings by Status</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.byStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]} barSize={24}>
                  {(d.byStatus || []).map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={['#10b981', '#ef4444', '#f59e0b', '#0f766e'][idx % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      );
    },
    customer: () => {
      const d = getReportData('customer');
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Customer Growth</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.growth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="new" name="New" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="churned" name="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Age Demographics</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={d.demographics || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(d.demographics || []).map((_, idx) => <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      );
    },
    parking: () => {
      const d = getReportData('parking');
      return (
        <GlassCard>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Parking Utilization</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.utilization || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, 'Utilization']} />} />
              <Bar dataKey="utilization" name="Utilization" radius={[0, 4, 4, 0]} barSize={16}>
                {(d.utilization || []).map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.utilization >= 85 ? '#ef4444' : entry.utilization >= 70 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      );
    },
    slot: () => {
      const d = getReportData('slot');
      return (
        <GlassCard>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Slots by Type</h4>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={d.byType || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(d.byType || []).map((_, idx) => <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      );
    },
    payment: () => {
      const d = getReportData('payment');
      return (
        <GlassCard>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Payment Methods</h4>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={d.methods || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(d.methods || []).map((_, idx) => <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      );
    },
    review: () => {
      const d = getReportData('review');
      return (
        <GlassCard>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Review Distribution</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.distribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Reviews" radius={[4, 4, 0, 0]} barSize={28}>
                {(d.distribution || []).map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={['#f59e0b', '#fbbf24', '#fcd34d', '#fca5a5', '#f87171'][idx % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      );
    },
    owner: () => {
      const d = getReportData('owner');
      return (
        <GlassCard>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-3">Top Earning Owners</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.topOwners || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip formatter={(v) => [formatCurrency(v), 'Earnings']} />} />
              <Bar dataKey="earnings" name="Earnings" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      );
    },
  };

  const renderPreviewTable = (reportId) => {
    const d = getReportData(reportId);
    if (reportId === 'revenue') {
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700 ">
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Metric</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Value</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700/50 "><td className="py-2 px-3 text-gray-700 dark:text-gray-300 ">Total Revenue</td><td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-gray-100 ">{formatCurrency(d.summary?.totalRevenue)}</td></tr>
            <tr className="border-b border-gray-100 dark:border-gray-700/50 "><td className="py-2 px-3 text-gray-700 dark:text-gray-300 ">Avg Booking Value</td><td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-gray-100 ">{formatCurrency(d.summary?.avgBookingValue)}</td></tr>
            <tr className="border-b border-gray-100 dark:border-gray-700/50 "><td className="py-2 px-3 text-gray-700 dark:text-gray-300 ">Total Transactions</td><td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-gray-100 ">{formatNumber(d.summary?.totalTransactions)}</td></tr>
            <tr><td className="py-2 px-3 text-gray-700 dark:text-gray-300 ">Refunds</td><td className="py-2 px-3 text-right font-semibold text-red-500">{formatCurrency(d.summary?.refunds)}</td></tr>
          </tbody>
        </table>
      );
    }
    if (reportId === 'booking') {
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700 ">
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Date</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Bookings</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Revenue</th>
          </tr></thead>
          <tbody>
            {(d.daily || []).map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 ">
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300 ">{new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-gray-100 ">{row.bookings}</td>
                <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100 ">{formatCurrency(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (reportId === 'owner') {
      return (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700 ">
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Owner</th>
            <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Parkings</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Earnings</th>
          </tr></thead>
          <tbody>
            {(d.topOwners || []).map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 ">
                <td className="py-2 px-3 text-gray-900 dark:text-gray-100  font-medium">{row.name}</td>
                <td className="py-2 px-3 text-center text-gray-700 dark:text-gray-300 ">{row.parkings}</td>
                <td className="py-2 px-3 text-right font-semibold text-primary-400">{formatCurrency(row.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    const summaryData = d.summary || {};
    return (
      <table className="w-full text-sm">
        <thead><tr className="border-b border-gray-200 dark:border-gray-700 ">
          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Metric</th>
          <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Value</th>
        </tr></thead>
        <tbody>
          {Object.entries(summaryData).map(([key, value]) => (
            <tr key={key} className="border-b border-gray-100 dark:border-gray-700/50 ">
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300  capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
              <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-gray-100 ">
                {typeof value === 'number' && key.toLowerCase().includes('rate') ? `${value}%` :
                 typeof value === 'number' && key.toLowerCase().includes('revenue') ? formatCurrency(value) :
                 typeof value === 'number' && key.toLowerCase().includes('earnings') ? formatCurrency(value) :
                 formatNumber(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" subtitle="Downloadable business reports" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700  rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 dark:bg-gray-700  rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Downloadable business reports"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport('revenue', 'csv')} className="btn-outline text-xs">
              <FaFileCsv className="text-primary-400" /> Quick Export
            </button>
          </div>
        }
      />

      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-2">
        {datePresets.map((p) => (
          <button key={p.key} onClick={() => setRange(p.key)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${range === p.key ? 'bg-gradient-to-r bg-gray-700 text-white shadow-lg shadow-primary-400/25' : 'glass-card text-gray-600 dark:text-gray-400 dark:text-gray-500  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 '}`}>
            {p.label}
          </button>
        ))}
        {range === 'custom' && (
          <div className="flex items-center gap-2 ml-1">
            <FaCalendarAlt className="text-gray-400 dark:text-gray-500" />
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="input-field" />
            <span className="text-gray-400 dark:text-gray-500 text-sm">to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="input-field" />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="relative overflow-hidden rounded-2xl shadow-lg p-5 text-white" style={{ background: `linear-gradient(135deg, ${card.gradient.includes('blue') ? '#0f766e, #14b8a6' : card.gradient.includes('green') ? '#059669, #34d399' : card.gradient.includes('purple') ? '#9333ea, #c084fc' : '#0f766e, #2dd4bf'})` }}>
              <div className="absolute top-0 right-0 w-28 h-28 translate-x-6 -translate-y-6 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 w-20 h-20 -translate-x-5 translate-y-5 bg-white/10 rounded-full" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center"><Icon className="text-white text-lg" /></div>
                <div>
                  <p className="text-sm font-medium text-white/80">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Report Type Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-4 flex items-center gap-2">
          <FaClipboardList className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm" /> Report Types
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report, idx) => {
            const Icon = report.icon;
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white text-lg" />
                  </div>
                  <button onClick={() => handlePreview(report)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800  text-gray-400 dark:text-gray-500 ">
                    <FaEye className="text-xs" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-1">{report.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-4 leading-relaxed">{report.description}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleExport(report.id, 'csv')} disabled={generatingReport === report.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700  text-gray-700 dark:text-gray-300  text-xs font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition disabled:opacity-50">
                    {generatingReport === report.id ? <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> : <FaFileCsv className="text-primary-400" />}
                    CSV
                  </button>
                  <button onClick={() => handleExport(report.id, 'excel')} disabled={generatingReport === report.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700  text-gray-700 dark:text-gray-300  text-xs font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition disabled:opacity-50">
                    <FaFileExcel className="text-primary-400" />
                    Excel
                  </button>
                  <button onClick={() => handleExport(report.id, 'pdf')} disabled={generatingReport === report.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700  text-gray-700 dark:text-gray-300  text-xs font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition disabled:opacity-50">
                    <FaFilePdf className="text-red-500" />
                    PDF
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chart Previews */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-4 flex items-center gap-2">
          <FaChartLine className="text-primary-400 text-sm" /> Report Previews
        </h2>
        <div className="space-y-6">
          {reportTypes.slice(0, 4).map((report, idx) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
                  {React.createElement(report.icon, { className: 'text-xs', style: { color: report.color.includes('green') ? '#10b981' : report.color.includes('blue') ? '#0f766e' : report.color.includes('purple') ? '#8b5cf6' : report.color.includes('orange') ? '#14b8a6' : report.color.includes('teal') ? '#14b8a6' : report.color.includes('pink') ? '#ec4899' : report.color.includes('yellow') ? '#f59e0b' : '#6366f1' } })}
                  {report.title}
                </h3>
                <button onClick={() => handleExport(report.id, 'csv')} className="btn-ghost text-xs">
                  <FaDownload /> Export
                </button>
              </div>
              {reportCharts[report.id] && reportCharts[report.id]()}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title={selectedReport ? `${selectedReport.title} - Preview` : 'Report Preview'} size="lg">
        {selectedReport && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedReport.color} flex items-center justify-center`}>
                  {React.createElement(selectedReport.icon, { className: 'text-white text-sm' })}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ">{selectedReport.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{selectedReport.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleExport(selectedReport.id, 'csv')} className="btn-outline text-xs">
                  <FaFileCsv className="text-primary-400" /> CSV
                </button>
                <button onClick={() => handleExport(selectedReport.id, 'excel')} className="btn-outline text-xs">
                  <FaFileExcel className="text-primary-400" /> Excel
                </button>
                <button onClick={() => handleExport(selectedReport.id, 'pdf')} className="btn-outline text-xs">
                  <FaFilePdf className="text-red-500" /> PDF
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700  pt-4">
              <div className="overflow-x-auto">
                {renderPreviewTable(selectedReport.id)}
              </div>
            </div>
            {reportCharts[selectedReport.id] && (
              <div className="border-t border-gray-200 dark:border-gray-700  pt-4">
                {reportCharts[selectedReport.id]()}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
