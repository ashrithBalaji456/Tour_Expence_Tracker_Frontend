import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, Filter, Trash2, Edit3, TrendingDown,
  Droplet, Coffee, Car, Home, ShoppingBag, Ticket, Box, CreditCard, DollarSign, Smartphone, CheckCircle,
  ChevronDown
} from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const SORT_OPTIONS = [
  { value: 'DATE_DESC', label: '📅 Date (Newest)' },
  { value: 'DATE_ASC', label: '📅 Date (Oldest)' },
  { value: 'NAME_ASC', label: '🔤 Name (A-Z)' },
  { value: 'NAME_DESC', label: '🔤 Name (Z-A)' },
  { value: 'AMOUNT_DESC', label: '💰 Amount (High to Low)' },
  { value: 'AMOUNT_ASC', label: '💰 Amount (Low to High)' },
];

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'FOOD', label: '🍕 Food' },
  { value: 'DRINKS', label: '💧 Drinks & Water' },
  { value: 'TRANSPORT', label: '🚕 Transport' },
  { value: 'ACCOMMODATION', label: '🏨 Stay' },
  { value: 'SHOPPING', label: '🛍️ Shopping' },
  { value: 'ENTERTAINMENT', label: '🎟️ Entertainment' },
  { value: 'MISC', label: '📦 Misc' },
];

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
          onClick={(e) => e.stopPropagation()} // Prevent card click triggers
        >
          {part.length > 25 ? part.substring(0, 25) + '...' : part}
        </a>
      );
    }
    return part;
  });
};

export default function ExpenseList({
  expenses,
  selectedDate,
  onDateChange,
  onClearDate,
  selectedCategory,
  onCategoryChange,
  onEditExpense,
  onDeleteExpense,
  isReadOnly = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DATE_DESC');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  const sortRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSortOptionLabel = (val) => {
    const found = SORT_OPTIONS.find(opt => opt.value === val);
    return found ? found.label : '📅 Date (Newest)';
  };

  const getCategoryOptionLabel = (val) => {
    const found = CATEGORY_OPTIONS.find(opt => opt.value === val);
    return found ? found.label : 'All Categories';
  };

  // Category Icon Mapping
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'DRINKS': return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'FOOD': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'TRANSPORT': return <Car className="w-4 h-4 text-emerald-400" />;
      case 'ACCOMMODATION': return <Home className="w-4 h-4 text-violet-400" />;
      case 'SHOPPING': return <ShoppingBag className="w-4 h-4 text-rose-400" />;
      case 'ENTERTAINMENT': return <Ticket className="w-4 h-4 text-yellow-400" />;
      case 'SETTLEMENT': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      default: return <Box className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'DRINKS': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'FOOD': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'TRANSPORT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ACCOMMODATION': return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'SHOPPING': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'ENTERTAINMENT': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'SETTLEMENT': return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  const getPaymentModeIcon = (mode) => {
    switch (mode) {
      case 'CASH': return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'UPI': return <Smartphone className="w-3.5 h-3.5 text-purple-400" />;
      case 'CARD': return <CreditCard className="w-3.5 h-3.5 text-blue-400" />;
      default: return null;
    }
  };

  // Local text search filter
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.paidBy && exp.paidBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'NAME_ASC') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'NAME_DESC') {
      return (b.title || '').localeCompare(a.title || '');
    }
    if (sortBy === 'AMOUNT_DESC') {
      return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
    }
    if (sortBy === 'AMOUNT_ASC') {
      return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
    }
    if (sortBy === 'DATE_ASC') {
      return (a.expenseDate || '').localeCompare(b.expenseDate || '');
    }
    // DATE_DESC (default)
    return (b.expenseDate || '').localeCompare(a.expenseDate || '');
  });

  const totalFilteredAmount = filteredExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  );

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 mb-8 border border-white/10">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-white tracking-tight">Daily Purchases & Bills</h2>
            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 shadow-glow-rose">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              {selectedDate ? `Day Total (${selectedDate}):` : 'Filtered Total:'} ₹{totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Showing {filteredExpenses.length} transactions logged {selectedDate ? `for ${selectedDate}` : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input rounded-xl pl-9 pr-4 py-2 text-xs w-44 md:w-56"
            />
          </div>

          {/* Date Filter (Uses GET /api/expenses/date/{date}) */}
          <CustomDatePicker
            value={selectedDate}
            onChange={(date) => onDateChange(date)}
            placeholder="Filter by date..."
          />

          {/* Category Filter */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 glass-input px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white font-medium hover:bg-white/5 transition-all select-none"
            >
              <Filter className="w-4 h-4 text-violet-400" />
              <span>{getCategoryOptionLabel(selectedCategory)}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-[100] py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onCategoryChange(opt.value);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2 hover:bg-white/10 ${
                      selectedCategory === opt.value ? 'text-violet-400 font-bold bg-white/5' : 'text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 glass-input px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white font-medium hover:bg-white/5 transition-all select-none"
            >
              <span className="text-slate-400 font-semibold">Sort:</span>
              <span>{getSortOptionLabel(sortBy)}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md z-[100] py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2 hover:bg-white/10 ${
                      sortBy === opt.value ? 'text-violet-400 font-bold bg-white/5' : 'text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List / Cards */}
      {sortedExpenses.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-700/60 rounded-2xl">
          <p className="text-slate-400 text-sm font-medium">No purchases logged for this selection.</p>
          <p className="text-slate-500 text-xs mt-1">
            Log a new purchase or quick-tap a water bottle above!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="glass-card glass-card-hover rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5"
              >
                <div className="flex items-start md:items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${getCategoryBadgeClass(expense.category)} shrink-0`}>
                    {getCategoryIcon(expense.category)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm md:text-base">
                        {expense.title}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(expense.category)} flex items-center gap-1`}>
                        {expense.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {expense.expenseDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                        {getPaymentModeIcon(expense.paymentMode)}
                        {expense.paymentMode}
                      </span>
                      <span>•</span>
                      <span>Paid by <strong className="text-slate-200">{expense.paidBy || 'Group Pool'}</strong></span>
                    </div>

                    {expense.notes && (
                      <p className="text-xs text-slate-400/80 italic mt-1 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-white/5 inline-block">
                        "{renderNotesWithLinks(expense.notes)}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                  <div className="text-right">
                    <span className="text-lg md:text-xl font-black text-white tracking-tight">
                      ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-2 rounded-xl hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Edit expense"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
