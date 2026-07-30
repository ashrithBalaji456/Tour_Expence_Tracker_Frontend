import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, PlusCircle, Plane } from 'lucide-react';

export default function Header({ onOpenExpenseModal, onOpenPreTrip }) {
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-glow-cyan">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Trip Money Handler Mode
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-cyan-400 animate-spin-slow" />
            Trip Cash & Expense Tracker
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1.5">
            Effortlessly manage daily group purchases, water bottles, food bills & cash outflows in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenPreTrip}
            className="px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/35 text-violet-300 font-bold text-sm flex items-center gap-2 border border-violet-500/40 shadow-glow-violet transition-all"
          >
            <Plane className="w-4 h-4 text-violet-400" />
            Pre-Trip Planner
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpenExpenseModal()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 text-white font-bold text-sm flex items-center gap-2 shadow-glow-cyan hover:brightness-110 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Log Purchase
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
