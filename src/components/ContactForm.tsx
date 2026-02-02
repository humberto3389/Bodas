import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SYSTEM_CONFIG } from '../lib/config';
import { supabase } from '../lib/supabase';
import { useAlert } from '../hooks/useAlert';
import { LoadingSpinner } from './LoadingSpinner';

interface ContactFormProps {
  selectedPlan: 'basic' | 'premium' | 'deluxe' | null;
}

export default function ContactForm({ selectedPlan }: ContactFormProps) {
  const { showAlert } = useAlert()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    message: '',
    plan: selectedPlan || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Guardar en Supabase si está configurado
      // Insertar en la nueva tabla centralizada admin_messages
      const messageData = {
        type: 'contact',
        client_name: formData.name,
        email: formData.email,
        subject: formData.plan ? `Interés en Plan ${formData.plan.toUpperCase()}` : 'Consulta de Contacto',
        message: `Teléfono: ${formData.phone || 'N/A'}\nFecha Boda: ${formData.weddingDate || 'N/A'}\n\nMensaje:\n${formData.message}`,
        requested_plan: formData.plan || null,
        status: 'new',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_messages')
        .insert([messageData]);

      if (error) {
        // Continuar aunque falle Supabase (modo degradado)
      }

      // También mostrar información en consola para desarrollo

      // Mostrar mensaje de éxito
      setIsSubmitted(true);

      // Resetear formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        weddingDate: '',
        message: '',
        plan: ''
      });

      // Resetear mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);

    } catch (error) {
      showAlert('Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente o contáctanos directamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute -top-24 left-0 right-0 bg-gradient-to-r from-rose-400 to-amber-500 text-white p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-white/30 mb-6"
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-medium">¡Gracias! Te contactaremos pronto.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 dark:border-slate-700/50"
      >
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-neutral-700 dark:text-slate-200 placeholder-neutral-400 dark:placeholder-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-neutral-700 dark:text-slate-200 placeholder-neutral-400 dark:placeholder-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-neutral-700 dark:text-slate-200 placeholder-neutral-400 dark:placeholder-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
              placeholder="+58 412 123 4567"
            />
          </div>

          <div>
            <label htmlFor="weddingDate" className="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">
              Fecha de la boda (aproximada)
            </label>
            <input
              type="date"
              id="weddingDate"
              name="weddingDate"
              value={formData.weddingDate}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-neutral-700 dark:text-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="plan" className="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">
              Plan de interés
            </label>
            <select
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-neutral-700 dark:text-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
            >
              <option value="">Selecciona un plan (opcional)</option>
              {Object.entries(SYSTEM_CONFIG.PLANS).map(([key, plan]) => (
                <option key={key} value={key}>
                  {plan.name} - S/ {plan.price} ({plan.duration} días)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="message" className="block text sm font-medium text-neutral-700 dark:text-slate-200 mb-2">
              Mensaje o consulta
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-2xl border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-neutral-700 dark:text-slate-200 placeholder-neutral-400 dark:placeholder-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300 resize-none"
              placeholder="Cuéntanos sobre tu boda, preguntas que tengas, o cualquier información adicional..."
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-rose-400 to-amber-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <LoadingSpinner size="sm" />
              <span>Enviando...</span>
            </div>
          ) : (
            'Enviar Solicitud de Contacto'
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}

