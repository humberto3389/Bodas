import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeForDisplay, validateAndFormatTime } from '../lib/timezone-utils';

interface UrgentAlertProps {
  client: any;
}

interface ChangeDetail {
  id: string;
  type: 'time' | 'location';
  event: 'Ceremonia' | 'Recepción' | 'General';
  oldValue: string;
  newValue: string;
}

export function UrgentAlert({ client }: UrgentAlertProps) {
  const [changes, setChanges] = useState<ChangeDetail[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [hasNotifiedActive, setHasNotifiedActive] = useState(false);

  // Clave única para guardar el estado visto en localStorage por cliente
  const storageKey = `seen_changes_${client?.id}`;

  const detectChanges = useCallback(() => {
    if (!client) {
      console.log('[UrgentAlert] detectChanges ignorado: client es null');
      return;
    }

    const seenDataRaw = localStorage.getItem(storageKey);
    const seenData = seenDataRaw ? JSON.parse(seenDataRaw) : null;

    const currentData = {
      weddingTime: validateAndFormatTime(client.weddingTime),
      weddingLocation: (client.isCeremonySameAsReception
        ? (client.receptionLocationName || '')
        : (client.churchName || client.ceremonyLocationName || '')).trim(),
      weddingAddress: (client.isCeremonySameAsReception
        ? (client.receptionAddress || '')
        : (client.ceremonyAddress || '')).trim(),
      receptionTime: validateAndFormatTime(client.receptionTime),
      receptionLocation: (client.isReceptionSameAsCeremony
        ? (client.churchName || client.ceremonyLocationName || '')
        : (client.receptionLocationName || '')).trim(),
      receptionAddress: (client.isReceptionSameAsCeremony
        ? (client.ceremonyAddress || '')
        : (client.receptionAddress || '')).trim(),
      isReceptionSameAsCeremony: !!client.isReceptionSameAsCeremony,
      isCeremonySameAsReception: !!client.isCeremonySameAsReception
    };

    console.log('[UrgentAlert] Detectando cambios...', {
      current: currentData,
      seen: seenData,
      fullClient: client
    });

    if (!seenData) {
      console.log('[UrgentAlert] No hay datos previos en localStorage. Guardando estado inicial:', currentData);
      localStorage.setItem(storageKey, JSON.stringify(currentData));
      return;
    }

    const detected: ChangeDetail[] = [];

    // Cambios en Ceremonia
    if (currentData.weddingTime !== seenData.weddingTime) {
      detected.push({
        id: 'c-time',
        type: 'time',
        event: 'Ceremonia',
        oldValue: formatTimeForDisplay(seenData.weddingTime),
        newValue: formatTimeForDisplay(currentData.weddingTime)
      });
    }

    const currentCeremonyLoc = `${currentData.weddingLocation} (${currentData.weddingAddress})`;
    const seenCeremonyLoc = `${seenData.weddingLocation} (${seenData.weddingAddress})`;
    if (currentCeremonyLoc !== seenCeremonyLoc) {
      detected.push({
        id: 'c-loc',
        type: 'location',
        event: 'Ceremonia',
        oldValue: seenCeremonyLoc,
        newValue: currentCeremonyLoc
      });
    }

    // Cambios en Recepción (solo si no es igual a ceremonia)
    if (!currentData.isReceptionSameAsCeremony) {
      if (currentData.receptionTime !== seenData.receptionTime) {
        detected.push({
          id: 'r-time',
          type: 'time',
          event: 'Recepción',
          oldValue: formatTimeForDisplay(seenData.receptionTime),
          newValue: formatTimeForDisplay(currentData.receptionTime)
        });
      }

      const currentReceptionLoc = `${currentData.receptionLocation} (${currentData.receptionAddress})`;
      const seenReceptionLoc = `${seenData.receptionLocation} (${seenData.receptionAddress})`;
      if (currentReceptionLoc !== seenReceptionLoc) {
        detected.push({
          id: 'r-loc',
          type: 'location',
          event: 'Recepción',
          oldValue: seenReceptionLoc,
          newValue: currentReceptionLoc
        });
      }
    }

    // Cambios en banderas de "Mismo Lugar"
    if (currentData.isReceptionSameAsCeremony !== seenData.isReceptionSameAsCeremony ||
      currentData.isCeremonySameAsReception !== seenData.isCeremonySameAsReception) {
      // Solo disparar alerta general si no hay una más específica ya detectada
      if (detected.length === 0) {
        detected.push({
          id: 'loc-mode',
          type: 'location',
          event: 'General',
          oldValue: 'Configuración de ubicación previa',
          newValue: 'Se ha unificado la ubicación de la ceremonia y recepción'
        });
      }
    }

    if (detected.length > 0) {
      console.log('[UrgentAlert] ¡Cambios detectados!', detected);
      setChanges(detected);
      setShowModal(true);
      setShowBanner(true);

      // Notificar si la pestaña no está en foco y no hemos notificado ya en esta sesión
      if (document.hidden && !hasNotifiedActive) {
        triggerNativeNotification();
        setHasNotifiedActive(true);
      }
    }
  }, [client, storageKey, hasNotifiedActive]);

  const triggerNativeNotification = () => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification("⚠️ Cambio Urgente en el Horario", {
        body: "Se han actualizado detalles importantes en la invitación. Por favor revísalos.",
        icon: "/favicon.ico"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          triggerNativeNotification();
        }
      });
    }
  };

  useEffect(() => {
    // Detectar cambios al montar el componente (cuando cargan los datos)
    if (client) {
      detectChanges();
    }
  }, [client, detectChanges]);

  const handleCloseModal = () => {
    setShowModal(false);
    // Al cerrar el modal, actualizamos los datos "vistos" para que no vuelva a saltar
    const currentData = {
      weddingTime: validateAndFormatTime(client.weddingTime),
      weddingLocation: (client.isCeremonySameAsReception
        ? (client.receptionLocationName || '')
        : (client.churchName || client.ceremonyLocationName || '')).trim(),
      weddingAddress: (client.isCeremonySameAsReception
        ? (client.receptionAddress || '')
        : (client.ceremonyAddress || '')).trim(),
      receptionTime: validateAndFormatTime(client.receptionTime),
      receptionLocation: (client.isReceptionSameAsCeremony
        ? (client.churchName || client.ceremonyLocationName || '')
        : (client.receptionLocationName || '')).trim(),
      receptionAddress: (client.isReceptionSameAsCeremony
        ? (client.ceremonyAddress || '')
        : (client.receptionAddress || '')).trim(),
      isReceptionSameAsCeremony: !!client.isReceptionSameAsCeremony,
      isCeremonySameAsReception: !!client.isCeremonySameAsReception
    };
    localStorage.setItem(storageKey, JSON.stringify(currentData));
    console.log('[UrgentAlert] Cambios marcados como vistos.');
  };

  if (changes.length === 0) return null;

  return (
    <>
      {/* Banner Superior Persistente */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white py-2 px-4 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest">
              <span className="animate-pulse">⚠️</span>
              <span>¡Atención! Hay cambios importantes en el evento</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase"
            >
              Ver Detalles
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Emergencia */}
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
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

              <div className="relative text-center">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                  📢
                </div>

                <h2 className="font-elegant text-3xl text-slate-900 font-bold mb-4 leading-tight">
                  Aviso de Cambio Urgente
                </h2>

                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Los novios han actualizado algunos detalles que debes tener en cuenta. Por favor, revisa los cambios:
                </p>

                {client.changeExplanation && (
                  <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-slate-700 text-sm text-center">
                    "{client.changeExplanation}"
                  </div>
                )}

                <div className="space-y-4 mb-10 text-left">
                  {changes.map((change) => (
                    <div key={change.id} className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-rose-600 text-lg">{change.type === 'time' ? '🕒' : '📍'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                          {change.event}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-medium">Anterior: <span className="line-through">{change.oldValue}</span></div>
                        <div className="text-sm font-bold text-slate-800">Nuevo: {change.newValue}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseModal}
                  className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
                >
                  Entendido, ¡Gracias!
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
