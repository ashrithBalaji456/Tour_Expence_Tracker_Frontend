import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Search, Trash2, Calendar, User, Wallet, Smartphone, ArrowLeftRight, Layers } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';

const renderNotesWithLinks = (text) => {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline font-bold transition-all hover:scale-105 inline-block mx-0.5"
        >
          {part.length > 25 ? part.substring(0, 25) + '...' : part}
        </a>
      );
    }
    return part;
  });
};

export default function FundHistoryModal({ isOpen, onClose, funds, initialFilter = 'ALL', onDeleteFundSuccess }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(initialFilter); // 'ALL' | 'CASH' | 'ONLINE'
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialFilter);
    }
  }, [isOpen, initialFilter]);

  if (!isOpen) return null;

  // Filter funds by activeTab + searchQuery
  const filteredFunds = funds.filter((fund) => {
    const isCash = fund.paymentMode === 'CASH' || !fund.paymentMode;
    const isOnline = fund.paymentMode === 'UPI' || fund.paymentMode === 'CARD' || fund.paymentMode === 'OTHER';

    if (activeTab === 'CASH' && !isCash) return false;
    if (activeTab === 'ONLINE' && !isOnline) return false;

    const matchesSearch = fund.contributorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fund.notes && fund.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const totalCashDeposited = funds
    .filter((f) => f.paymentMode === 'CASH' || !f.paymentMode)
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const totalOnlineDeposited = funds
    .filter((f) => f.paymentMode === 'UPI' || f.paymentMode === 'CARD' || f.paymentMode === 'OTHER')
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const handleTogglePaymentMode = async (fund) => {
    const currentMode = fund.paymentMode || 'CASH';
    const newMode = currentMode === 'CASH' ? 'UPI' : 'CASH';

    setUpdatingId(fund.id);
    try {
      await expenseApi.updateFund(fund.id, {
        contributorName: fund.contributorName,
        amount: fund.amount,
        paymentMode: newMode,
        contributionDate: fund.contributionDate,
        notes: fund.notes,
      });
      onDeleteFundSuccess();
    } catch (err) {
      console.error('Failed to toggle deposit payment mode:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deposit entry?')) {
      setDeletingId(id);
      try {
        await expenseApi.deleteFund(id);
        onDeleteFundSuccess();
      } catch (err) {
        console.error('Failed to delete fund entry:', err);
      } finally {
        setDeletingId(null);
      }
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
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-modal rounded-3xl p-6 md:p-8 w-full max-w-2xl relative z-10 shadow-2xl border border-white/10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === 'CASH' ? '💵 Cash Deposit History' : activeTab === 'ONLINE' ? '📱 Online / UPI Deposit History' : 'Deposit History'}
                </h2>
                <p className="text-xs text-slate-400">View & manage persons who added cash or online money</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-4 shrink-0">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CASH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'CASH'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Cash (₹{totalCashDeposited.toLocaleString('en-IN')})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ONLINE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ONLINE'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                Online (₹{totalOnlineDeposited.toLocaleString('en-IN')})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contributor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input rounded-xl pl-9 pr-4 py-1.5 text-xs w-full sm:w-44"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto pr-1 space-y-3 flex-1">
            {filteredFunds.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-700/60 rounded-2xl">
                <p className="text-slate-400 text-sm">
                  {activeTab === 'CASH' ? 'No Physical Cash deposits found.' : activeTab === 'ONLINE' ? 'No Online / UPI deposits found.' : 'No deposit history found.'}
                </p>
                <p className="text-slate-500 text-xs mt-1">Use "Add Cash Pool" to deposit money.</p>
              </div>
            ) : (
              filteredFunds.map((fund, index) => {
                const isCash = fund.paymentMode === 'CASH' || !fund.paymentMode;

                return (
                  <motion.div
                    key={fund.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${isCash ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'} font-bold text-sm shrink-0 border`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">
                            {fund.contributorName}
                          </h4>

                          {/* Toggle Badge */}
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentMode(fund)}
                            disabled={updatingId === fund.id}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all hover:scale-105 ${
                              isCash
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-200 border-purple-500/40 hover:bg-purple-500/30'
                            }`}
                            title="Click to switch between Cash and Online"
                          >
                            <span>{isCash ? '💵 Physical Cash' : '📱 Online / UPI'}</span>
                            <ArrowLeftRight className="w-3 h-3 opacity-70" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {fund.contributionDate}
                          </span>
                          {fund.notes && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-300">"{renderNotesWithLinks(fund.notes)}"</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-base md:text-lg font-extrabold ${isCash ? 'text-emerald-400' : 'text-purple-300'}`}>
                        + ₹{parseFloat(fund.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleDelete(fund.id)}
                        disabled={deletingId === fund.id}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete deposit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
