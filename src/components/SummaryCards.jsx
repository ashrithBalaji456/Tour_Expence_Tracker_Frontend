import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ShoppingCart, DollarSign, Users } from 'lucide-react';

export default function SummaryCards({ summary }) {
  const totalBudget = summary?.totalBudget || 0;
  const totalSpent = summary?.totalSpent || 0;
  const remainingBalance = summary?.remainingBalance || 0;
  const sharePerMember = summary?.sharePerMember || 0;

  const tripSpent = summary?.totalExpensesSpent || 0;
  const preTripSpent = summary?.totalPreTripSpent || 0;
  const count = summary?.totalExpenseCount || 0;
  const memberCount = summary?.memberSummaries?.length || 0;

  const percentageSpent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. Total Trip Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden group border border-white/5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">💰 Total Trip Budget</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight">
          ₹{totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Budget limit configured for {memberCount} members
        </div>
      </motion.div>

      {/* 2. Total Outflow / Spent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden group border border-white/5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">🛒 Total Outflow / Spent</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight">
          ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-between text-[11px] text-rose-400 font-medium">
          <span>Trip: ₹{tripSpent.toLocaleString()} | Upfront: ₹{preTripSpent.toLocaleString()}</span>
          <span className="font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
            {count} Items
          </span>
        </div>
      </motion.div>

      {/* 3. Remaining Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className={`glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden group border ${
          remainingBalance < 0 ? 'border-rose-500/40 bg-rose-950/20' : 'border-emerald-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">⚖️ Remaining Balance</span>
          <div className={`p-2 rounded-xl ${
            remainingBalance < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
          } border border-white/10 group-hover:scale-110 transition-transform`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl lg:text-3xl font-extrabold mb-2 tracking-tight ${
          remainingBalance < 0 ? 'text-rose-400' : 'text-emerald-400'
        }`}>
          ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentageSpent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${
              percentageSpent > 85
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
            }`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>{percentageSpent}% Budget Spent</span>
          <span>{remainingBalance < 0 ? 'Deficit!' : 'Surplus'}</span>
        </div>
      </motion.div>

      {/* 4. Cost Share / Person */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden group border border-white/5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">🤝 Equal Cost Share</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-white mb-2 tracking-tight">
          ₹{sharePerMember.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Per person target spend for equal split
        </div>
      </motion.div>
    </div>
  );
}
