import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, Copy, Check, Delete } from 'lucide-react';

export default function CalculatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const widgetRef = useRef(null);

  // Handle calculator key clicks
  const handleKeyClick = (key) => {
    setCopied(false);
    if (key === 'C') {
      setExpression('');
      setResult('');
    } else if (key === '⌫') {
      setExpression((prev) => prev.slice(0, -1));
    } else if (key === '=') {
      calculateResult();
    } else {
      setExpression((prev) => prev + key);
    }
  };

  // Evaluate the expression safely
  const calculateResult = () => {
    try {
      // Replace safe multiplication and division symbols
      const cleanExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // Basic regex check to only allow math expressions (security)
      if (!/^[0-9+\-*/().\s]+$/.test(cleanExpr)) {
        setResult('Error');
        return;
      }

      // Evaluate safely
      const evalResult = Function(`"use strict"; return (${cleanExpr})`)();
      
      if (evalResult === undefined || isNaN(evalResult) || !isFinite(evalResult)) {
        setResult('Error');
      } else {
        setResult(Number(evalResult.toFixed(4)).toString());
      }
    } catch (err) {
      setResult('Error');
    }
  };

  // Copy result to clipboard
  const handleCopy = () => {
    if (!result || result === 'Error') return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Listen to keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      const keyMap = {
        '*': '×',
        '/': '÷',
        'Enter': '=',
        '=': '=',
        'Backspace': '⌫',
        'Delete': 'C',
        'Escape': 'Close',
        'c': 'C',
        'C': 'C',
      };

      const char = keyMap[e.key] || e.key;

      if (/^[0-9+\-().]$/.test(char)) {
        e.preventDefault();
        handleKeyClick(char);
      } else if (char === '×' || char === '÷' || char === '⌫' || char === 'C') {
        e.preventDefault();
        handleKeyClick(char);
      } else if (char === '=') {
        e.preventDefault();
        calculateResult();
      } else if (char === 'Close') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, expression]);

  const buttons = [
    ['(', ')', '⌫', 'C'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+']
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-violet border border-violet-500/30 hover:brightness-110 flex items-center justify-center"
      >
        <Calculator className="w-6 h-6" />
      </motion.button>

      {/* Calculator Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            drag
            dragMomentum={false}
            className="fixed bottom-24 right-6 z-50 w-72 glass-card rounded-3xl p-4 border border-white/10 shadow-2xl cursor-default select-none overflow-hidden"
          >
            {/* Header / Drag Handle */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-violet-400" />
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">On-Spot Calculator</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display Screen */}
            <div className="bg-slate-950/80 rounded-2xl p-3 mb-4 border border-white/5 text-right relative group">
              <div className="text-[10px] text-slate-500 font-mono overflow-x-auto whitespace-nowrap min-h-[14px]">
                {expression || '0'}
              </div>
              <div className="text-xl font-bold text-white font-mono mt-1 overflow-x-auto whitespace-nowrap">
                {result || '0'}
              </div>
              
              {/* Copy Button */}
              {result && result !== 'Error' && (
                <button
                  onClick={handleCopy}
                  className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title="Copy result"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-2">
              {buttons.flat().map((btn) => {
                const isOperator = ['÷', '×', '-', '+', '='].includes(btn);
                const isClear = ['C', '⌫'].includes(btn);
                
                return (
                  <button
                    key={btn}
                    onClick={() => handleKeyClick(btn)}
                    className={`py-3.5 rounded-xl text-xs font-bold transition-all ${
                      btn === '='
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-violet col-span-1'
                        : isOperator
                        ? 'bg-slate-900/60 text-violet-400 hover:bg-slate-900 hover:text-white border border-white/5'
                        : isClear
                        ? 'bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 border border-rose-900/20'
                        : 'bg-slate-950/40 text-slate-300 hover:bg-slate-900 hover:text-white border border-white/5'
                    }`}
                  >
                    {btn === '⌫' ? <Delete className="w-3.5 h-3.5 mx-auto" /> : btn}
                  </button>
                );
              })}
            </div>
            
            {/* Guide Info */}
            <div className="text-center text-[9px] text-slate-500 font-semibold mt-3.5 uppercase tracking-wider">
              💡 Supports keyboard input
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
