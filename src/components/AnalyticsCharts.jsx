import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

const CATEGORY_COLORS = {
  FOOD: '#F59E0B',
  DRINKS: '#00F2FE',
  TRANSPORT: '#10B981',
  ACCOMMODATION: '#8B5CF6',
  SHOPPING: '#F43F5E',
  ENTERTAINMENT: '#EAB308',
  MISC: '#64748B',
};

// Custom Tooltip for Pie & Bar Charts with high-contrast text and glowing indicators
const CustomChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const name = data.name || data.payload?.date || 'Spending';
    const amount = parseFloat(data.value || 0);
    const color = data.fill || data.payload?.fill || '#8B5CF6';

    return (
      <div className="glass-card bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {name}
        </p>
        <p className="text-sm font-extrabold text-white">
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ summary, expenses }) {
  const categoryBreakdown = summary?.categoryBreakdown || {};

  const pieData = Object.keys(categoryBreakdown)
    .map((key) => ({
      name: key,
      value: parseFloat(categoryBreakdown[key] || 0),
    }))
    .filter((item) => item.value > 0);

  // Daily timeline data
  const dateMap = {};
  expenses.forEach((exp) => {
    if (exp.category !== 'SETTLEMENT') {
      const date = exp.expenseDate || 'Unknown';
      dateMap[date] = (dateMap[date] || 0) + parseFloat(exp.amount || 0);
    }
  });

  const barData = Object.keys(dateMap)
    .sort()
    .map((date) => ({
      date: date.substring(5), // MM-DD format
      value: dateMap[date],
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 1. Category Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-3xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Category Spending</h3>
        </div>

        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
            No category data logged yet
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94A3B8' }}
              />
              <span className="font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2. Daily Outflow Bar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card rounded-3xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Daily Outflow Timeline</h3>
        </div>

        {barData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
            No daily activity logged yet
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}
