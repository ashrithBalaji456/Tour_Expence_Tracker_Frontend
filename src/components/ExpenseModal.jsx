import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, CheckCircle2, Banknote, Smartphone, CreditCard, HelpCircle } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import CustomDatePicker from './CustomDatePicker';

export default function ExpenseModal({ isOpen, onClose, expenseToEdit, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'FOOD',
    paidBy: 'Trip Pool',
    paymentMode: 'CASH',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'FOOD', label: '🍔 Food & Snacks' },
    { value: 'DRINKS', label: '🧃 Water & Drinks' },
    { value: 'TRANSPORT', label: '🛺 Cab / Auto / Transport' },
    { value: 'ACCOMMODATION', label: '🏨 Hotel / Stay' },
    { value: 'SHOPPING', label: '🛍️ Shopping' },
    { value: 'ENTERTAINMENT', label: '🎟️ Tickets & Fun' },
    { value: 'MISC', label: '📦 Misc' },
  ];

  const paymentModes = [
    { value: 'CASH', label: '💵 Cash', icon: Banknote },
    { value: 'UPI', label: '📱 Online / UPI', icon: Smartphone },
    { value: 'CARD', label: '💳 Card', icon: CreditCard },
  ];

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await expenseApi.getPreTripMembers();
        setMembers(data);
        if (!expenseToEdit && data.length > 0) {
          setFormData((prev) => ({ ...prev, paidBy: data[0].name }));
        }
      } catch (err) {
        console.error('Failed to load members in modal:', err);
      }
    };
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, expenseToEdit]);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title || '',
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || 'FOOD',
        paidBy: expenseToEdit.paidBy || 'Trip Pool',
        paymentMode: expenseToEdit.paymentMode || 'CASH',
        expenseDate: expenseToEdit.expenseDate || new Date().toISOString().split('T')[0],
        notes: expenseToEdit.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'FOOD',
        paidBy: members.length > 0 ? members[0].name : 'Trip Pool',
        paymentMode: 'CASH',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [expenseToEdit, isOpen, members]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      setError('Please fill in title and amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (expenseToEdit) {
        await expenseApi.updateExpense(expenseToEdit.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        await expenseApi.createExpense({
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data || 'Failed to save purchase entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-modal rounded-3xl p-6 md:p-8 w-full max-w-lg relative z-10 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {expenseToEdit ? 'Edit Purchase' : 'Log New Purchase'}
                </h2>
                <p className="text-xs text-slate-400">Record daily trip expenses & bills</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Purchase Title * (e.g., Water Bottle, Lunch, Auto)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Water Bottle, Taxi, Dinner..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Expense Date
                </label>
                <CustomDatePicker
                  value={formData.expenseDate}
                  onChange={(date) => setFormData({ ...formData, expenseDate: date })}
                  placeholder="Select date..."
                />
              </div>
            </div>

            {/* Category Custom Pill Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category *
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan scale-[1.02]'
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Mode Segmented Pill Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Mode *
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10">
                {paymentModes.map((mode) => {
                  const isSelected = formData.paymentMode === mode.value;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMode: mode.value })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? mode.value === 'CASH'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glow-emerald border border-emerald-400/30'
                            : mode.value === 'UPI'
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-glow-violet border border-purple-400/30'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan border border-cyan-400/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Paid By *
              </label>
              {members.length === 0 ? (
                <div className="text-slate-500 text-xs italic">
                  Please add group members in the Pre-Trip Planner to assign payments.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => {
                    const isSelected = formData.paidBy === m.name;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paidBy: m.name })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan scale-[1.02]'
                            : 'bg-slate-950/60 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                  
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paidBy: 'Group' })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      formData.paidBy === 'Group'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-glow-purple scale-[1.02]'
                        : 'bg-slate-950/60 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                    }`}
                  >
                    👥 Shared (Group)
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Bought 4 bottles for group..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 text-white font-bold text-sm shadow-glow-cyan flex items-center gap-2"
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {expenseToEdit ? 'Update Purchase' : 'Log Purchase'}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
