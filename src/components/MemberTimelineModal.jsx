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
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check
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

  // Departure settings
  const [hasDepartureDate, setHasDepartureDate] = useState(false);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [departureTime, setDepartureTime] = useState('12:00');

  // History Allocations (House, Car, Groceries, etc.)
  const [historyItems, setHistoryItems] = useState([]);
  const [showHistorySection, setShowHistorySection] = useState(false);
  const [allocations, setAllocations] = useState({}); // key: `${sourceType}_${id}` -> { selected, daysCount, totalDays, amount, title, originalAmount }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load member data and trip history items
  useEffect(() => {
    if (isOpen) {
      expenseApi.getTripHistoryItems()
        .then((items) => setHistoryItems(items || []))
        .catch(() => setHistoryItems([]));
    }

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

      if (memberToEdit.effectiveTo) {
        setHasDepartureDate(true);
        const parts = memberToEdit.effectiveTo.split('T');
        if (parts[0]) setDepartureDate(parts[0]);
        if (parts[1]) setDepartureTime(parts[1].substring(0, 5));
      } else {
        setHasDepartureDate(false);
      }

      // Initialize existing allocations
      if (memberToEdit.allocations && memberToEdit.allocations.length > 0) {
        const allocMap = {};
        memberToEdit.allocations.forEach((a) => {
          const key = `${a.sourceType}_${a.expenseId}`;
          allocMap[key] = {
            selected: true,
            daysCount: a.daysCount || 2,
            totalDays: a.totalDays || 7,
            amount: a.allocatedAmount || 0,
            title: a.title,
            originalAmount: a.originalAmount
          };
        });
        setAllocations(allocMap);
        setShowHistorySection(true);
      } else {
        setAllocations({});
      }
    } else {
      setName('');
      setBudgetLimit('10000');
      setSplitMode('FROM_NOW'); // Default for mid-trip adds is "from right now"
      const now = new Date();
      setCustomDate(now.toISOString().split('T')[0]);
      setCustomTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setHasDepartureDate(false);
      setAllocations({});
      setShowHistorySection(false);
    }
    setError('');
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  // Toggle inclusion of an expense from history
  const handleToggleHistoryItem = (item) => {
    const key = `${item.sourceType}_${item.id}`;
    setAllocations((prev) => {
      const existing = prev[key];
      if (existing && existing.selected) {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      // Default prorating calculation: 2 days out of 7 days, divided by approx 6 members
      const daysCount = 2;
      const totalDays = 7;
      const approxShare = Math.round(((item.amount / totalDays) * daysCount) / 6);

      return {
        ...prev,
        [key]: {
          selected: true,
          daysCount: daysCount,
          totalDays: totalDays,
          amount: approxShare > 0 ? approxShare : Math.round(item.amount / 6),
          title: item.title,
          originalAmount: item.amount,
          sourceType: item.sourceType,
          expenseId: item.id
        }
      };
    });
  };

  const handleUpdateAllocationDays = (key, item, days) => {
    const numDays = Math.max(1, parseInt(days) || 1);
    setAllocations((prev) => {
      const current = prev[key] || {};
      const totalDays = current.totalDays || 7;
      const calculatedShare = Math.round(((item.amount / totalDays) * numDays) / 6);
      return {
        ...prev,
        [key]: {
          ...current,
          daysCount: numDays,
          amount: calculatedShare > 0 ? calculatedShare : current.amount
        }
      };
    });
  };

  const handleUpdateAllocationAmount = (key, amount) => {
    const numAmt = Math.max(0, parseFloat(amount) || 0);
    setAllocations((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        amount: numAmt
      }
    }));
  };

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

    let effectiveTo = null;
    if (hasDepartureDate) {
      const depDatePart = departureDate || new Date().toISOString().split('T')[0];
      const depTimePart = departureTime ? (departureTime.length === 5 ? `${departureTime}:00` : departureTime) : '12:00:00';
      effectiveTo = `${depDatePart}T${depTimePart}`;
    }

    // Prepare allocations payload
    const allocationsPayload = Object.entries(allocations)
      .filter(([_, val]) => val && val.selected && val.amount > 0)
      .map(([key, val]) => {
        const parts = key.split('_');
        const sourceType = parts[0];
        const expenseId = parseInt(parts[1]);
        return {
          expenseId: expenseId,
          sourceType: sourceType,
          title: val.title,
          originalAmount: val.originalAmount,
          allocatedAmount: val.amount,
          daysCount: val.daysCount,
          totalDays: val.totalDays,
          notes: `Shared ${val.daysCount || 0} days`
        };
      });

    try {
      const payload = {
        name: name.trim(),
        budgetLimit: parseFloat(budgetLimit) || 10000,
        splitMode: splitMode,
        effectiveFrom: effectiveFrom,
        effectiveTo: effectiveTo,
        allocations: allocationsPayload
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
                    ? 'Configure stay window and prorate multi-day assets from history.'
                    : 'Invite a friend mid-trip, set stay duration, and share house/car costs.'}
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
                      <span className="text-xs font-bold text-white">From Right Now (Joined Today)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Only splits expenses added after this exact moment. All past bills before now are ₹0.00.
                    </p>
                  </div>
                </label>

                {/* Option 3: CUSTOM_DATE */}
                <label
                  onClick={() => setSplitMode('CUSTOM_DATE')}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    splitMode === 'CUSTOM_DATE'
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-glow-emerald'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'CUSTOM_DATE'}
                    onChange={() => setSplitMode('CUSTOM_DATE')}
                    className="mt-1 accent-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Custom Specific Date & Time</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Explicitly define the starting day and time they arrived at the trip.
                    </p>
                  </div>
                </label>
              </div>

              {/* Date & Time Picker */}
              {splitMode === 'CUSTOM_DATE' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                        Arrival Date
                      </label>
                      <CustomDatePicker
                        value={customDate}
                        onChange={(val) => setCustomDate(val)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                        Arrival Time
                      </label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono text-emerald-200"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Departure / Leaving Date Section */}
            <div className="pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={hasDepartureDate}
                  onChange={(e) => setHasDepartureDate(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-white">
                  Member is leaving early (Set Departure Date)
                </span>
              </label>

              {hasDepartureDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3"
                >
                  <p className="text-[11px] text-slate-300">
                    Expenses added after this date & time will NOT be charged to this member.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                        Departure Date
                      </label>
                      <CustomDatePicker
                        value={departureDate}
                        onChange={(val) => setDepartureDate(val)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                        Departure Time
                      </label>
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono text-amber-200"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Share Past Expenses from History (House Rent, Car, Groceries) */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowHistorySection(!showHistorySection)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 text-xs font-bold text-white flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Share Past Expenses (House, Car, Groceries)</span>
                  {Object.keys(allocations).length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-extrabold">
                      {Object.keys(allocations).length} selected
                    </span>
                  )}
                </div>
                {showHistorySection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHistorySection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-3 p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 max-h-60 overflow-y-auto pr-1"
                >
                  <p className="text-[11px] text-slate-400">
                    Select any past expenses recorded in the trip that this guest should also pay for (prorated by days):
                  </p>

                  {historyItems.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic text-center py-2">
                      No previous expenses recorded in history yet.
                    </p>
                  ) : (
                    historyItems.map((item) => {
                      const key = `${item.sourceType}_${item.id}`;
                      const isSelected = Boolean(allocations[key]?.selected);
                      const allocData = allocations[key] || {};

                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-500/40'
                              : 'bg-slate-900/50 border-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleHistoryItem(item)}
                                className="mt-1 accent-cyan-400"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{item.title}</div>
                                <div className="text-[10px] text-slate-400">
                                  <span>Total: ₹{item.amount?.toLocaleString()}</span>
                                  <span> • Payer: {item.paidBy || 'Group'}</span>
                                </div>
                              </div>
                            </label>

                            {isSelected && (
                              <span className="text-xs font-extrabold text-cyan-300">
                                ₹{allocData.amount?.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {isSelected && (
                            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">Days used:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="30"
                                  value={allocData.daysCount || 2}
                                  onChange={(e) => handleUpdateAllocationDays(key, item, e.target.value)}
                                  className="w-12 glass-input px-1.5 py-1 text-center font-bold text-white text-xs rounded-lg"
                                />
                                <span className="text-[10px] text-slate-500">of 7 days</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">Share ₹:</span>
                                <input
                                  type="number"
                                  step="10"
                                  value={allocData.amount || 0}
                                  onChange={(e) => handleUpdateAllocationAmount(key, e.target.value)}
                                  className="w-20 glass-input px-2 py-1 text-right font-extrabold text-cyan-300 text-xs rounded-lg"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl btn-premium btn-violet text-sm font-bold shadow-glow-violet flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Saving Changes...' : isEditing ? 'Update Member & Split' : 'Add Mid-Trip Member'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
