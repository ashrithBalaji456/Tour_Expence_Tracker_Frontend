import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, LogIn, UserPlus, PlusCircle, Trash2, Plus, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import { useWarningDialog } from './WarningDialog';
import { storageService } from '../utils/storage';
import { nativeService } from '../services/nativeService';
import OnboardingTour from './OnboardingTour';

const formatTripDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function AuthScreens({ onAuthSuccess }) {
  const [screen, setScreen] = useState('login'); // 'login' | 'signup' | 'setupGroup' | 'selectGroup'
  const [showGuide, setShowGuide] = useState(() => {
    try {
      const token = storageService.getToken();
      if (token) return false; // Existing logged-in users go straight to trips
      const seen = storageService.getItem('hasSeenOnboardingGuide');
      return !seen;
    } catch (e) {
      return false;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const googleBtnLoginRef = React.useRef(null);
  const googleBtnSignupRef = React.useRef(null);

  // Group creation inputs
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState(['']); // dynamic list of usernames
  const [memberStatuses, setMemberStatuses] = useState({});
  const [authData, setAuthData] = useState(null); // stores token/username temp
  const [availableGroups, setAvailableGroups] = useState([]);
  const { confirm, warningDialog } = useWarningDialog();
  const currentUsername = (authData?.username || storageService.getUsername() || '').trim().toLowerCase();

  useEffect(() => {
    nativeService.hideSplashScreen();
    const token = storageService.getToken();
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
          storageService.removeToken();
          storageService.removeItemSync('username');
          setScreen('login');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (screen !== 'setupGroup') {
      return undefined;
    }

    let cancelled = false;
    const identifiers = [...new Set(members
      .map(member => member.trim())
      .filter(identifier => identifier && identifier.toLowerCase() !== currentUsername))];
    const timeoutId = window.setTimeout(() => {
      setMemberStatuses(previous => {
        const next = { ...previous };
        identifiers.forEach(identifier => {
          next[identifier.toLowerCase()] = { status: 'checking' };
        });
        return next;
      });

      identifiers.forEach(async (identifier) => {
        try {
          const exists = await expenseApi.checkMemberExists(identifier);
          if (!cancelled) {
            setMemberStatuses(previous => ({
              ...previous,
              [identifier.toLowerCase()]: { status: exists ? 'exists' : 'missing' }
            }));
          }
        } catch (err) {
          if (!cancelled) {
            setMemberStatuses(previous => ({
              ...previous,
              [identifier.toLowerCase()]: { status: 'error' }
            }));
          }
        }
      });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [currentUsername, members, screen]);

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
        storageService.setToken(data.token);
        storageService.setUsername(data.username);
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

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setGoogleLoading(true);
      setError('');
      const data = await expenseApi.googleAuth({ idToken: response.credential });
      if (data.token) {
        storageService.setToken(data.token);
        storageService.setUsername(data.username);

        const groups = await expenseApi.getMyGroups();
        if (groups && groups.length > 0) {
          setAvailableGroups(groups);
          setScreen('selectGroup');
        } else if (data.hasGroup && data.groupId) {
          storageService.setActiveGroupId(data.groupId);
          onAuthSuccess(data);
        } else {
          setAuthData(data);
          setScreen('setupGroup');
        }
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleManualGoogleClick = () => {
    if (!googleClientId) {
      setError('Google Client ID is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your Frontend/.env file.');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In SDK is still loading. Please check your internet connection.');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!googleClientId) return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });

          if (googleBtnLoginRef.current && screen === 'login') {
            window.google.accounts.id.renderButton(googleBtnLoginRef.current, {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              width: 320,
              text: 'continue_with',
            });
          }
          if (googleBtnSignupRef.current && screen === 'signup') {
            window.google.accounts.id.renderButton(googleBtnSignupRef.current, {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              width: 320,
              text: 'signup_with',
            });
          }
        } catch (e) {
          console.warn('[GSI] Initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 400);
      return () => clearInterval(timer);
    }
  }, [screen, googleClientId]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please provide a trip group name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const activeMembers = members
        .map(member => member.trim())
        .filter(member => member && member.toLowerCase() !== currentUsername);
      const memberResults = await Promise.all(activeMembers.map(async (member) => ({
        member,
        exists: await expenseApi.checkMemberExists(member.trim())
      })));
      const missingMember = memberResults.find(result => !result.exists);
      if (missingMember) {
        setMemberStatuses(previous => ({
          ...previous,
          [missingMember.member.trim().toLowerCase()]: { status: 'missing' }
        }));
        setError(`No account found for "${missingMember.member.trim()}". Ask them to create an account first.`);
        return;
      }

      setMemberStatuses(previous => ({
        ...previous,
        ...Object.fromEntries(memberResults.map(({ member }) => [
          member.trim().toLowerCase(),
          { status: 'exists' }
        ]))
      }));
      const groupData = await expenseApi.createGroup(groupName, activeMembers);
      storageService.setActiveGroupId(groupData.groupId);
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
    setMemberStatuses(previous => {
      const next = { ...previous };
      delete next[members[index].trim().toLowerCase()];
      delete next[value.trim().toLowerCase()];
      return next;
    });
  };

  const handleDeleteGroup = async (groupId, e) => {
    e.stopPropagation();
    if (await confirm('Are you sure you want to permanently delete this trip group? This will delete all logged expenses, members, and settlements, and cannot be undone!', {
      title: 'Permanently delete trip group?',
    })) {
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

  const handleDismissGuide = () => {
    storageService.setItemSync('hasSeenOnboardingGuide', 'true');
    setShowGuide(false);
  };

  if (showGuide) {
    return <OnboardingTour onComplete={handleDismissGuide} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative z-10"
      >
        {/* Crazy Road Trip Double-Decker Thumbnail */}
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/10 shadow-xl group">
          <img
            src="/tour_thumbnail.jpg"
            alt="Tour Expense Tracker - Friends on Double Decker Bus"
            className="w-full h-36 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-90" />
        </div>

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

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-[#101524] px-3 text-slate-500">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <div className="flex flex-col items-center gap-2">
                <div ref={googleBtnLoginRef} className="w-full flex justify-center min-h-[40px]" />
                <button
                  type="button"
                  disabled={loading || googleLoading}
                  onClick={handleManualGoogleClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
                </button>
              </div>

              <div className="text-center pt-2 space-y-2">
                <div>
                  <span className="text-xs text-slate-500">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMsg(''); setScreen('signup'); }}
                    className="text-xs text-cyan-400 font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowGuide(true)}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    How this app works & features guide
                  </button>
                </div>
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

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-[#101524] px-3 text-slate-500">Or sign up with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <div className="flex flex-col items-center gap-2">
                <div ref={googleBtnSignupRef} className="w-full flex justify-center min-h-[40px]" />
                <button
                  type="button"
                  disabled={loading || googleLoading}
                  onClick={handleManualGoogleClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Connecting Google...' : 'Sign up with Google'}</span>
                </button>
              </div>

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
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={`Member ${idx + 1} Username or Email (e.g. Sai or sai@example.com)`}
                          value={member}
                          onChange={(e) => handleMemberChange(idx, e.target.value)}
                          className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                        />
                        {member.trim() && member.trim().toLowerCase() === currentUsername && (
                          <p className="mt-1 text-[10px] font-semibold text-cyan-400">You’re the trip host and will be added automatically.</p>
                        )}
                        {member.trim() && member.trim().toLowerCase() !== currentUsername && memberStatuses[member.trim().toLowerCase()]?.status === 'checking' && (
                          <p className="mt-1 text-[10px] text-slate-400">Checking account...</p>
                        )}
                        {member.trim() && member.trim().toLowerCase() !== currentUsername && memberStatuses[member.trim().toLowerCase()]?.status === 'exists' && (
                          <p className="mt-1 text-[10px] font-semibold text-emerald-400">Account found. Ready to invite.</p>
                        )}
                        {member.trim() && member.trim().toLowerCase() !== currentUsername && memberStatuses[member.trim().toLowerCase()]?.status === 'missing' && (
                          <p className="mt-1 text-[10px] font-semibold text-rose-400">No account found. Ask them to create an account first.</p>
                        )}
                        {member.trim() && member.trim().toLowerCase() !== currentUsername && memberStatuses[member.trim().toLowerCase()]?.status === 'error' && (
                          <p className="mt-1 text-[10px] font-semibold text-rose-400">Could not check this account. Please try again.</p>
                        )}
                      </div>
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
                        {adminTrips.map((g, idx) => (
                          <div
                            key={g.groupId}
                            onClick={() => {
                              storageService.setActiveGroupId(g.groupId);
                              onAuthSuccess(g);
                            }}
                            className="w-full text-left p-3.5 rounded-2xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 transition-all hover:scale-[1.01] flex items-center justify-between cursor-pointer group"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold text-white text-sm">{g.groupName}</h5>
                                {idx === 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/35">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="text-cyan-300/90 font-semibold">Admin</span>
                                {g.createdAt && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-300">Started {formatTripDate(g.createdAt)}</span>
                                  </>
                                )}
                                {g.memberCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{g.memberCount} members</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
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
                        {memberTrips.map((g, idx) => (
                          <button
                            key={g.groupId}
                            onClick={() => {
                              storageService.setActiveGroupId(g.groupId);
                              onAuthSuccess(g);
                            }}
                            className="w-full text-left p-3.5 rounded-2xl bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/20 transition-all hover:scale-[1.01] flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold text-white text-sm">{g.groupName}</h5>
                                {idx === 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/35">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="text-violet-300/90 font-semibold">Member</span>
                                {g.createdAt && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-300">Started {formatTripDate(g.createdAt)}</span>
                                  </>
                                )}
                                {g.memberCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{g.memberCount} members</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-1 rounded-lg font-bold border border-violet-500/35 shrink-0">
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
                      storageService.removeToken();
                      storageService.removeItemSync('username');
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
      {warningDialog}
    </div>
  );
}
