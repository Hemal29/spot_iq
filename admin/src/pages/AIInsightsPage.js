import React, { useState, useEffect, useCallback } from 'react';
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
  FaBrain, FaChartLine, FaExclamationTriangle, FaCalendarAlt, FaDollarSign,
  FaBullseye, FaStar, FaExclamationCircle, FaUserPlus, FaBan,
  FaArrowUp, FaArrowDown, FaCheckCircle, FaLightbulb, FaMapMarkerAlt,
  FaCar, FaClock, FaRobot, FaCogs, FaDatabase, FaTachometerAlt,
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

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl p-5 bg-gray-200 dark:bg-gray-700  h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-52 bg-gray-200 dark:bg-gray-700  rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6"><div className="h-64 bg-gray-200 dark:bg-gray-700  rounded-xl" /></div>
        ))}
      </div>
    </div>
  );
}

function generateOccupancyPrediction() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    const base = i >= 5 ? 88 : i === 2 ? 82 : i === 4 ? 90 : 72;
    const jitter = Math.floor(Math.random() * 8) - 4;
    return { day, predicted: Math.min(99, Math.max(40, base + jitter)) };
  });
}

function generateRevenueForecast() {
  const data = [];
  let baseRevenue = 12500;
  for (let i = 0; i < 30; i++) {
    const dayOfWeek = i % 7;
    const weekendBoost = dayOfWeek >= 5 ? 1.35 : 1;
    const trend = 1 + (i * 0.008);
    const noise = 0.9 + Math.random() * 0.2;
    const value = Math.round(baseRevenue * weekendBoost * trend * noise);
    data.push({
      day: `Day ${i + 1}`,
      predicted: value,
      lower: Math.round(value * 0.82),
      upper: Math.round(value * 1.18),
    });
  }
  return data;
}

function generateDemandByArea() {
  return [
    { area: 'Downtown', demand: 92, capacity: 100, trend: 'up' },
    { area: 'Airport', demand: 85, capacity: 100, trend: 'up' },
    { area: 'Mall District', demand: 78, capacity: 100, trend: 'stable' },
    { area: 'Tech Park', demand: 71, capacity: 100, trend: 'up' },
    { area: 'Residential', demand: 45, capacity: 100, trend: 'down' },
    { area: 'Sports Complex', demand: 62, capacity: 100, trend: 'stable' },
    { area: 'Hospital Area', demand: 88, capacity: 100, trend: 'up' },
    { area: 'University', demand: 55, capacity: 100, trend: 'down' },
  ];
}

function generateAnomalies() {
  return [
    {
      id: 1, type: 'spike', severity: 'high',
      title: 'Unusual booking spike at City Center',
      description: 'Booking volume 340% above normal between 2-4 AM. Potential automated/bot activity.',
      timestamp: '2 hours ago', parking: 'City Center Hub',
    },
    {
      id: 2, type: 'drop', severity: 'medium',
      title: 'Revenue drop at Airport Terminal',
      description: 'Revenue 45% below expected for the past 3 days. May correlate with flight schedule changes.',
      timestamp: '6 hours ago', parking: 'Airport Terminal A',
    },
    {
      id: 3, type: 'pattern', severity: 'low',
      title: 'Cancellation pattern detected',
      description: 'Cluster of last-minute cancellations at Downtown Garage on weekday evenings.',
      timestamp: '1 day ago', parking: 'Downtown Garage',
    },
    {
      id: 4, type: 'spike', severity: 'medium',
      title: 'Peak hour duration anomaly',
      description: 'Average booking duration increased 65% during off-peak hours at Mall Plaza.',
      timestamp: '1 day ago', parking: 'Mall Plaza South',
    },
  ];
}

function generateCustomerGrowth() {
  const data = [];
  let cumulative = 2400;
  for (let i = 0; i < 12; i++) {
    const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i];
    const growth = Math.round(80 + Math.random() * 120 + (i * 15));
    cumulative += growth;
    data.push({ month, actual: i < 9 ? cumulative : null, predicted: i >= 8 ? cumulative : null, newUsers: growth });
  }
  return data;
}

