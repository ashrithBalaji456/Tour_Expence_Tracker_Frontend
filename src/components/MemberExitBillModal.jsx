import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Receipt,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import { nativeService } from '../services/nativeService';

const formatDateTime = (isoStr) => {
  if (!isoStr) return 'End of Trip';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function MemberExitBillModal({
  isOpen,
  onClose,
  memberId,
  isReadOnly = false,
  onSettledSuccess
}) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && memberId) {
      loadExitBill();
    } else {
      setBill(null);
      setError('');
    }
  }, [isOpen, memberId]);

  const loadExitBill = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await expenseApi.getMemberExitBill(memberId);
      setBill(data);
    } catch (err) {
      setError('Failed to load exit bill. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setSettling(true);
    setError('');
    try {
      const updated = await expenseApi.checkoutMember(memberId);
      setBill(updated);
      nativeService.hapticSuccess();
      if (onSettledSuccess) {
        onSettledSuccess();
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to settle and check out.');
    } finally {
      setSettling(false);
    }
  };

  const handleShare = async () => {
    if (!bill) return;
    nativeService.hapticLight();

    let text = `🧾 *Early Departure Settlement - ${bill.memberName}*\n`;
    text += `🗓 Stay: ${formatDateTime(bill.effectiveFrom)} ➔ ${formatDateTime(bill.effectiveTo)}\n\n`;

    if (bill.historyAllocations && bill.historyAllocations.length > 0) {
      text += `🏡 *Shared Multi-Day & Past Items:*\n`;
      bill.historyAllocations.forEach((item) => {
        text += `• ${item.title}`;
        if (item.daysCount && item.totalDays) {
          text += ` (${item.daysCount}/${item.totalDays} days)`;
        }
        text += `: ₹${item.allocatedAmount?.toLocaleString()}\n`;
      });
      text += `\n`;
    }

    if (bill.stayExpenses && bill.stayExpenses.length > 0) {
      text += `🍽 *Expenses Incurred During Stay:*\n`;
      bill.stayExpenses.forEach((item) => {
        text += `• ${item.title} (split by ${item.activeMemberCount}): ₹${item.memberShare?.toLocaleString()}\n`;
      });
      text += `\n`;
    }

    text += `💰 *Total Owed:* ₹${bill.totalOwed?.toLocaleString()}\n`;
    text += `💳 *Total Paid Directly:* ₹${bill.totalPaid?.toLocaleString()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    if (bill.netDue > 0) {
      text += `🔴 *Final Settlement Due: ₹${bill.netDue?.toLocaleString()}*\n`;
      text += `👉 Pay to: *${bill.suggestedPayee || 'Admin'}* via UPI\n`;
    } else {
      text += `🟢 *Account Fully Settled (₹0.00)*\n`;
    }

    const res = await nativeService.shareContent({
      title: `${bill.memberName} - Exit Bill`,
      text: text.trim(),
      dialogTitle: `Share Exit Statement for ${bill.memberName}`
    });

    if (res === 'COPIED') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-modal rounded-3xl p-6 md:p-8 w-full max-w-xl relative z-10 shadow-2xl border border-white/10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-glow-amber">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Exit Bill & Departure Settlement</span>
                  {bill?.isDeparted && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Departed & Settled
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  Itemized statement for member leaving mid-trip.
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

          {loading && (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Calculating itemized exit statement...</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && bill && (
            <div className="space-y-5">
              {/* Member & Timeline Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Departing Member</div>
                  <div className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                    <span>{bill.memberName}</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active Stay Window</div>
                  <div className="text-xs font-semibold text-amber-300 mt-0.5">
                    {formatDateTime(bill.effectiveFrom)} ➔ {formatDateTime(bill.effectiveTo)}
                  </div>
                </div>
              </div>

              {/* Section 1: Past / Multi-day Allocations */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Multi-Day Assets & Shared Past Items</span>
                </h4>
                {(!bill.historyAllocations || bill.historyAllocations.length === 0) ? (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-slate-950/40 rounded-xl">
                    No past expenses or multi-day assets allocated to this member.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {bill.historyAllocations.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.daysCount && item.totalDays ? (
                              <span>Prorated: {item.daysCount} of {item.totalDays} days</span>
                            ) : (
                              <span>Allocated from history</span>
                            )}
                            {item.originalAmount && (
                              <span> • Original: ₹{item.originalAmount.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-amber-300">
                            ₹{item.allocatedAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-[11px] font-semibold text-slate-400 pr-1">
                      Prorated Assets Subtotal: <strong className="text-white">₹{bill.totalAllocatedFromHistory?.toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Regular Expenses During Stay */}
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2. Regular Expenses During Stay</span>
                </h4>
                {(!bill.stayExpenses || bill.stayExpenses.length === 0) ? (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-slate-950/40 rounded-xl">
                    No daily expenses recorded during their stay window.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {bill.stayExpenses.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">
                            <span>{item.category}</span>
                            <span> • Split by {item.activeMemberCount}</span>
                            <span> • Paid by {item.paidBy || 'Group'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-cyan-300">
                            ₹{item.memberShare?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-[11px] font-semibold text-slate-400 pr-1">
                      Stay Expenses Subtotal: <strong className="text-white">₹{bill.totalStayExpensesShare?.toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Settlement Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 shadow-glow-amber">
                <div className="space-y-1.5 text-xs pb-3 border-b border-white/10">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Cost Owed:</span>
                    <strong className="text-white">₹{bill.totalOwed?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Paid Directly by Member:</span>
                    <strong className="text-emerald-400">- ₹{bill.totalPaid?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Net Settlement Required
                    </div>
                    <div className="text-xl font-extrabold text-white mt-0.5">
                      ₹{Math.max(0, bill.netDue || 0).toLocaleString()}
                    </div>
                  </div>
                  {bill.netDue > 0 ? (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Pay To:</div>
                      <div className="text-xs font-bold text-cyan-300">{bill.suggestedPayee} (Admin)</div>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      All Dues Cleared
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 py-2.5 rounded-xl btn-premium btn-secondary text-xs flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'Copied Statement!' : 'Share Statement'}
                </button>

                {!isReadOnly && !bill.isDeparted && (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={settling}
                    className="flex-1 py-2.5 rounded-xl btn-premium btn-cyan text-xs shadow-glow-cyan flex items-center justify-center gap-2 font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {settling ? 'Settling...' : 'Mark Settled & Check Out'}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

