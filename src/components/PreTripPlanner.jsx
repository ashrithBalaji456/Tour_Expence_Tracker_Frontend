import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Trash2,
  User,
  Wallet,
  DollarSign,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import CustomDatePicker from './CustomDatePicker';

const renderNotesWithLinks = (text) => {
  if (!text) return '-';
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

export default function PreTripPlanner({ onBack }) {
  // Members & Expenses data
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    sharePerMember: 0,
    memberSummaries: [],
    transfers: []
  });

  // UI state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBudget, setNewMemberBudget] = useState('10000');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingBudgetVal, setEditingBudgetVal] = useState('');

  // Expense Form state
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    spentBy: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load all pre-trip data
  const loadPreTripData = useCallback(async () => {
    try {
      setLoading(true);
      const membersData = await expenseApi.getPreTripMembers();
      setMembers(membersData);

      const expensesData = await expenseApi.getPreTripExpenses();
      setExpenses(expensesData);

      const summaryData = await expenseApi.getPreTripSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load pre-trip data:', err);
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreTripData();
  }, [loadPreTripData]);

  // Member Operations
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setError('');
    setSuccessMsg('');
    try {
      await expenseApi.savePreTripMember({
        name: newMemberName.trim(),
        budgetLimit: parseFloat(newMemberBudget) || 10000
      });
      setNewMemberName('');
      setNewMemberBudget('10000');
      setSuccessMsg('Member added successfully!');
      loadPreTripData();
    } catch (err) {
      setError(err.response?.data || 'Failed to add group member.');
    }
  };

  const handleUpdateBudget = async (member) => {
    if (!editingBudgetVal.trim()) return;
    try {
      await expenseApi.savePreTripMember({
        name: member.name,
        budgetLimit: parseFloat(editingBudgetVal)
      });
      setEditingMemberId(null);
      setEditingBudgetVal('');
      loadPreTripData();
    } catch (err) {
      setError(err.response?.data || 'Failed to update budget limit.');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Delete this member? This might impact splits if they paid for any bookings.')) {
      try {
        await expenseApi.deletePreTripMember(id);
        loadPreTripData();
      } catch (err) {
        setError(err.response?.data || 'Failed to delete member.');
      }
    }
  };

  // Expense Operations
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.spentBy) {
      setError('Please fill in Title, Amount, and select who paid.');
      return;
    }

    setError('');
    try {
      const payload = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      };

      if (editingExpenseId) {
        await expenseApi.updatePreTripExpense(editingExpenseId, payload);
        setEditingExpenseId(null);
      } else {
        await expenseApi.createPreTripExpense(payload);
      }

      setExpenseForm({
        title: '',
        amount: '',
        spentBy: members.length > 0 ? members[0].name : '',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadPreTripData();
    } catch (err) {
      setError(err.response?.data || 'Failed to save pre-trip booking.');
    }
  };

  const handleEditExpense = (exp) => {
    setEditingExpenseId(exp.id);
    setExpenseForm({
      title: exp.title,
      amount: exp.amount.toString(),
      spentBy: exp.spentBy,
      expenseDate: exp.expenseDate,
      notes: exp.notes || ''
    });
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this pre-trip booking?')) {
      try {
        await expenseApi.deletePreTripExpense(id);
        loadPreTripData();
      } catch (err) {
        setError(err.response?.data || 'Failed to delete booking.');
      }
    }
  };

  // Set default spentBy if members change and spentBy is empty
  useEffect(() => {
    if (members.length > 0 && !expenseForm.spentBy) {
      setExpenseForm((prev) => ({ ...prev, spentBy: members[0].name }));
    }
  }, [members, expenseForm.spentBy]);

  const isReadOnly = summary?.isReadOnly || summary?.readOnly || false;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">✈️ Pre-Trip Expense Splitter</h1>
            <p className="text-xs text-slate-400">Track upfront bookings, stay tickets & split settles fairly</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl btn-premium btn-secondary text-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Members & Budgets */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <UserCheck className="w-4 h-4 text-violet-400" />
              1. Group Members & Budgets
            </h3>

            {/* Add Member Form */}
            {!isReadOnly && (
              <form onSubmit={handleAddMember} className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name (e.g. Rahul)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="glass-input rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Budget (default 10k)"
                    value={newMemberBudget}
                    onChange={(e) => setNewMemberBudget(e.target.value)}
                    className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-violet-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl btn-premium btn-violet text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Member
                </button>
              </form>
            )}

            {/* Members List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {members.length === 0 ? (
                <p className="text-slate-500 text-xs italic text-center py-4">No group members added yet.</p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{member.name}</h4>
                        {editingMemberId === member.id ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="number"
                              value={editingBudgetVal}
                              onChange={(e) => setEditingBudgetVal(e.target.value)}
                              placeholder="Limit"
                              className="glass-input rounded px-1.5 py-0.5 text-[10px] w-20 font-bold text-violet-300"
                            />
                            <button
                              onClick={() => handleUpdateBudget(member)}
                              className="text-[10px] bg-violet-500/30 text-violet-200 px-1.5 py-0.5 rounded font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400">
                            Budget: <span className="text-violet-300 font-bold">₹{parseFloat(member.budgetLimit).toLocaleString()}</span>
                            {!isReadOnly && (
                              <button
                                onClick={() => {
                                  setEditingMemberId(member.id);
                                  setEditingBudgetVal(member.budgetLimit.toString());
                                }}
                                className="text-slate-500 hover:text-white ml-2 underline text-[9px]"
                              >
                                Edit Limit
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Logging Pre-Trip Booking Expense */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-cyan-400" />
              2. Log Pre-Trip Booking
            </h3>

            {!isReadOnly ? (
              <form onSubmit={handleSaveExpense} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking Title *</label>
                  <input
                    type="text"
                    placeholder="Flight tickets, Hotel deposit..."
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="12000"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold text-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking Date</label>
                    <CustomDatePicker
                      value={expenseForm.expenseDate}
                      onChange={(date) => setExpenseForm({ ...expenseForm, expenseDate: date })}
                      placeholder="Select booking date..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Paid By *</label>
                  {members.length === 0 ? (
                    <p className="text-slate-500 text-[11px] italic">Please add group members first</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => {
                        const isSelected = expenseForm.spentBy === m.name;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setExpenseForm({ ...expenseForm, spentBy: m.name })}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
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
                        onClick={() => setExpenseForm({ ...expenseForm, spentBy: 'Group' })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                          expenseForm.spentBy === 'Group'
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="Additional booking detail..."
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  {editingExpenseId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExpenseId(null);
                        setExpenseForm({
                          title: '',
                          amount: '',
                          spentBy: members.length > 0 ? members[0].name : '',
                          expenseDate: new Date().toISOString().split('T')[0],
                          notes: ''
                        });
                      }}
                      className="flex-1 py-2.5 rounded-xl btn-premium btn-secondary text-xs transition-all"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-grow py-2.5 rounded-xl btn-premium btn-cyan text-xs shadow-glow-cyan transition-all"
                  >
                    {editingExpenseId ? 'Update Booking' : 'Log Booking'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-950/40 rounded-2xl border border-white/5">
                🚫 Logging new bookings is disabled. Only the trip admin can edit pre-trip plans.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Split Summary & Settlements */}
        <div className="space-y-6">
          {/* Outflow Summary Card */}
          <div className="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Split Outflow Analysis
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Spent</span>
                <p className="text-lg font-extrabold text-white">₹{summary.totalSpent.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Share / Person</span>
                <p className="text-lg font-extrabold text-cyan-400">₹{summary.sharePerMember.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Over Budget Alert Container */}
            {summary.memberSummaries.some((m) => m.isSpentOverBudget || m.isShareOverBudget) && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex gap-2 items-start shadow-glow-rose">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Budget Warning Exceeded!</p>
                  {summary.memberSummaries.map((m) => {
                    if (m.isSpentOverBudget) {
                      return (
                        <p key={m.memberName} className="text-[10px]">
                          ⚠️ <strong>{m.memberName}</strong> spent ₹{m.totalSpent.toLocaleString()} (Exceeded budget ₹{m.budgetLimit.toLocaleString()})
                        </p>
                      );
                    }
                    if (m.isShareOverBudget) {
                      return (
                        <p key={m.memberName} className="text-[10px]">
                          ⚠️ Share per member exceeds budget of <strong>{m.memberName}</strong>.
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Member Details */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Split Breakdown</span>
              {summary.memberSummaries.map((m) => {
                const isCreditor = m.netBalance > 0;
                return (
                  <div key={m.memberName} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{m.memberName}</span>
                      <p className="text-[10px] text-slate-400">Spent: ₹{m.totalSpent.toLocaleString()}</p>
                    </div>
                    <span className={`font-bold ${isCreditor ? 'text-emerald-400' : m.netBalance === 0 ? 'text-slate-400' : 'text-purple-300'}`}>
                      {isCreditor ? '+' : ''}₹{m.netBalance.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transfers & Settlements Card */}
          <div className="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-purple-400" />
              Pre-Trip Settlements
            </h3>

            <div className="space-y-2.5">
              {summary.transfers.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-700/60 rounded-2xl">
                  <p className="text-slate-400 text-xs italic">All settled. No transactions needed.</p>
                </div>
              ) : (
                summary.transfers.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-purple-300">{t.fromMember}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-emerald-400">{t.toMember}</span>
                    </div>
                    <strong className="text-white text-sm font-black">₹{t.amount.toLocaleString()}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Bookings Details Log Table */}
      <div className="glass-card rounded-3xl p-6 border border-white/10">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Pre-Trip Bookings Log
        </h3>

        <div className="overflow-x-auto">
          {expenses.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-700/60 rounded-3xl">
              <p className="text-slate-400 text-sm">No pre-trip bookings logged yet.</p>
              <p className="text-slate-500 text-xs mt-1">Log flight tickets, hotels, etc. to divide budget.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 uppercase tracking-wider font-bold">
                  <th className="pb-3 pr-2">Date</th>
                  <th className="pb-3 pr-2">Booking Title</th>
                  <th className="pb-3 pr-2">Paid By</th>
                  <th className="pb-3 pr-2">Amount</th>
                  <th className="pb-3 pr-2">Notes</th>
                  {!isReadOnly && <th className="pb-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 text-slate-300">{exp.expenseDate}</td>
                    <td className="py-3 font-bold text-white">{exp.title}</td>
                    <td className="py-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                        {exp.spentBy}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-cyan-400">₹{parseFloat(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-slate-400 italic">"{renderNotesWithLinks(exp.notes)}"</td>
                    {!isReadOnly && (
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditExpense(exp)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
