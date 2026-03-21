import { motion, AnimatePresence } from 'framer-motion';
import { useAudioContext } from '../contexts/AudioContext';
import { useState } from 'react';

interface IntroOverlayProps {
  brideName?: string;
  groomName?: string;
  coupleName?: string;
}

export function IntroOverlay({ brideName, groomName, coupleName }: IntroOverlayProps) {
  const { isInteracted, setInteracted } = useAudioContext();
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    // Pequeño retraso para permitir la animación de salida antes de desbloquear el audio
    setTimeout(() => {
      setInteracted(true);
    }, 800);
  };

  if (isInteracted) return null;

  const names = brideName && groomName ? `${brideName} & ${groomName}` : (coupleName || 'Nuestra Boda');

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950"
        >
          {/* Fondo decorativo sutil */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100 blur-[120px] rounded-full" />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center px-6 max-w-lg w-full"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 font-medium">
                Estás invitado a celebrar
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-elegant text-4xl sm:text-5xl text-slate-800 dark:text-white mb-12 leading-tight"
            >
              {names}
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <button
                onClick={handleEnter}
                className="group relative px-12 py-5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 font-bold text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">
                  Ver Invitación
                </span>
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-12 text-slate-400 dark:text-slate-600 text-[10px] italic"
            >
              Pulsa para activar la experiencia con música
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
