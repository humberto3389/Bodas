import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../hooks/usePWAInstall';

/**
 * Bottom floating banner suggesting PWA installation.
 * - Only shows when installable and not dismissed
 * - Appears after 30s delay to avoid cognitive overload
 * - Mobile-optimized, animated with Framer Motion
 */
export function PWAInstallBanner() {
  const { canInstall, promptInstall, dismiss } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  // Delay showing the banner by 30 seconds
  useEffect(() => {
    if (!canInstall) return;

    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 30_000);

    return () => clearTimeout(timer);
  }, [canInstall]);

  if (!showBanner || !canInstall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md"
      >
        <div className="pwa-install-banner">
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="12" r="3.5" fill="none" stroke="white" />
                <circle cx="15" cy="12" r="3.5" fill="none" stroke="white" />
                <path d="M9 12 L15 12" stroke="white" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Instalar Suspiro Nupcial
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Accede rápido desde tu pantalla de inicio
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={dismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Install button */}
          <button
            onClick={promptInstall}
            className="w-full mt-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Instalar App
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
