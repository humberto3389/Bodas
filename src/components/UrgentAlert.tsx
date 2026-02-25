import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UrgentAlertProps {
  client: any;
}

export function UrgentAlert({ client }: UrgentAlertProps) {
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [hasNotifiedActive, setHasNotifiedActive] = useState(false);

  // Usamos una referencia para saber si ya mostramos el modal AUTOMÁTICAMENTE en esta carga de página
  const autoShownRef = useRef(false);

  const detectChanges = useCallback(() => {
    if (!client) return;

    // Lógica Manual Explicita: Si el cliente marcó isUrgent en el panel
    const hasActiveUpdate = !!client.isUrgent;

    if (hasActiveUpdate) {
      setShowBanner(true);

      // Auto-mostrar el modal solo una vez por carga de página (para no ser molesto al navegar)
      if (!autoShownRef.current) {
        setShowModal(true);
        autoShownRef.current = true;
      }

      // Notificación nativa si está oculto
      if (document.hidden && !hasNotifiedActive) {
        triggerNativeNotification();
        setHasNotifiedActive(true);
      }
    } else {
      setShowBanner(false);
      setShowModal(false);
    }
  }, [client, hasNotifiedActive]);

  const triggerNativeNotification = () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("⚠️ Cambio Urgente en el Horario", {
        body: "Se han actualizado detalles importantes en la invitación.",
        icon: "/favicon.ico"
      });
    }
  };

  useEffect(() => {
    if (client) detectChanges();
  }, [client, detectChanges]);

  const handleCloseModal = () => {
    setShowModal(false);
    // NOTA: Ya no actualizamos el "seen" en localStorage para ocultar permanentemente.
    // El Banner siempre se quedará visible si hay una explicación o cambios detectados.
    // El Modal volverá a salir si el usuario refresca la página.
  };

  // Solo ocultamos todo si REALMENTE no hay nada que mostrar
  if (!showBanner && !client?.isUrgent) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white py-2 px-4 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest overflow-hidden">
              <span className="animate-pulse shrink-0">⚠️</span>
              <span className="truncate">Actualización Urgente en el Evento</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 transition-colors ml-2"
            >
              Ver Detalle
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-rose-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

              <div className="relative text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  📢
                </div>

                <h2 className="font-elegant text-2xl text-slate-900 font-bold mb-3 leading-tight">
                  Aviso Importante
                </h2>

                <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                  Se han realizado actualizaciones en los detalles del evento. Por favor toma nota para tu asistencia:
                </p>

                {client.changeExplanation && (
                  <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-slate-700 text-sm text-center font-medium shadow-sm">
                    "{client.changeExplanation}"
                  </div>
                )}

                <div className="space-y-3 mb-8 text-left max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs italic">
                    Revisa los horarios y ubicaciones actualizados en la invitación.
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseModal}
                  className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
                >
                  Entendido
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
