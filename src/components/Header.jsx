import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, PlusCircle, Plane, LogOut, User, Wallet, History } from 'lucide-react';

export default function Header({ summary, onOpenExpenseModal, onOpenPreTrip, onLogout, onSwitchTrip, onOpenFundModal, onOpenFundHistory }) {
  const username = localStorage.getItem('username') || 'User';
  const groupName = summary?.groupName || 'Trip Cash Tracker';
  const isReadOnly = summary?.isReadOnly || false;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-3xl p-6 md:p-8 mb-8 border border-white/10 relative overflow-hidden shadow-2xl"
    >
      {/* Background glow orb */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row with user info & logout */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Logged in as: <strong className="text-white">{username}</strong></span>
          <span className="text-slate-600">|</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${isReadOnly ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
            {isReadOnly ? 'Read-only Member' : 'Group Admin'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchTrip}
            className="px-3 py-1.5 rounded-xl btn-premium btn-secondary text-xs"
            title="Switch Active Trip"
          >
            <Compass className="w-3.5 h-3.5" />
            Switch Trip
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl btn-premium btn-danger text-xs"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-glow-cyan">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Collaborative Scoping
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-cyan-400 animate-spin-slow" />
            {groupName}
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1.5">
            {isReadOnly 
              ? "View live splits, bookings and trip expenses. Actions are restricted to the group creator."
              : "Effortlessly manage daily group purchases, water bottles, food bills & cash outflows in real-time."
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenPreTrip}
            className="px-4 py-2.5 rounded-xl btn-premium btn-violet text-sm shadow-glow-violet transition-all"
          >
            <Plane className="w-4 h-4" />
            Pre-Trip Planner
          </button>

          {!isReadOnly && (
            <button
              onClick={() => onOpenExpenseModal()}
              className="px-5 py-2.5 rounded-xl btn-premium btn-cyan text-sm shadow-glow-cyan transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Log Purchase
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
