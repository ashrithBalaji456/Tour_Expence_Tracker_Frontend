import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

function WarningDialog({ dialog, onResolve }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!dialog) return undefined;

    cancelButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onResolve(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, onResolve]);

  return (
    <AnimatePresence>
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Dismiss warning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onResolve(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="warning-dialog-title"
            aria-describedby="warning-dialog-message"
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/25 bg-slate-900/95 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500" />
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.8 }}
                className="mt-0.5 shrink-0 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.12)]"
              >
                {dialog.isConfirmation
                  ? <ShieldAlert className="h-6 w-6" />
                  : <AlertTriangle className="h-6 w-6" />}
              </motion.div>

              <div className="min-w-0 flex-1">
                <h2 id="warning-dialog-title" className="text-lg font-extrabold text-white">
                  {dialog.title}
                </h2>
                <p id="warning-dialog-message" className="mt-2 text-sm leading-6 text-slate-300">
                  {dialog.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {dialog.isConfirmation && (
                <button
                  ref={cancelButtonRef}
                  type="button"
                  onClick={() => onResolve(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400/60"
                >
                  Cancel
                </button>
              )}
              <button
                ref={!dialog.isConfirmation ? cancelButtonRef : null}
                type="button"
                onClick={() => onResolve(true)}
                className={`rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all focus:outline-none focus:ring-2 ${
                  dialog.isConfirmation
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-950/40 hover:brightness-110 focus:ring-rose-300/70'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-lg shadow-amber-950/30 hover:brightness-105 focus:ring-amber-200/70'
                }`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}

export function useWarningDialog() {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const resolveDialog = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const openDialog = useCallback((nextDialog) => new Promise((resolve) => {
    if (resolverRef.current) {
      resolverRef.current(false);
    }
    resolverRef.current = resolve;
    setDialog(nextDialog);
  }), []);

  useEffect(() => () => {
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((message, options = {}) => openDialog({
    isConfirmation: true,
    title: options.title || 'Please confirm',
    message: String(message),
    confirmLabel: options.confirmLabel || 'Delete',
  }), [openDialog]);

  const showAlert = useCallback((message, options = {}) => openDialog({
    isConfirmation: false,
    title: options.title || 'Heads up',
    message: String(message),
    confirmLabel: options.confirmLabel || 'Got it',
  }), [openDialog]);

  return {
    confirm,
    showAlert,
    warningDialog: <WarningDialog key="warning-dialog" dialog={dialog} onResolve={resolveDialog} />,
  };
}
