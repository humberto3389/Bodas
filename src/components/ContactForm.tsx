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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-10 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 dark:border-slate-800/60"
      >
        <div className="space-y-10">
          {/* Header del Formulario */}
          <div className="text-center md:text-left border-b border-slate-100 dark:border-slate-800 pb-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Envíanos un mensaje</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Estás a un paso de tener la invitación de tus sueños.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
            {/* Nombre */}
            <div className="relative group">
              <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2 block ml-1 transition-colors group-focus-within:text-rose-500">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-3 px-1 text-slate-800 dark:text-white focus:outline-none focus:border-rose-400 transition-all duration-300 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="Ej. María García"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2 block ml-1 transition-colors group-focus-within:text-rose-500">
                Email de contacto *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-3 px-1 text-slate-800 dark:text-white focus:outline-none focus:border-rose-400 transition-all duration-300 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="hola@ejemplo.com"
              />
            </div>

            {/* Teléfono */}
            <div className="relative group">
              <label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2 block ml-1 transition-colors group-focus-within:text-rose-500">
                WhatsApp / Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-3 px-1 text-slate-800 dark:text-white focus:outline-none focus:border-rose-400 transition-all duration-300 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="+51 900 000 000"
              />
            </div>

            {/* Fecha Boda */}
            <div className="relative group">
              <label htmlFor="weddingDate" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2 block ml-1 transition-colors group-focus-within:text-rose-500">
                Fecha de la Boda
              </label>
              <input
                type="date"
                id="weddingDate"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-3 px-1 text-slate-800 dark:text-white focus:outline-none focus:border-rose-400 transition-all duration-300"
              />
            </div>

            {/* Plan de Interés */}
            <div className="md:col-span-2 relative group">
              <label htmlFor="plan" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2 block ml-1 transition-colors group-focus-within:text-rose-500">
                Plan que te interesa
              </label>
              <select
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-3 px-1 text-slate-800 dark:text-white focus:outline-none focus:border-rose-400 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900">Selecciona un plan (opcional)</option>
                {Object.entries(SYSTEM_CONFIG.PLANS).map(([key, plan]) => (
                  <option key={key} value={key} className="dark:bg-slate-900">
                    {plan.name} - S/ {plan.price}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 bottom-4 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Mensaje */}
            <div className="md:col-span-2 relative group">
              <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-2 block ml-1 transition-colors group-focus-within:text-rose-500">
                Cuéntanos más detalles
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-slate-100 dark:border-slate-800/50 p-5 text-slate-800 dark:text-white focus:outline-none focus:border-rose-400/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 resize-none"
                placeholder="¿Tienes alguna duda o requerimiento especial?"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-5 px-8 rounded-2xl shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-[0.3em] uppercase"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <LoadingSpinner size="sm" />
                <span>Enviando...</span>
              </div>
            ) : (
              'Enviar mensaje'
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}

