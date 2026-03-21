import { useState } from 'react';
import { motion } from 'framer-motion';

interface DemoSectionProps {
  demoUrl?: string;
}

export const DemoSection = ({ demoUrl }: DemoSectionProps) => {
  const [showDemoIframe, setShowDemoIframe] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 text-rose-500 dark:text-rose-400 mb-4">
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
              <span className="text-sm font-semibold tracking-wider">Tú tienes el control</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Diseño profesional,<br/>
              <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">
                 fácil de personalizar
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Personaliza tu invitación desde tu propio panel: agrega fotos, música, ubicación y todos los detalles de tu boda sin complicaciones.
            </p>

            <button
              onClick={() => window.open(demoUrl || 'https://suspiro-nupcial.vercel.app/invitacion/humberto-nelida', '_blank')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl shadow-xl hover:shadow-2xl border border-slate-200 dark:border-slate-700 transition-all font-semibold"
            >
              <span>💍 Mira cómo se verá tu invitación</span>
            </button>
          </motion.div>

          <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[400px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-400/20 to-amber-500/20 blur-3xl rounded-full" />
            
            <div className="relative rounded-[2.5rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-[9/19]">
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-1/2 mx-auto z-20" />
              
              <div 
                className="w-full h-full absolute inset-0 z-10 bg-slate-800 flex items-center justify-center p-8"
                ref={(el) => {
                  if (el && !showDemoIframe) {
                    const observer = new IntersectionObserver((entries) => {
                      if (entries[0].isIntersecting) {
                        setShowDemoIframe(true);
                        observer.disconnect();
                      }
                    }, { rootMargin: '200px' });
                    observer.observe(el);
                  }
                }}
              >
                {showDemoIframe ? (
                  <iframe 
                    src={demoUrl || 'https://suspiro-nupcial.vercel.app/invitacion/humberto-nelida'}
                    title="Demo de Invitación"
                    className="w-full h-full border-0 absolute inset-0"
                    allow="fullscreen; autoplay"
                  />
                ) : (
                  <div className="text-white/40 text-[10px] text-center">Cargando demo...</div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
