import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserPlus,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import { nativeService } from '../services/nativeService';
import CustomDatePicker from './CustomDatePicker';

export default function MemberTimelineModal({
  isOpen,
  onClose,
  memberToEdit = null,
  onSuccess
}) {
  const isEditing = Boolean(memberToEdit);

  const [name, setName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('10000');
  const [splitMode, setSplitMode] = useState('FROM_START'); // 'FROM_START' | 'FROM_NOW' | 'CUSTOM_DATE'
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setBudgetLimit(String(memberToEdit.budgetLimit || 10000));
      if (memberToEdit.splitMode) {
        setSplitMode(memberToEdit.splitMode);
      } else if (memberToEdit.effectiveFrom) {
        setSplitMode('CUSTOM_DATE');
      } else {
        setSplitMode('FROM_START');
      }

      if (memberToEdit.effectiveFrom) {
        const parts = memberToEdit.effectiveFrom.split('T');
        if (parts[0]) setCustomDate(parts[0]);
        if (parts[1]) setCustomTime(parts[1].substring(0, 5));
      }
    } else {
      setName('');
      setBudgetLimit('10000');
      setSplitMode('FROM_NOW'); // Default for mid-trip adds is "from right now"
      const now = new Date();
      setCustomDate(now.toISOString().split('T')[0]);
      setCustomTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }
    setError('');
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a member name or username.');
      return;
    }

    setLoading(true);
    setError('');

    let effectiveFrom = null;
    if (splitMode === 'FROM_NOW') {
      const now = new Date();
      effectiveFrom = now.toISOString().replace('Z', '').split('.')[0];
    } else if (splitMode === 'CUSTOM_DATE') {
      const datePart = customDate || new Date().toISOString().split('T')[0];
      const timePart = customTime ? (customTime.length === 5 ? `${customTime}:00` : customTime) : '12:00:00';
      effectiveFrom = `${datePart}T${timePart}`;
    }

    try {
      const payload = {
        name: name.trim(),
        budgetLimit: parseFloat(budgetLimit) || 10000,
        splitMode: splitMode,
        effectiveFrom: effectiveFrom
      };

      if (isEditing) {
        await expenseApi.updateMemberTimeline(memberToEdit.id, payload);
      } else {
        await expenseApi.savePreTripMember(payload);
      }

      nativeService.hapticSuccess();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data || 'Failed to save member details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-modal rounded-3xl p-6 md:p-8 w-full max-w-lg relative z-10 shadow-2xl border border-white/10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-violet">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {isEditing ? 'Edit Member & Split Timeline' : 'Add Mid-Trip Member'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isEditing
                    ? 'Adjust budget or change when this member started participating.'
                    : 'Invite a friend mid-trip and choose when their expense sharing begins.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Member Name / Username *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEditing}
                placeholder="e.g. Rahul, Sneha, arjun45"
                className={`w-full glass-input rounded-xl px-4 py-2.5 text-sm ${
                  isEditing ? 'opacity-70 cursor-not-allowed bg-slate-900/50' : ''
                }`}
                required
              />
              {isEditing && (
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  Member username is locked to protect linked accounts and expense receipts.
                </p>
              )}
            </div>

            {/* Individual Budget Limit */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Personal Budget Limit (₹)</span>
                <span className="text-[11px] text-violet-400 font-semibold">Max budget target</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="100"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="10000"
                  className="w-full glass-input rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-violet-300"
                  required
                />
              </div>
            </div>

            {/* Participation Split Mode */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>When does this person start taking part in expenses?</span>
              </label>

              <div className="space-y-2">
                {/* Option 1: FROM_START */}
                <label
                  onClick={() => setSplitMode('FROM_START')}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    splitMode === 'FROM_START'
                      ? 'bg-violet-500/15 border-violet-500/50 shadow-glow-violet'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'FROM_START'}
                    onChange={() => setSplitMode('FROM_START')}
                    className="mt-1 accent-violet-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">From Starting of Trip</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Retroactive full share. Takes part in 100% of past and future expenses from Day 1.
                    </p>
                  </div>
                </label>

                {/* Option 2: FROM_NOW */}
                <label
                  onClick={() => setSplitMode('FROM_NOW')}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    splitMode === 'FROM_NOW'
                      ? 'bg-cyan-500/15 border-cyan-500/50 shadow-glow-cyan'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'FROM_NOW'}
                    onChange={() => setSplitMode('FROM_NOW')}
                    className="mt-1 accent-cyan-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">From Right Now (Current Time)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Shares all purchases logged from this moment forward. Past expenses remain strictly with earlier members.
                    </p>
                  </div>
                </label>

                {/* Option 3: CUSTOM_DATE */}
                <label
                  onClick={() => setSplitMode('CUSTOM_DATE')}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    splitMode === 'CUSTOM_DATE'
                      ? 'bg-purple-500/15 border-purple-500/50 shadow-glow-purple'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'CUSTOM_DATE'}
                    onChange={() => setSplitMode('CUSTOM_DATE')}
                    className="mt-1 accent-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">From Specific Day & Time</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Specify the exact flight/train arrival date and time when this friend joined.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Date & Time Inputs (Shown if CUSTOM_DATE selected) */}
            {splitMode === 'CUSTOM_DATE' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/30"
              >
                <div>
                  <label className="block text-[11px] font-medium text-purple-200 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Joining Date
                  </label>
                  <CustomDatePicker
                    value={customDate}
                    onChange={(date) => setCustomDate(date)}
                    placeholder="Select date..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-purple-200 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Joining Time
                  </label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Transparency Note */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Fair & Transparent Splitting:</strong> The app will automatically exclude any bills incurred before this person's join time. This timestamp is fully editable by the host at any point during the trip.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl btn-premium btn-secondary text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl btn-premium btn-cyan text-xs shadow-glow-cyan flex items-center gap-2 transition-all font-bold"
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {isEditing ? 'Save Timeline' : 'Add Member'}
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

