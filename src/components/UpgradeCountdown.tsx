import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeCountdownProps {
  upgradeApprovedAt: Date | string;
  pendingPlan: 'premium' | 'deluxe';
  onExpired?: () => void;
}

export function UpgradeCountdown({ upgradeApprovedAt, pendingPlan, onExpired }: UpgradeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // ✅ FIX PARA MÓVIL (SAFARI): Safari es estricto con el formato ISO.
      const sanitized = typeof upgradeApprovedAt === 'string'
        ? upgradeApprovedAt.replace(' ', 'T')
        : upgradeApprovedAt;
      const approvedAt = new Date(sanitized);
      const now = new Date();
      const diffMs = approvedAt.getTime() + (24 * 60 * 60 * 1000) - now.getTime(); // 24 horas desde aprobación

      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        if (onExpired) onExpired();
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, totalMs: diffMs });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [upgradeApprovedAt, onExpired]);

  if (!timeLeft) return null;

  const isExpired = timeLeft.totalMs <= 0;
  const isUrgent = timeLeft.totalMs < 2 * 60 * 60 * 1000; // Menos de 2 horas

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-xl border-2 border-red-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
            ⏰
          </div>
          <div className="flex-1">
            <h3 className="text-white font-black text-lg mb-1">Periodo de Gracia Expirado</h3>
            <p className="text-white/90 text-sm">
              El periodo de 24 horas ha finalizado. Tu plan ha sido revertido al plan original.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`mb-6 overflow-hidden rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all duration-500 ${isUrgent
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 border-amber-300'
            : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 border-blue-300'
          }`}
      >
        {/* Barra superior animada */}
        <div className={`h-1.5 w-full ${isUrgent
            ? 'bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200'
            : 'bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200'
          }`}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-full w-1/2 bg-white/40"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isUrgent ? 'bg-amber-100/30 text-amber-100' : 'bg-blue-100/30 text-blue-100'
                }`}>
                ⏳
              </div>
              <div>
                <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${isUrgent ? 'text-amber-100' : 'text-blue-100'
                  }`}>
                  {isUrgent ? '¡Tiempo Limitado!' : 'Esperando Confirmación de Pago'}
                </h4>
                <p className={`text-sm font-medium leading-relaxed ${isUrgent ? 'text-amber-50' : 'text-blue-50'
                  }`}>
                  Tienes acceso temporal al plan <strong>{pendingPlan.toUpperCase()}</strong>.
                  Envía tu comprobante de pago. Si no se confirma en 24h, se revertirá al plan original.
                </p>
              </div>
            </div>

            {/* Contador */}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl backdrop-blur-md border-2 ${isUrgent
                ? 'bg-amber-900/40 border-amber-200/50'
                : 'bg-blue-900/40 border-blue-200/50'
              }`}>
              <div className="text-center">
                <div className={`text-3xl font-black ${isUrgent ? 'text-amber-100' : 'text-blue-100'
                  }`}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className={`text-[10px] uppercase tracking-widest font-bold ${isUrgent ? 'text-amber-200' : 'text-blue-200'
                  }`}>
                  Horas
                </div>
              </div>
              <div className={`text-2xl font-black ${isUrgent ? 'text-amber-200' : 'text-blue-200'
                }`}>:</div>
              <div className="text-center">
                <div className={`text-3xl font-black ${isUrgent ? 'text-amber-100' : 'text-blue-100'
                  }`}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className={`text-[10px] uppercase tracking-widest font-bold ${isUrgent ? 'text-amber-200' : 'text-blue-200'
                  }`}>
                  Min
                </div>
              </div>
              <div className={`text-2xl font-black ${isUrgent ? 'text-amber-200' : 'text-blue-200'
                }`}>:</div>
              <div className="text-center">
                <div className={`text-3xl font-black ${isUrgent ? 'text-amber-100' : 'text-blue-100'
                  }`}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className={`text-[10px] uppercase tracking-widest font-bold ${isUrgent ? 'text-amber-200' : 'text-blue-200'
                  }`}>
                  Seg
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
