import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { networkService } from '../services/networkService';

export default function NetworkBanner({ onRetry }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    networkService.init();
    const unsubscribe = networkService.subscribe((status) => {
      setIsOnline(status.isOnline);
    });
    return () => unsubscribe();
  }, []);

  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-rose-600/90 text-white backdrop-blur-md px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg safe-top"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
          <span>You are currently offline. Please check your internet connection.</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg text-[11px] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

