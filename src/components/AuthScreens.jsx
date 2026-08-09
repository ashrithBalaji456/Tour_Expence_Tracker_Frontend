import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, LogIn, UserPlus, PlusCircle, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';

export default function AuthScreens({ onAuthSuccess }) {
  const [screen, setScreen] = useState('login'); // 'login' | 'signup' | 'setupGroup' | 'selectGroup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Group creation inputs
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState(['']); // dynamic list of usernames
  const [authData, setAuthData] = useState(null); // stores token/username temp
  const [availableGroups, setAvailableGroups] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      expenseApi.getMyGroups()
        .then((groups) => {
          if (groups.length > 0) {
            setAvailableGroups(groups);
            setScreen('selectGroup');
          } else {
            setScreen('setupGroup');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          setScreen('login');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const getErrorMessage = (err) => {
    if (!err) return '';
    if (err.response && err.response.data) {
      const data = err.response.data;
      if (typeof data === 'string') {
        return data;
      }
      if (data.message) {
        return data.message;
      }
      if (data.error) {
        return data.error;
      }
    }
    return err.message || 'An unexpected error occurred.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await expenseApi.login(username, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setAuthData(data);
        
        const groups = await expenseApi.getMyGroups();
        if (groups.length > 0) {
          setAvailableGroups(groups);
          setScreen('selectGroup');
        } else {
          setScreen('setupGroup');
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await expenseApi.register(username, email, password);
      setSuccessMsg('Account created successfully! Please sign in using your credentials.');
      setScreen('login');
      setPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please provide a trip group name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const activeMembers = members.filter(m => m.trim() !== '');
      const groupData = await expenseApi.createGroup(groupName, activeMembers);
      localStorage.setItem('activeGroupId', groupData.groupId);
      onAuthSuccess({
        ...authData,
        hasGroup: true,
        groupId: groupData.groupId,
        groupName: groupData.groupName,
        isCreator: true
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index) => {
    const updated = members.filter((_, idx) => idx !== index);
    setMembers(updated.length > 0 ? updated : ['']);
  };

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleDeleteGroup = async (groupId, e) => {
    e.stopPropagation();
    if (window.confirm("⚠️ Are you sure you want to permanently delete this trip group? This will delete all logged expenses, members, and settlements, and cannot be undone!")) {
      setLoading(true);
      setError('');
      try {
        await expenseApi.deleteGroup(groupId);
        const groups = await expenseApi.getMyGroups();
        setAvailableGroups(groups);
        if (groups.length === 0) {
          setScreen('setupGroup');
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-2">
            <span className="px-3 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Secure Shared Trips
            </span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <Compass className="w-6 h-6 text-cyan-400 animate-spin-slow" />
            Trip Cash Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {screen === 'login' && 'Sign in to access your shared trip dashboard'}
            {screen === 'signup' && 'Create an account to start tracking trip splits'}
            {screen === 'setupGroup' && 'Almost there! Set up your trip group details'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-xs font-semibold animate-fade-in">
            {successMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          {screen === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  type="text"
                  placeholder="kamal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input rounded-xl pl-4 pr-12 py-2.5 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl btn-premium btn-cyan text-sm shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccessMsg(''); setScreen('signup'); }}
                  className="text-xs text-cyan-400 font-bold hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </motion.form>
          )}

          {screen === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignup}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  type="text"
                  placeholder="sai"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="sai@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input rounded-xl pl-4 pr-12 py-2.5 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl btn-premium btn-violet text-sm shadow-glow-violet flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Already registered? </span>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccessMsg(''); setScreen('login'); }}
                  className="text-xs text-violet-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </motion.form>
          )}

          {screen === 'setupGroup' && (
            <motion.form
              key="setupGroup"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleCreateGroup}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Trip Name *</label>
                <input
                  type="text"
                  placeholder="Goa Trip 2026, Ladakh Escapade..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-300"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invite Group Members (Usernames or Emails)</label>
                  <button
                    type="button"
                    onClick={addMemberField}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-white transition-all flex items-center gap-0.5 text-[9px] font-bold"
                  >
                    <Plus className="w-3 h-3" /> Add Member
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {members.map((member, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`Member ${idx + 1} Username or Email (e.g. Sai or sai@example.com)`}
                        value={member}
                        onChange={(e) => handleMemberChange(idx, e.target.value)}
                        className="flex-1 glass-input rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeMemberField(idx)}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl btn-premium btn-cyan text-sm shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                {loading ? 'Creating Trip...' : 'Create Trip & Dashboard'}
              </button>
            </motion.form>
          )}

          {screen === 'selectGroup' && (() => {
            const adminTrips = availableGroups.filter((g) => g.isCreator || g.creator);
            const memberTrips = availableGroups.filter((g) => !g.isCreator && !g.creator);

            return (
              <motion.div
                key="selectGroup"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5 text-xs sm:text-sm"
              >
                <div className="text-slate-300 text-xs font-semibold mb-2 text-center">
                  ✈️ Welcome back! You are part of the following trips:
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {adminTrips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1">
                        👑 Trips you Manage (As Admin):
                      </h4>
                      <div className="space-y-2">
                        {adminTrips.map((g) => (
                          <div
                            key={g.groupId}
                            onClick={() => {
                              localStorage.setItem('activeGroupId', g.groupId);
                              onAuthSuccess(g);
                            }}
                            className="w-full text-left p-3.5 rounded-2xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 transition-all hover:scale-[1.01] flex items-center justify-between cursor-pointer group"
                          >
                            <div>
                              <h5 className="font-bold text-white text-sm">{g.groupName}</h5>
                              <p className="text-[9px] text-cyan-300/80 mt-0.5">Full Admin Rights</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg font-bold border border-cyan-500/35 transition-all group-hover:bg-cyan-500/30">
                                Enter Dashboard
                              </span>
                              <button
                                onClick={(e) => handleDeleteGroup(g.groupId, e)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 hover:text-white transition-all shadow-glow-rose"
                                title="Delete Trip Group"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {memberTrips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-wider px-1">
                        👥 Shared Trips (As Member):
                      </h4>
                      <div className="space-y-2">
                        {memberTrips.map((g) => (
                          <button
                            key={g.groupId}
                            onClick={() => {
                              localStorage.setItem('activeGroupId', g.groupId);
                              onAuthSuccess(g);
                            }}
                            className="w-full text-left p-3.5 rounded-2xl bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/20 transition-all hover:scale-[1.01] flex items-center justify-between"
                          >
                            <div>
                              <h5 className="font-bold text-white text-sm">{g.groupName}</h5>
                              <p className="text-[9px] text-violet-300/80 mt-0.5">Read-Only Access</p>
                            </div>
                            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-1 rounded-lg font-bold border border-violet-500/35">
                              Open View
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setGroupName('');
                      setMembers(['']);
                      setScreen('setupGroup');
                    }}
                    className="w-full py-2.5 rounded-xl btn-premium btn-cyan text-sm shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Start a New Trip Group (As Admin)
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('username');
                      setScreen('login');
                    }}
                    className="text-xs text-rose-400 font-bold hover:underline"
                  >
                    Sign Out / Use Another Account
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
