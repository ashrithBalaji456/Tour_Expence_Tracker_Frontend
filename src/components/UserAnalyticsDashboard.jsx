import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  PlusCircle,
  RefreshCw,
  LogOut,
  Calendar,
  Users,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ChevronRight,
  Trash2,
  Check,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const CATEGORY_COLORS = {
  FOOD: '#F59E0B',
  DRINKS: '#00F2FE',
  TRANSPORT: '#10B981',
  ACCOMMODATION: '#8B5CF6',
  SHOPPING: '#F43F5E',
  ENTERTAINMENT: '#EAB308',
  MISC: '#64748B',
};

const formatCurrency = (amt) => {
  const n = parseFloat(amt || 0);
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Custom Glass Tooltip for Recharts
const GlassChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card bg-[#0B0F19]/95 border border-white/15 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-xs space-y-1">
        <p className="font-extrabold text-white text-sm pb-1 border-b border-white/10">
          {label || payload[0]?.name || 'Expense'}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="text-white font-bold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function UserAnalyticsDashboard({
  overview,
  onSelectGroup,
  onCreateGroupClick,
  onRefresh,
  onSignOut,
  onDeleteGroup,
  onToggleGroupStatus,
  refreshing = false,
}) {
  const [filterTab, setFilterTab] = useState('ALL'); // ALL | ACTIVE | COMPLETED | CREATED_BY_ME
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingGroupId, setUpdatingGroupId] = useState(null);

  const trips = overview?.trips || [];
  const username = overview?.username || '';

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      // Tab filter
      if (filterTab === 'ACTIVE' && t.status !== 'ACTIVE') return false;
      if (filterTab === 'COMPLETED' && t.status !== 'COMPLETED') return false;
      if (filterTab === 'CREATED_BY_ME' && !t.isCreator) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return t.groupName?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [trips, filterTab, searchQuery]);

  // Chart 1: Per-Trip Comparison Data (Top 8 trips for clarity)
  const tripBarData = useMemo(() => {
    return trips.slice(0, 8).map((t) => ({
      name: t.groupName?.length > 12 ? t.groupName.slice(0, 10) + '…' : t.groupName,
      fullName: t.groupName,
      totalTrip: parseFloat(t.totalTripExpense || 0),
      myPaid: parseFloat(t.myPaid || 0),
      myShare: parseFloat(t.myShare || 0),
    }));
  }, [trips]);

  // Chart 2: Category Breakdown Data
  const pieData = useMemo(() => {
    const breakdown = overview?.categoryBreakdown || {};
    return Object.keys(breakdown)
      .map((cat) => ({
        name: cat,
        value: parseFloat(breakdown[cat] || 0),
        color: CATEGORY_COLORS[cat] || '#8B5CF6',
      }))
      .filter((item) => item.value > 0);
  }, [overview]);

  // Chart 3: Monthly Trend Data
  const monthlyData = useMemo(() => {
    const list = overview?.monthlyTrend || [];
    return list.map((item) => ({
      month: item.month,
      amount: parseFloat(item.amount || 0),
    }));
  }, [overview]);

  const handleStatusToggle = async (trip, e) => {
    e.stopPropagation();
    if (!trip.isCreator || !onToggleGroupStatus) return;
    const newStatus = trip.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED';
    try {
      setUpdatingGroupId(trip.groupId);
      await onToggleGroupStatus(trip.groupId, newStatus);
    } finally {
      setUpdatingGroupId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 p-3.5 sm:p-6 lg:p-8 relative overflow-x-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="fixed -top-48 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-48 -right-48 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* Top Executive Header */}
        <header className="glass-card rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Compass className="w-7 h-7 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Trip Cash Tracker
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Global Portfolio
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                Logged in as <span className="font-bold text-white">@{username}</span>
                <span className="text-slate-600">•</span>
                <span>Track multi-trip balances, personal spending & settlements</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-all font-bold text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              title="Refresh All Trip Analytics"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={onCreateGroupClick}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl btn-premium btn-cyan text-xs font-bold shadow-glow-cyan flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Trip</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* 4 Executive KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Trips Counter */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-3xl p-5 border border-white/10 shadow-xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Trips Lifecycle
              </span>
              <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {overview?.totalTrips || 0}
              <span className="text-xs font-semibold text-slate-400 ml-1.5 font-sans">Trips</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {overview?.activeTrips || 0} Active
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30">
                <Check className="w-3 h-3" />
                {overview?.completedTrips || 0} Done
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {overview?.tripsLastMonth || 0} in last 30d • {overview?.tripsLastYear || 0} this year
            </p>
          </motion.div>

          {/* Card 2: Total Spent Overall */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-3xl p-5 border border-white/10 shadow-xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-violet-400" /> My Total Spending
              </span>
              <span className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {formatCurrency(overview?.totalSpentOverall || 0)}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">⚡ Last 7 Days:</span>
                <span className="font-bold text-white">{formatCurrency(overview?.totalSpentLast7Days || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">📅 Last 30 Days:</span>
                <span className="font-bold text-white">{formatCurrency(overview?.totalSpentLast30Days || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">🗓️ Last 365 Days:</span>
                <span className="font-bold text-white">{formatCurrency(overview?.totalSpentLastYear || 0)}</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Pending Payments (You Owe) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={`glass-card rounded-3xl p-5 border shadow-xl relative overflow-hidden group ${
              parseFloat(overview?.totalPendingPayable || 0) > 0
                ? 'border-rose-500/30 bg-rose-500/5'
                : 'border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Pending Payments (I Owe)
              </span>
              <span className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                ₹
              </span>
            </div>
            <div
              className={`text-3xl font-black tracking-tight ${
                parseFloat(overview?.totalPendingPayable || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {parseFloat(overview?.totalPendingPayable || 0) > 0
                ? formatCurrency(overview?.totalPendingPayable)
                : 'All Settled'}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400">
              {parseFloat(overview?.totalPendingPayable || 0) > 0 ? (
                <span className="text-rose-300 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Pending dues to group members across trips
                </span>
              ) : (
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  You have zero outstanding dues!
                </span>
              )}
            </div>
          </motion.div>

          {/* Card 4: Receivables (Others Owe You) */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-3xl p-5 border border-white/10 shadow-xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Receivables (Others Owe Me)
              </span>
              <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                ₹
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(overview?.totalPendingReceivable || 0)}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400">
              {parseFloat(overview?.totalPendingReceivable || 0) > 0 ? (
                <span className="text-cyan-300 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  Friends will reimburse this across active trips
                </span>
              ) : (
                <span className="text-slate-400">No pending reimbursements owed to you</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Transparent Interactive Charts Section */}
        {trips.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Per-Trip Spending Comparison (2 Columns on large screens) */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Trip Spending Comparison
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compare total trip costs with your personal spending and allocated share
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Total Cost
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> My Paid
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tripBarData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip content={<GlassChartTooltip />} />
                    <Bar dataKey="totalTrip" name="Total Trip Cost" fill="#06B6D4" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="myPaid" name="My Paid" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Breakdown Donut */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
              <div className="mb-2">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-violet-400" />
                  Category Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How your spending divides across all trips
                </p>
              </div>

              {pieData.length > 0 ? (
                <div className="h-56 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<GlassChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                    <span className="text-sm font-black text-white">
                      {formatCurrency(overview?.totalSpentOverall || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic">
                  No category expenses logged yet
                </div>
              )}

              {/* Category Badges */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {pieData.slice(0, 5).map((cat) => (
                  <span
                    key={cat.name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}: {formatCurrency(cat.value)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trips Hub & Filterable Logs */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                My Trip Portfolios & Logs
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any trip card to open its dedicated dashboard, view live bills, or record expenses
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs w-full sm:w-auto overflow-x-auto">
              {[
                { key: 'ALL', label: `All (${trips.length})` },
                { key: 'ACTIVE', label: `Active (${overview?.activeTrips || 0})` },
                { key: 'COMPLETED', label: `Done (${overview?.completedTrips || 0})` },
                { key: 'CREATED_BY_ME', label: 'Admin' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    filterTab === tab.key
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar if many trips */}
          {trips.length > 3 && (
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search trip by name (e.g. Goa, Ladakh...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-2xl pl-10 pr-4 py-2 text-xs"
              />
            </div>
          )}

          {/* Trips Grid */}
          {filteredTrips.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-white/10 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                <Compass className="w-7 h-7 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-extrabold text-white">No Trips Found</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {trips.length === 0
                    ? `You are not currently part of any trip group. Ask your friends to invite @${username} to their trip, or create a brand new trip below!`
                    : 'No trips match your selected filter or search query.'}
                </p>
              </div>

              {trips.length === 0 && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={onCreateGroupClick}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-premium btn-cyan text-xs font-bold shadow-glow-cyan flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Create First Trip
                  </button>
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-bold border border-white/15 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Trips
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <AnimatePresence>
                {filteredTrips.map((trip) => {
                  const isCompleted = trip.status === 'COMPLETED';
                  const isCreator = trip.isCreator;
                  const net = parseFloat(trip.netBalance || 0);

                  return (
                    <motion.div
                      key={trip.groupId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => onSelectGroup(trip)}
                      className="glass-card rounded-3xl p-5 border border-white/10 hover:border-cyan-500/40 shadow-xl hover:shadow-cyan-500/10 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                    >
                      {/* Top Badges & Title */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Status Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                                isCompleted
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCompleted ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'
                                }`}
                              />
                              {isCompleted ? 'COMPLETED' : 'ACTIVE'}
                            </span>

                            {/* Role Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isCreator
                                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                  : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                              }`}
                            >
                              {isCreator ? 'Admin' : 'Member'}
                            </span>
                          </div>

                          {/* Admin toggle status or delete */}
                          {isCreator && (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => handleStatusToggle(trip, e)}
                                disabled={updatingGroupId === trip.groupId}
                                className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1 ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30'
                                    : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border-blue-500/30'
                                }`}
                                title={isCompleted ? 'Reopen as Active Trip' : 'Mark Trip as Completed'}
                              >
                                {isCompleted ? (
                                  <>
                                    <Clock className="w-3 h-3" /> Reopen
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" /> Complete
                                  </>
                                )}
                              </button>

                              {onDeleteGroup && (
                                <button
                                  type="button"
                                  onClick={(e) => onDeleteGroup(trip.groupId, e)}
                                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-white border border-rose-500/20 transition-all"
                                  title="Delete Trip Group"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                            {trip.groupName}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {trip.createdAt ? formatDate(trip.createdAt) : 'Recently created'}
                            <span>•</span>
                            <Users className="w-3 h-3 text-slate-500" />
                            {trip.memberCount} members
                          </p>
                        </div>
                      </div>

                      {/* Financial Breakdown Grid */}
                      <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded-xl bg-white/5">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Trip Total</span>
                            <span className="font-extrabold text-white">
                              {formatCurrency(trip.totalTripExpense)}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">My Paid</span>
                            <span className="font-extrabold text-cyan-300">{formatCurrency(trip.myPaid)}</span>
                          </div>
                        </div>

                        {/* Settlement Status Pill */}
                        <div
                          className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border ${
                            net < 0
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : net > 0
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-white/5'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-extrabold">Balance:</span>
                          <span>
                            {net < 0
                              ? `You owe ${formatCurrency(Math.abs(net))}`
                              : net > 0
                              ? `You get ${formatCurrency(net)}`
                              : 'All Settled'}
                          </span>
                        </div>

                        {/* Open Button */}
                        <button
                          type="button"
                          className="w-full mt-1 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 group-hover:bg-cyan-500 text-slate-300 group-hover:text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Open Trip Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
