import React from 'react';
import { motion } from 'framer-motion';

interface PricingSectionProps {
  plansData?: any;
  handleWhatsAppClick: (e: any, planName?: string) => void;
}

export const PricingSection = ({ plansData, handleWhatsAppClick }: PricingSectionProps) => {
  return (
    <section id="planes" className="py-24 relative bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">El plan perfecto</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {['basic', 'premium', 'deluxe'].map((key) => {
            const plan = plansData?.[key];
            if (!plan) return null;
            return (
              <motion.div 
                key={key} 
                className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-2xl transition-all duration-500"
                whileHover={{ y: -10 }}
              >
                <div className="flex-1 flex flex-col items-center text-center">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="text-4xl font-bold text-rose-500 mb-6">S/ {plan.price}</div>
                  <ul className="space-y-3 mb-8 w-full text-left">
                    {plan.features.slice(0, 7).map((f: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-rose-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={(e) => handleWhatsAppClick(e, plan.name)} 
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-[1.02] transition-all"
                >
                  Elegir Plan
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
