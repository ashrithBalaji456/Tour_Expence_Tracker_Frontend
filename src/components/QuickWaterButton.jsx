import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Droplet, Coffee, Car, Cookie, Zap, CheckCircle } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';

export default function QuickWaterButton({ onExpenseAdded }) {
  const [loadingItem, setLoadingItem] = useState(null);

  const quickItems = [
    {
      id: 'water',
      label: 'Water Bottle',
      amount: 20,
      category: 'DRINKS',
      icon: Droplet,
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/40',
      shadowColor: 'shadow-glow-cyan',
    },
    {
      id: 'tea',
      label: 'Tea / Coffee',
      amount: 30,
      category: 'FOOD',
      icon: Coffee,
      color: 'from-amber-500 to-yellow-600',
      borderColor: 'border-amber-500/40',
      shadowColor: 'shadow-glow-amber',
    },
    {
      id: 'snacks',
      label: 'Quick Snacks',
      amount: 50,
      category: 'FOOD',
      icon: Cookie,
      color: 'from-violet-500 to-purple-600',
      borderColor: 'border-violet-500/40',
      shadowColor: 'shadow-glow-violet',
    },
    {
      id: 'auto',
      label: 'Auto / Ride',
      amount: 100,
      category: 'TRANSPORT',
      icon: Car,
      color: 'from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-500/40',
      shadowColor: 'shadow-glow-emerald',
    },
  ];

  const handleQuickAdd = async (item) => {
    setLoadingItem(item.id);
    try {
      await expenseApi.createExpense({
        title: item.label,
        amount: item.amount,
        category: item.category,
        paymentMode: 'CASH',
        paidBy: 'Group Pool',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: `Instant 1-tap purchase logged during trip`,
      });

      // Confetti burst animation
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });

      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (err) {
      console.error('Failed to log quick purchase:', err);
    } finally {
      setLoadingItem(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6 mb-8 border border-white/10 relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
        <h3 className="text-lg font-bold text-white">Express 1-Tap Purchases</h3>
        <span className="text-xs text-slate-400 font-normal">
          (Log small trip bills like water bottles instantly)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickItems.map((item) => {
          const Icon = item.icon;
          const isLoading = loadingItem === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.94 }}
              disabled={isLoading}
              onClick={() => handleQuickAdd(item)}
              className={`relative p-4 rounded-xl glass-card border ${item.borderColor} bg-gradient-to-br hover:${item.color} text-left transition-all group overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-white/10 text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  ₹{item.amount}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                {isLoading ? (
                  <span className="flex items-center gap-1 text-cyan-300">
                    <CheckCircle className="w-3.5 h-3.5 animate-spin" /> Logging...
                  </span>
                ) : (
                  `+ ${item.label}`
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
