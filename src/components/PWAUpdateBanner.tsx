import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyUpdate } from '../lib/sw-register';

/**
 * Top toast-style banner notifying user of a new app version.
 * - Listens for 'sw-update-available' custom event from sw-register.ts
 * - "Actualizar" calls applyUpdate() → skipWaiting → reload
 * - "Después" dismisses until next visit
 */
export function PWAUpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = () => setShowBanner(true);
    window.addEventListener('sw-update-available', handler);
    return () => window.removeEventListener('sw-update-available', handler);
  }, []);

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-md"
      >
        <div className="pwa-update-banner">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Nueva versión disponible
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Actualiza para obtener las últimas mejoras
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowBanner(false)}
              className="flex-1 text-sm font-medium text-slate-600 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Después
            </button>
            <button
              onClick={() => {
                applyUpdate();
                setShowBanner(false);
              }}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Actualizar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
