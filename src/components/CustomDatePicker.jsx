import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

export default function CustomDatePicker({ value, onChange, placeholder = "Select date..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date or default to current date
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [value]);

  // Close calendar popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    const dateString = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Generate calendar grid array
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const selectedDateObj = value ? new Date(value) : null;
  const isSelectedDay = (day) => {
    if (!selectedDateObj || isNaN(selectedDateObj.getTime())) return false;
    return (
      selectedDateObj.getDate() === day &&
      selectedDateObj.getMonth() === currentMonth &&
      selectedDateObj.getFullYear() === currentYear
    );
  };

  const todayObj = new Date();
  const isTodayDay = (day) => {
    return (
      todayObj.getDate() === day &&
      todayObj.getMonth() === currentMonth &&
      todayObj.getFullYear() === currentYear
    );
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 glass-input px-3.5 py-2 rounded-xl border border-white/10 hover:border-cyan-500/40 text-xs text-white transition-all"
      >
        <CalendarIcon className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="font-medium">
          {value ? value : <span className="text-slate-400">{placeholder}</span>}
        </span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-0.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Glassmorphic Calendar Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 left-0 w-72 glass-modal rounded-2xl p-4 shadow-2xl border border-white/15 backdrop-blur-2xl"
          >
            {/* Calendar Header: Month/Year & Nav */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-sm font-bold text-white tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {daysOfWeek.map((day) => (
                <span key={day} className="text-[11px] font-semibold text-cyan-400/80 py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-8" />;
                }

                const selected = isSelectedDay(day);
                const isToday = isTodayDay(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-8 w-8 text-xs font-semibold rounded-xl flex items-center justify-center transition-all ${
                      selected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan scale-105'
                        : isToday
                        ? 'border border-cyan-400 text-cyan-300 bg-cyan-500/10'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-medium">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
