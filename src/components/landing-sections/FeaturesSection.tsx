import React from 'react';
import { motion } from 'framer-motion';

interface FeaturesSectionProps {
  featuresList?: any[];
  featuresBadge?: string;
  featuresTitleLine1?: string;
  featuresTitleHighlight?: string;
  featuresDescription?: string;
}

export const FeaturesSection = ({ 
  featuresList, 
  featuresBadge, 
  featuresTitleLine1, 
  featuresTitleHighlight, 
  featuresDescription 
}: FeaturesSectionProps) => {
  const defaultFeatures = [
    { icon: '💒', title: 'Diseño Exclusivo', description: 'Plantillas únicas adaptadas a tu estilo y personalidad' },
    { icon: '📸', title: 'Galería Elegante', description: 'Muestra tus mejores momentos con una galería sofisticada' },
    { icon: '✉️', title: 'RSVP Inteligente', description: 'Gestión automática de confirmaciones' }
  ];

  return (
    <section id="servicios" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-rose-500 font-semibold tracking-wider block mb-4">
            {featuresBadge || 'CARACTERÍSTICAS EXCLUSIVAS'}
          </span>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
            {featuresTitleLine1 || 'Diseñado para el'}{' '}
            <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">
              {featuresTitleHighlight || 'amor eterno'}
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {featuresDescription || 'Cada detalle cuidadosamente creado para reflejar tu historia.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {(featuresList || defaultFeatures).slice(0, 6).map((feature: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-slate-700/50 flex flex-col h-full text-center hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
