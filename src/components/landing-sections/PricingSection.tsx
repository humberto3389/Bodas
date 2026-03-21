import React from 'react';
import { motion } from 'framer-motion';

interface PricingSectionProps {
  plansData?: any;
  handleWhatsAppClick: (e: any, planName?: string) => void;
}

export const PricingSection = ({ plansData, handleWhatsAppClick }: PricingSectionProps) => {
  return (
    <section id="planes" className="py-32 relative bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">El plan perfecto</h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-10 items-stretch">
          {['basic', 'premium', 'deluxe'].map((key) => {
            const plan = plansData?.[key];
            if (!plan) return null;
            const isPopular = key === 'premium';

            return (
              <motion.div 
                key={key} 
                className={`relative bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl border ${isPopular ? 'border-rose-400 dark:border-rose-500 scale-105 z-10' : 'border-slate-100 dark:border-slate-700'} flex flex-col h-full hover:shadow-2xl transition-all duration-500`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -12 }}
              >
                {isPopular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg tracking-widest uppercase">
                    MÁS ELEGIDO
                  </div>
                )}

                <div className="flex-1 flex flex-col items-center">
                  <span className="text-rose-500 text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-70">{key}</span>
                  <h3 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-sm font-medium text-slate-400">S/</span>
                    <span className="text-5xl font-black bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">{plan.price}</span>
                  </div>

                  <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-8" />
                  
                  <ul className="space-y-4 mb-10 w-full">
                    {plan.features.slice(0, 8).map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-[15px] text-slate-600 dark:text-slate-300 leading-tight">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        </div> 
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={(e) => handleWhatsAppClick(e, plan.name)} 
                    className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 transform ${
                      isPopular 
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.03]' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-[1.02]'
                    }`}
                  >
                    Elegir {plan.name}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