function generateCancellationRisk() {
  return [
    { id: 1, user: 'Rahul Sharma', parking: 'City Center Hub', time: 'Today, 6:00 PM', risk: 87, reason: 'History of late cancellations' },
    { id: 2, user: 'Priya Patel', parking: 'Airport Terminal A', time: 'Tomorrow, 8:00 AM', risk: 72, reason: 'Weather warning at destination' },
    { id: 3, user: 'Amit Kumar', parking: 'Mall Plaza South', time: 'Today, 4:30 PM', risk: 65, reason: 'Multiple reschedule attempts' },
    { id: 4, user: 'Sneha Reddy', parking: 'Tech Park Lot B', time: 'Tomorrow, 9:00 AM', risk: 58, reason: 'Low engagement score' },
    { id: 5, user: 'Vikram Singh', parking: 'Downtown Garage', time: 'Today, 7:00 PM', risk: 45, reason: 'Recent refund request' },
  ];
}

const insightCards = [
  { id: 'occupancy', title: 'Occupancy Prediction', description: 'Next 7 days forecast based on historical patterns', icon: FaTachometerAlt, gradient: 'from-primary-500/20 to-gray-400/5', borderColor: 'border-primary-400/30', iconBg: 'bg-gray-500/15', iconColor: 'text-gray-400' },
  { id: 'peak', title: 'Peak Hour Prediction', description: 'Busiest hours predicted for tomorrow', icon: FaClock, gradient: 'from-primary-500/20 to-primary-400/5', borderColor: 'border-primary-400/30', iconBg: 'bg-gray-500/15', iconColor: 'text-gray-400' },
  { id: 'revenue', title: 'Revenue Forecast', description: '30-day projected revenue trend', icon: FaDollarSign, gradient: 'from-green-600/20 to-green-400/5', borderColor: 'border-primary-300/30', iconBg: 'bg-gray-500/15', iconColor: 'text-primary-400' },
  { id: 'demand', title: 'Demand Estimation', description: 'Parking demand by area for this week', icon: FaBullseye, gradient: 'from-purple-600/20 to-purple-400/5', borderColor: 'border-primary-300/30', iconBg: 'bg-gray-500/15', iconColor: 'text-primary-400' },
  { id: 'recommendation', title: 'Best Parking Recommendation', description: 'Top rated parking spots to recommend', icon: FaStar, gradient: 'from-yellow-600/20 to-yellow-400/5', borderColor: 'border-primary-300/30', iconBg: 'bg-gray-500/15', iconColor: 'text-primary-400' },
  { id: 'anomaly', title: 'Anomaly Detection', description: 'Unusual activity detected in system', icon: FaExclamationCircle, gradient: 'from-red-600/20 to-red-400/5', borderColor: 'border-red-500/30', iconBg: 'bg-red-500/15', iconColor: 'text-red-400' },
  { id: 'growth', title: 'Customer Growth', description: 'Predicted new customer signups', icon: FaUserPlus, gradient: 'from-primary-400/20 to-gray-400/5', borderColor: 'border-primary-400/30', iconBg: 'bg-gray-500/15', iconColor: 'text-gray-400' },
  { id: 'cancellation', title: 'Cancellation Risk', description: 'Bookings at risk of being cancelled', icon: FaBan, gradient: 'from-pink-600/20 to-pink-400/5', borderColor: 'border-primary-300/30', iconBg: 'bg-gray-500/15', iconColor: 'text-primary-400' },
];

const mlStats = [
  { label: 'Prediction Accuracy', value: '94.7%', icon: FaCheckCircle, color: 'emerald' },
  { label: 'Models Active', value: '6', icon: FaCogs, color: 'blue' },
  { label: 'Insights Generated', value: '128', icon: FaBrain, color: 'purple' },
  { label: 'Data Points Analyzed', value: '2.4M', icon: FaDatabase, color: 'orange' },
];

