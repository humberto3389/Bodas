import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminTourProps {
  clientId: string;
  clientName: string;
  setActiveTab: (tab: 'content' | 'rsvps' | 'messages' | 'media' | 'testimonial') => void;
}

export function AdminTour({ clientId, clientName, setActiveTab }: AdminTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si ya vio el tour
    const tourKey = `tour_seen_${clientId}`;
    const hasSeenTour = localStorage.getItem(tourKey);

    if (!hasSeenTour) {
      // Mostrar el tour con un pequeño retraso
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [clientId]);

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem(`tour_seen_${clientId}`, 'true');
    setActiveTab('content'); // Regresar a la pestaña principal
  };

  const steps = [
    {
      title: "¡Bienvenido a tu Panel!",
      content: `Hola ${clientName}, aquí podrás personalizar cada detalle de tu invitación de boda digital. Te daremos un recorrido rápido de 1 minuto.`,
      action: () => setActiveTab('content'),
      icon: "✨"
    },
    {
      title: "1. Contenido",
      content: "En la pestaña 'Contenido' vas a escribir la frase de bienvenida, los lugares de la ceremonia y la fecha exacta.",
      action: () => setActiveTab('content'),
      icon: "✍️"
    },
    {
      title: "2. Multimedia",
      content: "La pestaña 'Multimedia' es donde ocurre la magia. Aquí subirás tu foto de portada, la música de fondo y los videos de su historia.",
      action: () => setActiveTab('media'),
      icon: "📸"
    },
    {
      title: "3. RSVPs",
      content: "En 'RSVP' verás automáticamente las confirmaciones de las personas que asistirán. ¡Llevarás el control exacto de tus invitados!",
      action: () => setActiveTab('rsvps'),
      icon: "📋"
    },
    {
      title: "4. Mensajes",
      content: "Tus amigos y familiares te dejarán mensajes de cariño y buenos deseos. Podrás leerlos y administrarlos en la pestaña 'Mensajes'.",
      action: () => setActiveTab('messages'),
      icon: "💌"
    },
    {
      title: "¡Todo listo!",
      content: "Ya puedes empezar a armar la página de tu boda. Si tienes cualquier duda, recuerda que tu wedding planner o soporte están a tu disposición.",
      action: () => setActiveTab('content'),
      icon: "🚀"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      steps[nextStep].action();
    } else {
      completeTour();
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay para oscurecer el fondo pero dejar ver la app */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Modal principal */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header decorativo */}
          <div className="h-32 bg-gradient-to-br from-rose-400 via-rose-500 to-amber-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 blur-2xl rounded-full" />
            <div className="absolute top-6 left-6 text-5xl drop-shadow-lg">
              {step.icon}
            </div>
            
            <button 
              onClick={handleSkip}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-md"
              aria-label="Cerrar tour"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500">
                Guía Rápida ({currentStep + 1}/{steps.length})
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 font-serif">
              {step.title}
            </h3>
            <p className="text-slate-600 leading-relaxed mb-8">
              {step.content}
            </p>

            {/* Barra de progreso */}
            <div className="flex justify-center gap-1.5 mb-8">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-8 bg-rose-500' : 
                    idx < currentStep ? 'w-2 bg-rose-200' : 'w-2 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {/* Botonera */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-[0.5] py-3.5 px-4 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-colors"
              >
                Omitir
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 px-4 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-slate-900/30 transform hover:-translate-y-0.5 transition-all"
              >
                {currentStep === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
