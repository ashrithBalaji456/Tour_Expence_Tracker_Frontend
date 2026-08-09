import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import QuickWaterButton from './components/QuickWaterButton';
import ExpenseList from './components/ExpenseList';
import AnalyticsCharts from './components/AnalyticsCharts';
import ExpenseModal from './components/ExpenseModal';
import FundModal from './components/FundModal';
import FundHistoryModal from './components/FundHistoryModal';
import PreTripPlanner from './components/PreTripPlanner';
import CalculatorWidget from './components/CalculatorWidget';
import AuthScreens from './components/AuthScreens';
import { expenseApi } from './api/expenseApi';
import { Users, TrendingUp, ArrowRight } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token') && !!localStorage.getItem('activeGroupId')
  );
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [funds, setFunds] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isFundHistoryOpen, setIsFundHistoryOpen] = useState(false);
  const [fundHistoryFilter, setFundHistoryFilter] = useState('ALL');
  const [settlingTransfer, setSettlingTransfer] = useState(null);
  const [settleAmountInput, setSettleAmountInput] = useState('');

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'pretrip'
  const [loading, setLoading] = useState(true);

  const handleOpenFundHistory = (filter = 'ALL') => {
    setFundHistoryFilter(filter);
    setIsFundHistoryOpen(true);
  };

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const summaryData = await expenseApi.getSummary();
      setSummary(summaryData);

      const fundsData = await expenseApi.getAllFunds();
      setFunds(fundsData);

      let expenseData = [];
      if (selectedDate) {
        expenseData = await expenseApi.getExpensesByDate(selectedDate);
      } else if (selectedCategory !== 'ALL') {
        expenseData = await expenseApi.getExpensesByCategory(selectedCategory);
      } else {
        expenseData = await expenseApi.getAllExpenses();
      }

      setExpenses(expenseData);
    } catch (err) {
      console.error('Failed to load data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCategory, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [loadData, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('activeGroupId');
    setIsAuthenticated(false);
    setSummary(null);
    setExpenses([]);
  };

  const handleSwitchTrip = () => {
    localStorage.removeItem('activeGroupId');
    setIsAuthenticated(false);
    setSummary(null);
    setExpenses([]);
  };

  if (!isAuthenticated) {
    return (
      <AuthScreens
        onAuthSuccess={(data) => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const handleOpenExpenseModal = (expense = null) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase entry?')) {
      try {
        await expenseApi.deleteExpense(id);
        loadData();
      } catch (err) {
        alert(err.response?.data || 'Failed to delete expense.');
      }
    }
  };

  const handleOpenSettle = (transfer) => {
    setSettlingTransfer(transfer);
    setSettleAmountInput(transfer.amount.toString());
  };

  const handleConfirmSettle = async (amountToSettle) => {
    if (!amountToSettle || isNaN(parseFloat(amountToSettle)) || parseFloat(amountToSettle) <= 0) {
      alert("Please enter a valid positive settlement amount.");
      return;
    }
    try {
      await expenseApi.createExpense({
        title: `Settlement: ${settlingTransfer.fromMember} to ${settlingTransfer.toMember}`,
        amount: parseFloat(amountToSettle),
        category: 'SETTLEMENT',
        paymentMode: 'CASH',
        paidBy: settlingTransfer.fromMember,
        expenseDate: new Date().toISOString().split('T')[0],
        notes: `Settle:${settlingTransfer.fromMember}:${settlingTransfer.toMember}`
      });
      setSettlingTransfer(null);
      loadData();
    } catch (err) {
      alert(err.response?.data || 'Failed to record settlement.');
    }
  };

  const isReadOnly = summary?.isReadOnly || summary?.readOnly || false;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
      {currentView === 'pretrip' ? (
        <PreTripPlanner onBack={() => {
          setCurrentView('dashboard');
          loadData(); // reload dashboard metrics in case members or data sync is needed
        }} />
      ) : (
        <>
          {/* Read-Only Warning Banner */}
          {isReadOnly && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-glow-amber">
              <span>⚠️ Read-Only Mode: You are viewing this trip as a group member. Only the creator can log purchases or edit budgets.</span>
            </div>
          )}

          {/* 1. Header */}
          <Header
            summary={summary}
            onOpenExpenseModal={() => handleOpenExpenseModal(null)}
            onOpenFundModal={() => setIsFundModalOpen(true)}
            onOpenFundHistory={() => handleOpenFundHistory('ALL')}
            onOpenPreTrip={() => setCurrentView('pretrip')}
            onLogout={handleLogout}
            onSwitchTrip={handleSwitchTrip}
          />

          {/* 2. Metric Summary Cards */}
          <SummaryCards
            summary={summary}
            onOpenFundHistory={(filter) => handleOpenFundHistory(filter)}
          />

          {/* 3. 1-Tap Express Purchases (Water bottle, Snacks, Cab) */}
          {!isReadOnly && <QuickWaterButton onExpenseAdded={loadData} />}

          {/* 4. Analytics & Spending Breakdown */}
          <AnalyticsCharts summary={summary} expenses={expenses} />

          {/* 5. Trip Split Settlements Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                Trip Settlements (Who owes whom)
              </h3>
              <div className="space-y-3">
                {summary?.transfers?.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-700/60 rounded-2xl">
                    <p className="text-slate-400 text-sm italic">All settled. Everyone has spent equally!</p>
                  </div>
                ) : (
                  summary?.transfers?.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs sm:text-sm gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-300">{t.fromMember}</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-emerald-400">{t.toMember}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-white text-base font-black">₹{t.amount.toLocaleString()}</strong>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleOpenSettle(t)}
                            className="px-2.5 py-1 rounded-lg btn-premium bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-[10px] font-bold transition-all"
                          >
                            Settle
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Member Budget Status
              </h3>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {summary?.memberSummaries?.map((m) => {
                  const isCreditor = m.netBalance > 0;
                  return (
                    <div key={m.memberName} className="p-3 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                      <div>
                        <span className="font-bold text-white">{m.memberName}</span>
                        <p className="text-[10px] sm:text-xs text-slate-400">Total Spent: ₹{m.totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${isCreditor ? 'text-emerald-400' : m.netBalance === 0 ? 'text-slate-400' : 'text-purple-300'}`}>
                          {isCreditor ? '+' : ''}₹{m.netBalance.toLocaleString()}
                        </span>
                        <p className="text-[9px] sm:text-[10px] text-slate-400">Budget: ₹{m.budgetLimit.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Transactions List with Date & Category Filter */}
          <ExpenseList
            expenses={expenses}
            selectedDate={selectedDate}
            onDateChange={(date) => setSelectedDate(date)}
            onClearDate={() => setSelectedDate('')}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => setSelectedCategory(cat)}
            onEditExpense={(exp) => handleOpenExpenseModal(exp)}
            onDeleteExpense={handleDeleteExpense}
            isReadOnly={isReadOnly}
          />
        </>
      )}

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseToEdit={expenseToEdit}
        onSaveSuccess={loadData}
      />

      <FundModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onSaveSuccess={loadData}
      />

      <FundHistoryModal
        isOpen={isFundHistoryOpen}
        onClose={() => setIsFundHistoryOpen(false)}
        funds={funds}
        initialFilter={fundHistoryFilter}
        onDeleteFundSuccess={loadData}
      />
      {settlingTransfer && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettlingTransfer(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-modal rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl border border-white/10"
            >
              <h3 className="text-base font-bold text-white mb-3">🤝 Record Debt Settlement</h3>
              <p className="text-xs text-slate-400 mb-4">
                Confirm payment from <strong className="text-purple-300">{settlingTransfer.fromMember}</strong> to <strong className="text-emerald-400">{settlingTransfer.toMember}</strong>.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Settlement Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settleAmountInput}
                    onChange={(e) => setSettleAmountInput(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-400"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Remaining debt: ₹{settlingTransfer.amount.toLocaleString()}</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlingTransfer(null)}
                    className="flex-1 py-2 rounded-xl btn-premium btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmSettle(settleAmountInput)}
                    className="flex-grow py-2 rounded-xl btn-premium btn-cyan text-xs shadow-glow-cyan"
                  >
                    Confirm Settle
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Floating On-Spot Calculator Widget */}
      <CalculatorWidget />
    </div>
  );
}