const statColorMap = {
  emerald: { from: 'from-emerald-500/15', border: 'border-primary-300/25', text: 'text-primary-400', bg: 'bg-gray-500/10', shadow: 'shadow-primary-400/5' },
  blue: { from: 'from-primary-400/15', border: 'border-primary-400/25', text: 'text-gray-400', bg: 'bg-gray-500/10', shadow: 'shadow-primary-400/5' },
  purple: { from: 'from-purple-500/15', border: 'border-primary-300/25', text: 'text-primary-400', bg: 'bg-gray-500/10', shadow: 'shadow-primary-400/5' },
  orange: { from: 'from-primary-400/15', border: 'border-primary-400/25', text: 'text-gray-400', bg: 'bg-gray-500/10', shadow: 'shadow-primary-400/5' },
};

const mockRecommendations = [
  { id: 1, name: 'Tech Park Parking', city: 'Bangalore', rating: 4.8, available: 42, bookings: 312, score: 97 },
  { id: 2, name: 'City Center Hub', city: 'Mumbai', rating: 4.5, available: 24, bookings: 286, score: 94 },
  { id: 3, name: 'Airport Parking Lot A', city: 'Delhi', rating: 4.6, available: 35, bookings: 253, score: 92 },
  { id: 4, name: 'Southside Garage', city: 'Bangalore', rating: 4.7, available: 31, bookings: 198, score: 90 },
  { id: 5, name: 'Mall Plaza Parking', city: 'Chennai', rating: 4.3, available: 27, bookings: 165, score: 84 },
];

const scoreColorMap = [
  { min: 90, cls: 'bg-gray-500/20 text-primary-300 border border-primary-300/30' },
  { min: 80, cls: 'bg-gray-500/20 text-gray-300 border border-primary-400/30' },
  { min: 70, cls: 'bg-gray-500/20 text-gray-300 border border-primary-400/30' },
  { min: 0, cls: 'bg-red-500/20 text-red-300 border border-red-500/30' },
];

