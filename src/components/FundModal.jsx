import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, CheckCircle2, Smartphone, Banknote } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import CustomDatePicker from './CustomDatePicker';

export default function FundModal({ isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    contributorName: '',
    amount: '',
    paymentMode: 'CASH',
    contributionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contributorName || !formData.amount) {
      setError('Please fill in contributor name and amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await expenseApi.addFund({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      onSaveSuccess();
      onClose();
      setFormData({
        contributorName: '',
        amount: '',
        paymentMode: 'CASH',
        contributionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add fund contribution');
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

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-modal rounded-3xl p-6 md:p-8 w-full max-w-md relative z-10 shadow-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Cash Pool Fund</h2>
                <p className="text-xs text-slate-400">Collect money from members into the trip budget</p>
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
                Contributor Name *
              </label>
              <input
                type="text"
                name="contributorName"
                value={formData.contributorName}
                onChange={handleChange}
                placeholder="Ashrith, Group Cash Pool..."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Deposit Type *
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMode: 'CASH' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    formData.paymentMode === 'CASH'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glow-emerald border border-emerald-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  Physical Cash
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMode: 'UPI' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    formData.paymentMode === 'UPI'
                      ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-glow-violet border border-purple-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Online / UPI
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Deposit Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contribution Date
                </label>
                <div>
                  <CustomDatePicker
                    value={formData.contributionDate}
                    onChange={(date) => setFormData({ ...formData, contributionDate: date })}
                    placeholder="Select contribution date..."
                  />
                </div>
              </div>
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
                placeholder="Initial collection for July 30th trip"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl btn-premium btn-secondary text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl btn-premium bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glow-emerald text-sm flex items-center gap-2 transition-all"
              >
                {loading ? (
                  <>Adding...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Deposit Fund
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
