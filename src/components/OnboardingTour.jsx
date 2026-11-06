import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Users,
  Wallet,
  Clock,
  Receipt,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Zap,
  Home,
  Car
} from 'lucide-react';
import { nativeService } from '../services/nativeService';

export default function OnboardingTour({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    nativeService.hideSplashScreen();
  }, []);

  const slides = [
    {
      id: 'welcome',
      icon: Compass,
      color: 'from-cyan-500 to-blue-600',
      badge: '✨ Stress-Free Group Travel',
      title: 'Never Argue Over Trip Money Again',
      subtitle: 'Why Trip Cash Tracker exists & what problem it solves',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Traveling with friends is fun, but calculating who paid for what in messy spreadsheets or notes always leads to confusion and awkward payment reminders.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Real-Time
              </div>
              <p className="text-[11px] text-slate-400">
                Everyone sees every expense, receipt, and running balances live on their own phones.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <div className="font-bold text-violet-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Role Protection
              </div>
              <p className="text-[11px] text-slate-400">
                Admin controls group settings while members have crystal-clear read transparency.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mid-trip',
      icon: Clock,
      color: 'from-violet-500 to-fuchsia-600',
      badge: '⚡ Unique Edge-Case Solved',
      title: 'Friends Joining or Leaving Mid-Trip?',
      subtitle: 'Dynamic timeline splitting that other apps cannot do',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            <strong className="text-white">The Scenario:</strong> 4 friends start a 7-day trip, and 2 new friends join on Day 4. Why should the newcomers pay for days 1–3?
          </p>
          <div className="space-y-2 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-white">Point-in-Time Splitting:</strong> The 2 new guests owe ₹0.00 for dinners or activities that happened before they arrived.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-white">Prorated Villa & Car Rent:</strong> If a 7-day house was booked, guests only pay for the 2 days they slept there. The original 4 get an automatic discount!
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cash-online',
      icon: Wallet,
      color: 'from-amber-500 to-orange-600',
      badge: '💵 Dual Cash & UPI Engine',
      title: 'Physical Cash Pool + UPI Tracking',
      subtitle: 'Never lose track of roadside cash or fast UPI transfers',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Trips have both physical cash (parking, highway tolls, roadside coconuts) and online payments (Google Pay, PhonePe, Cards).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5" /> Group Cash Pool
              </div>
              <p className="text-[11px] text-slate-400">
                Collect ₹2,000 cash from everyone into a common pouch. Log cash expenditures with 1 tap.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <div className="font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5" /> 1-Tap Quick Water
              </div>
              <p className="text-[11px] text-slate-400">
                Bought a ₹20 water bottle or ₹50 snacks? Tap the Express button and it's split instantly without typing forms.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'exit-bill',
      icon: Receipt,
      color: 'from-rose-500 to-pink-600',
      badge: '🧾 Early Checkout Settlement',
      title: 'Leaving Early? Instant Exit Bill',
      subtitle: 'Settle your dues on the spot before packing bags',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            If a friend has to catch an early train or flight on Day 5, don't make them wait until the trip ends to figure out their share!
          </p>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Itemized Exit Statement</span>
              <span className="text-rose-300">1-Tap WhatsApp Share</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Generates a transparent invoice with exact breakdown (Villa 2 days share, dinners, minus anything they paid).
            </p>
            <div className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Settled & Check Out freezes their tab at ₹0.00.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settlement',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      badge: '🤝 Minimum Transactions Solver',
      title: 'Smart Peer-to-Peer Settlements',
      subtitle: 'Settles 20 messy cross-payments in 2 to 3 simple UPIs',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Instead of Alice paying Bob, Bob paying Charlie, and Charlie paying Alice, our greedy bilateral algorithm calculates the mathematically shortest path:
          </p>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <div className="text-xs font-bold text-emerald-300">
              "Rahul owes Priya ₹1,450 • Sneha owes Priya ₹920"
            </div>
            <p className="text-[10px] text-slate-400">
              Everyone is settled with zero remainder. No more awkward math debates!
            </p>
          </div>
          <div className="text-center pt-2">
            <div className="text-xs text-slate-300 font-semibold mb-1">
              You are all set to experience the smoothest trip budgeting!
            </div>
          </div>
        </div>
      )
    }
  ];

  const current = slides[currentSlide];
  const IconComponent = current.icon;
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    nativeService.hapticLight();
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    nativeService.hapticLight();
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    nativeService.hapticLight();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Guide Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="glass-modal rounded-3xl p-6 md:p-8 w-full max-w-lg relative z-10 shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
      >
        {/* Top bar with slide counter and Close (✕) button */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Trip Guide • Step {currentSlide + 1} of {slides.length}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-xs"
            title="Skip to Login"
          >
            <span className="text-[11px] font-semibold hidden sm:inline">Skip to Login</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Slide Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Icon & Badge */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white shadow-lg shrink-0`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/10 text-cyan-300 border border-white/10 mb-1">
                    {current.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                    {current.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-400 italic">
                {current.subtitle}
              </p>

              {/* Body */}
              <div className="pt-1">{current.content}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-6 bg-cyan-400 shadow-glow-cyan'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl btn-premium btn-secondary text-xs flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-lg transition-all ${
                isLast
                  ? 'btn-premium btn-emerald shadow-glow-emerald text-white'
                  : 'btn-premium btn-cyan shadow-glow-cyan text-white'
              }`}
            >
              <span>{isLast ? 'Enter Login Screen' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