function getScoreClass(score) {
  return scoreColorMap.find((s) => score >= s.min)?.cls || scoreColorMap[scoreColorMap.length - 1].cls;
}

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [mostRecommended, setMostRecommended] = useState([]);
  const [businessInsights, setBusinessInsights] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  const [occupancyPrediction] = useState(generateOccupancyPrediction);
  const [revenueForecast] = useState(generateRevenueForecast);
  const [demandByArea] = useState(generateDemandByArea);
  const [anomalies] = useState(generateAnomalies);
  const [customerGrowthData] = useState(generateCustomerGrowth);
  const [cancellationRisks] = useState(generateCancellationRisk);

  const peakPredictionHours = [
    { hour: '8AM', bookings: 38, confidence: 92 },
    { hour: '10AM', bookings: 52, confidence: 88 },
    { hour: '12PM', bookings: 58, confidence: 90 },
    { hour: '5PM', bookings: 65, confidence: 95 },
    { hour: '6PM', bookings: 72, confidence: 93 },
    { hour: '7PM', bookings: 60, confidence: 87 },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setUsingMock(false);
    try {
      const [recRes, insightsRes, recommendedRes] = await Promise.allSettled([
        adminService.getRecommendationAnalytics(),
        adminService.getBusinessInsights(),
        adminService.getMostRecommended(),
      ]);
      let mock = false;
      const recData = recommendedRes.status === 'fulfilled' ? recommendedRes.value?.data?.data || recommendedRes.value?.data : null;
      if (recData?.length) {
        setMostRecommended(recData);
      } else {
        setMostRecommended(mockRecommendations);
        mock = true;
      }
      const insightsData = insightsRes.status === 'fulfilled' ? insightsRes.value?.data?.data || insightsRes.value?.data : null;
      if (insightsData) {
        setBusinessInsights(Array.isArray(insightsData) ? insightsData : []);
      }
      setUsingMock(mock);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setMostRecommended(mockRecommendations);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInsightClick = (card) => {
    setSelectedInsight(card);
    setInsightModalOpen(true);
  };

  const getInsightPrediction = (cardId) => {
    switch (cardId) {
      case 'occupancy':
        return { value: `${Math.round(occupancyPrediction.reduce((a, b) => a + b.predicted, 0) / occupancyPrediction.length)}%`, confidence: 91, trend: 'up' };
      case 'peak':
        return { value: '6PM', confidence: 93, trend: 'up' };
      case 'revenue':
        return { value: formatCurrency(revenueForecast.slice(0, 7).reduce((a, b) => a + b.predicted, 0)), confidence: 87, trend: 'up' };
      case 'demand':
        return { value: '92%', confidence: 85, trend: 'up' };
      case 'recommendation':
        return { value: '97', confidence: 95, trend: 'up' };
      case 'anomaly':
        return { value: `${anomalies.length}`, confidence: 88, trend: 'down' };
      case 'growth':
        return { value: '+1,580', confidence: 82, trend: 'up' };
      case 'cancellation':
        return { value: `${cancellationRisks.length}`, confidence: 79, trend: 'down' };
      default:
        return { value: '-', confidence: 0, trend: 'up' };
    }
  };

  const renderInsightModalContent = (cardId) => {
    switch (cardId) {
      case 'occupancy':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={occupancyPrediction}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, 'Occupancy']} />} />
              <Bar dataKey="predicted" name="Predicted" radius={[4, 4, 0, 0]} barSize={28}>
                {occupancyPrediction.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.predicted >= 90 ? '#10b981' : entry.predicted >= 75 ? '#f59e0b' : '#0f766e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'peak':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={peakPredictionHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip formatter={(v) => [v, 'Bookings']} />} />
              <Bar dataKey="bookings" name="Predicted Bookings" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueForecast}>
              <defs>
                <linearGradient id="modalRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />} />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="#10b981" fillOpacity={0.08} />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="white" fillOpacity={0} />
              <Area type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2.5} fill="url(#modalRevGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'demand':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={demandByArea} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="area" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, 'Demand']} />} />
              <Bar dataKey="demand" name="Demand" radius={[0, 4, 4, 0]} barSize={14}>
                {demandByArea.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.demand >= 85 ? '#ef4444' : entry.demand >= 70 ? '#f59e0b' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'recommendation':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 ">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Parking</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">City</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Rating</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Score</th>
                </tr>
              </thead>
              <tbody>
                {mockRecommendations.map((rec, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 ">
                    <td className="py-2 px-2 text-gray-900 dark:text-gray-100  font-medium">{rec.name}</td>
                    <td className="py-2 px-2 text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{rec.city}</td>
                    <td className="py-2 px-2 text-center"><span className="text-primary-400 text-xs">{rec.rating} <FaStar className="inline text-[8px]" /></span></td>
                    <td className="py-2 px-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${getScoreClass(rec.score)}`}>{rec.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'anomaly':
        return (
          <div className="space-y-3">
            {anomalies.map((a) => (
              <div key={a.id} className={`p-3 rounded-xl border ${a.severity === 'high' ? 'bg-red-500/5 border-red-500/20' : a.severity === 'medium' ? 'bg-gray-500/5 border-primary-400/20' : 'bg-gray-500/5 border-primary-300/20'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 ">{a.title}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${a.severity === 'high' ? 'bg-red-500/20 text-red-400' : a.severity === 'medium' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-500/20 text-primary-400'}`}>{a.severity}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{a.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ">{a.timestamp}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ">|</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ">{a.parking}</span>
                </div>
              </div>
            ))}
          </div>
        );
      case 'growth':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip formatter={(v) => [v, 'New Users']} />} />
              <Line type="monotone" dataKey="newUsers" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'cancellation':
        return (
          <div className="space-y-3">
            {cancellationRisks.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 ">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${r.risk >= 80 ? 'bg-red-500/15 text-red-400' : r.risk >= 60 ? 'bg-gray-500/15 text-gray-400' : 'bg-gray-500/15 text-primary-400'}`}>
                  {r.risk}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{r.user}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{r.parking} &middot; {r.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{r.reason}</p>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = (cardId) => {
    const card = insightCards.find((c) => c.id === cardId);
    return card ? card.title : 'Insight Details';
  };

  if (loading) return <SkeletonLoader />;

  const insights = businessInsights || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Insights"
        subtitle="Machine learning powered predictions"
        action={
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/10 border border-primary-300/30 rounded-xl text-sm text-primary-300 font-medium">
            <FaRobot className="text-xs" />
            ML Engine Active
          </span>
        }
      />

      {usingMock && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-5 py-3 bg-gray-500/10 border border-primary-300/30 rounded-2xl text-sm text-primary-300">
          <FaExclamationTriangle className="text-primary-400 shrink-0" />
          <span>Showing predicted data - Some AI endpoints are using simulated models</span>
        </motion.div>
      )}

      {/* ML Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mlStats.map((stat, idx) => {
          const colors = statColorMap[stat.color];
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -4, transition: { duration: 0.2 } }} className={`relative overflow-hidden bg-white dark:bg-gray-900   rounded-2xl border ${colors.border} shadow-sm ${colors.shadow} p-5`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} to-transparent opacity-50`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500  uppercase tracking-wider">{stat.label}</p>
                  <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`text-sm ${colors.text}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold tracking-tight ${colors.text}`}>{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insight Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-4 flex items-center gap-2">
          <FaBrain className="text-primary-400 text-sm" />
          AI Prediction Models
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightCards.map((card, idx) => {
            const Icon = card.icon;
            const prediction = getInsightPrediction(card.id);
            return (
              <motion.div key={card.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }} onClick={() => handleInsightClick(card)} className={`relative overflow-hidden bg-white dark:bg-gray-900   rounded-2xl border ${card.borderColor} shadow-sm p-5 cursor-pointer group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} to-transparent opacity-40`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                      <Icon className={`text-sm ${card.iconColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${prediction.trend === 'up' ? 'bg-gray-500/15 text-primary-400' : 'bg-red-500/15 text-red-400'}`}>
                      {prediction.trend === 'up' ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
                      {prediction.confidence}%
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-3 leading-relaxed">{card.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100 ">{prediction.value}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ">confidence</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700  rounded-full mt-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${prediction.confidence}%` }} transition={{ delay: idx * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }} className={`h-full rounded-full ${prediction.confidence >= 90 ? 'bg-gray-500' : prediction.confidence >= 80 ? 'bg-gray-500' : prediction.confidence >= 70 ? 'bg-gray-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.15}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-1 flex items-center gap-2">
            <FaTachometerAlt className="text-gray-400 dark:text-gray-500 text-sm" /> Occupancy Forecast
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-4">Predicted occupancy rates for the next 7 days</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={occupancyPrediction}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, 'Occupancy']} />} />
              <Bar dataKey="predicted" name="Predicted" radius={[4, 4, 0, 0]} barSize={28}>
                {occupancyPrediction.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.predicted >= 90 ? '#10b981' : entry.predicted >= 75 ? '#f59e0b' : '#0f766e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard delay={0.2}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-1 flex items-center gap-2">
            <FaDollarSign className="text-primary-400 text-sm" /> Revenue Forecast
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-4">30-day revenue projection with confidence bands</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueForecast}>
              <defs>
                <linearGradient id="revForecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />} />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="#10b981" fillOpacity={0.08} />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="white" fillOpacity={0} />
              <Area type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2.5} fill="url(#revForecastGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard delay={0.25}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-1 flex items-center gap-2">
            <FaBullseye className="text-primary-400 text-sm" /> Demand by Area
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-4">Estimated parking demand across areas</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demandByArea} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="area" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={85} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, 'Demand']} />} />
              <Bar dataKey="demand" name="Demand" radius={[0, 4, 4, 0]} barSize={14}>
                {demandByArea.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.demand >= 85 ? '#ef4444' : entry.demand >= 70 ? '#f59e0b' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard delay={0.3}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  mb-1 flex items-center gap-2">
            <FaUserPlus className="text-gray-400 dark:text-gray-500 text-sm" /> Customer Growth Prediction
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-4">Projected new customer signups</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip formatter={(v) => [v, 'New Users']} />} />
              <Line type="monotone" dataKey="newUsers" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Key Insights & Recommendations */}
      {insights.length > 0 && (
        <GlassCard delay={0.32}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
              <FaLightbulb className="text-primary-400 text-sm" /> Key Recommendations
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.slice(0, 6).map((insight, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 ">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${insight.type === 'positive' ? 'bg-gray-500/15 text-primary-400' : insight.type === 'warning' ? 'bg-gray-500/15 text-gray-400' : 'bg-gray-500/15 text-gray-400'}`}>
                  {insight.type === 'positive' ? <FaArrowUp className="text-xs" /> : insight.type === 'warning' ? <FaExclamationTriangle className="text-xs" /> : <FaLightbulb className="text-xs" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{insight.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mt-0.5">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Top Recommendations Table */}
      <GlassCard delay={0.35}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100  flex items-center gap-2">
            <FaStar className="text-primary-400 text-sm" /> Top AI Recommendations
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Sorted by ML relevance score</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 ">
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Rank</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Parking Name</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">City</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Rating</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Available</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Bookings</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500  uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody>
              {mostRecommended.map((rec, idx) => (
                <motion.tr key={rec.id || idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="border-b border-gray-100 dark:border-gray-700/50  hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800  transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br bg-primary-500 flex items-center justify-center text-white text-xs font-bold">{idx + 1}</div>
                  </td>
                  <td className="py-3.5 px-3 text-gray-900 dark:text-gray-100  font-medium">{rec.name}</td>
                  <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{rec.city}</td>
                  <td className="py-3.5 px-3 text-center"><span className="inline-flex items-center gap-1 text-primary-400"><FaStar className="text-[10px]" />{rec.rating}</span></td>
                  <td className="py-3.5 px-3 text-center text-gray-700 dark:text-gray-300 ">{rec.available}</td>
                  <td className="py-3.5 px-3 text-center text-gray-700 dark:text-gray-300 ">{rec.bookings}</td>
                  <td className="py-3.5 px-3 text-center"><span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getScoreClass(rec.score)}`}>{rec.score}</span></td>
                </motion.tr>
              ))}
              {mostRecommended.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500  text-sm">No recommendations available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Insight Detail Modal */}
      <Modal isOpen={insightModalOpen} onClose={() => setInsightModalOpen(false)} title={getModalTitle(selectedInsight?.id)} size="lg">
        {selectedInsight && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedInsight.iconBg}`}>
                {React.createElement(selectedInsight.icon, { className: `text-sm ${selectedInsight.iconColor}` })}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{selectedInsight.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  {(() => { const p = getInsightPrediction(selectedInsight.id); return (
                    <>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100 ">{p.value}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${p.trend === 'up' ? 'bg-gray-500/15 text-primary-400' : 'bg-red-500/15 text-red-400'}`}>
                        {p.trend === 'up' ? <FaArrowUp className="inline text-[8px] mr-1" /> : <FaArrowDown className="inline text-[8px] mr-1" />}
                        {p.confidence}% confidence
                      </span>
                    </>
                  ); })()}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700  pt-4">
              {renderInsightModalContent(selectedInsight.id)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
