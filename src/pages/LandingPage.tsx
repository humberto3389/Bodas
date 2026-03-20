import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ContactForm from '../components/ContactForm';
import { loadLandingPageContent, type LandingPageContent } from '../lib/landing-page-content';
import { LandingParticles } from '../components/landing-sections/LandingParticles';

const DemoSection = React.lazy(() => import('../components/landing-sections/DemoSection').then(m => ({ default: m.DemoSection })));
const FeaturesSection = React.lazy(() => import('../components/landing-sections/FeaturesSection').then(m => ({ default: m.FeaturesSection })));
const TestimonialsSection = React.lazy(() => import('../components/landing-sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const PricingSection = React.lazy(() => import('../components/landing-sections/PricingSection').then(m => ({ default: m.PricingSection })));

const WHATSAPP_NUMBER = (import.meta as any).env.VITE_WHATSAPP_NUMBER || '51960696131';
const FALLBACK_WHATSAPP_MESSAGE = 'Hola, quiero mi página web de boda. Me gustaría más información sobre los planes 💍';

import { SEO_Landing } from '../components/SEO_Landing';

export default function LandingPage() {
  const [selectedPlan] = React.useState<'basic' | 'premium' | 'deluxe' | null>(null);
  const [isDark, setIsDark] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [content, setContent] = React.useState<LandingPageContent | null>(null);

  useEffect(() => {
    setIsDark(false);
    localStorage.setItem('site-dark', '0');
    document.documentElement.classList.remove('dark');
  }, []);

  // Cargar contenido del Landing Page desde Supabase
  useEffect(() => {
    loadLandingPageContent().then(setContent).catch(console.error);
  }, []);

  const toggleDark = () => {
    setIsDark((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('site-dark', next ? '1' : '0');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const handleWhatsAppClick = (e: React.MouseEvent, planName?: string) => {
    e.preventDefault();

    // Limpiar el número: quitar espacios, guiones, paréntesis y el signo +
    let cleanNumber = WHATSAPP_NUMBER.replace(/[\s\-()+]/g, '');

    // Asegurarse de que el número tenga el formato correcto (solo dígitos)
    cleanNumber = cleanNumber.replace(/\D/g, '');

    // Validar que el número tenga al menos 10 dígitos
    if (cleanNumber.length < 10) {
      return;
    }

    // Crear mensaje personalizado si viene un nombre de plan
    let message = content?.whatsappMessage || FALLBACK_WHATSAPP_MESSAGE;
    if (planName) {
      message = `Hola, quiero mi página web de boda. Me gustaría más información sobre el plan *${planName}* 💍`;
    }

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Detectar si es móvil
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobileDevice) {
      // En móvil, usar el protocolo nativo directamente
      if (/Android/i.test(navigator.userAgent)) {
        // Android: usar intent:// que abre directamente la app sin preguntar
        try {
          window.location.href = `intent://send?phone=${cleanNumber}&text=${encodedMessage}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
        } catch (e) {
          // Fallback si falla
          window.location.href = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
        }
      } else {
        // iOS: usar protocolo whatsapp:// directamente
        window.location.href = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
      }
    } else {
      // En desktop, usar directamente web.whatsapp.com que abre WhatsApp Web sin página intermedia
      // Esta es la URL que usa WhatsApp Web internamente
      window.open(`https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-rose-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-500">
      <SEO_Landing />
      <LandingParticles isMobile={isMobile} isDark={isDark} />

      {/* Navbar ultra moderno - SIEMPRE con fondo oscuro */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-slate-700/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Anillo izquierdo */}
                  <circle cx="9" cy="12" r="3.5" fill="none" stroke="white" />
                  {/* Anillo derecho */}
                  <circle cx="15" cy="12" r="3.5" fill="none" stroke="white" />
                  {/* Línea de unión elegante */}
                  <path d="M9 12 L15 12" stroke="white" strokeWidth="1.5" opacity="0.6" />
                </svg>
              </div>
              <div className="text-2xl font-bold tracking-tight text-white">
                Suspiro<span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">Nupcial</span>
              </div>
            </motion.div>

            {/* Menú Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {['Servicios', 'Planes', 'Contacto'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-white/90 hover:text-white text-sm font-medium transition-all duration-300"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-500 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              ))}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-rose-400 to-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-rose-400/25 inline-flex items-center space-x-2"
                >
                  <span>Acceder</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>

              {/* Botón Dark Mode */}
              <motion.button
                onClick={toggleDark}
                className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDark ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </motion.button>
            </div>

            {/* Menú Móvil */}
            <div className="flex items-center space-x-3 md:hidden">
              <motion.button
                onClick={toggleDark}
                className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
                whileTap={{ scale: 0.95 }}
              >
                {isDark ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </motion.button>

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-800/95 backdrop-blur-xl border-t border-slate-700/50"
            >
              <div className="px-4 py-4 space-y-3">
                {['Servicios', 'Planes', 'Contacto'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-white/90 hover:text-white py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.div
                  onClick={() => setIsMenuOpen(false)}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/login"
                    className="block bg-gradient-to-r from-rose-400 to-amber-500 text-white py-3 px-4 rounded-xl text-center font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    Acceder
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section Ultra Moderna */}
      <header className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden snap-section">
        {/* Fondo gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20" />

        {/* Elementos decorativos */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-rose-200/30 to-pink-200/20 rounded-full blur-3xl opacity-60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-200/20 to-yellow-200/10 rounded-full blur-3xl opacity-60"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge elegante */}
            <motion.div
              className="inline-flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl px-6 py-3 border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-2 h-2 bg-gradient-to-r from-rose-400 to-amber-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {content?.heroBadgeText || 'Tu historia de amor, compartida elegantemente'}
              </span>
            </motion.div>

            {/* Título principal */}
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 dark:text-white leading-tight"
              initial={false} // Desactivar animación inicial en móvil para ganar LCP
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block">{content?.heroTitleLine1 || 'Donde cada'}</span>
              <motion.span
                className="bg-gradient-to-r from-rose-400 via-rose-500 to-amber-500 bg-clip-text text-transparent"
                animate={{ opacity: 1 }}
              >
                {content?.heroTitleHighlight || 'suspiro'}
              </motion.span>
              <span className="block">{content?.heroTitleLine2 || 'se convierte'}</span>
              <span className="block">{content?.heroTitleLine3 || 'en eternidad'}</span>
            </motion.h1>

            <motion.p
              className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {content?.heroDescription || 'Crea un sitio web excepcional para tu boda. Comparte tu amor con elegancia y haz que cada momento sea memorable para tus invitados con nuestra plataforma de última generación.'}
            </motion.p>

            {/* Botones de acción y Microcopy */}
            <motion.div
              className="flex flex-col items-center pt-8 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                <motion.button
                  onClick={handleWhatsAppClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-gradient-to-r from-rose-500 to-amber-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/30 transition-all duration-500 w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <span>{content?.heroButton1Text || '💬 Pedir mi invitación'}</span>
                </motion.button>

                <motion.button  onClick={() => window.open(content?.demoUrl || 'https://suspiro-nupcial.vercel.app/invitacion/humberto-nelida', '_blank')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 font-semibold px-8 py-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-green-400/50 transition-all duration-500 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </motion.div>
                  <span>{content?.heroButton2Text || 'Ver Demo Interactivo'}</span>
                </motion.button>
              </div>

              <motion.div 
                className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {content?.heroMicrocopy || 'Desde S/39 • Lista en 24h • Fácil de personalizar'}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>


      </header>

      <React.Suspense fallback={<div className="h-64 flex items-center justify-center">Cargando...</div>}>
        <section className="snap-section w-full flex flex-col items-center py-10 md:py-20">
          <DemoSection demoUrl={content?.demoUrl} />
        </section>
        <section className="snap-section w-full flex flex-col items-center py-10 md:py-20">
          <FeaturesSection 
            featuresList={content?.featuresList}
            featuresBadge={content?.featuresBadge}
            featuresTitleLine1={content?.featuresTitleLine1}
            featuresTitleHighlight={content?.featuresTitleHighlight}
            featuresDescription={content?.featuresDescription}
          />
        </section>
        <section className="snap-section w-full flex flex-col items-center py-10 md:py-20">
          <TestimonialsSection 
            testimonialsList={content?.testimonialsList}
            testimonialsTitle={content?.testimonialsTitle}
          />
        </section>
        <section className="snap-section w-full flex flex-col items-center py-10 md:py-20">
          <PricingSection 
            plansData={content?.plansData}
            handleWhatsAppClick={handleWhatsAppClick}
          />
        </section>
      </React.Suspense>

      {/* Sección de Contacto - Diseño Elegante */}
      <section id="contacto" className="py-12 md:py-32 relative snap-section w-full flex flex-col items-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 text-rose-400 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
              <span className="text-sm font-semibold tracking-wider">{content?.contactBadge || 'CONTACTO'}</span>
            </motion.div>
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {content?.contactTitleLine1 || 'Comienza tu'}{' '}
              <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">
                {content?.contactTitleHighlight || 'historia de amor'}
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {content?.contactDescription || 'Estamos aquí para hacer realidad el sitio web perfecto para tu boda. Cuéntanos sobre tu proyecto y creemos magia juntos.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 dark:border-slate-700/50"
          >
            <ContactForm selectedPlan={selectedPlan} />
          </motion.div>
        </div>
      </section>

      {/* Footer Mejorado */}
      <footer className="bg-slate-900 text-white py-20 relative overflow-hidden">
        {/* Efecto de partículas en el footer - Desactivado en móvil para performance */}
        {!isMobile && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-1 h-1 bg-rose-400/20 rounded-full"
            style={{
              left: `${20 + i * 10}%`,
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.2,
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <motion.div
                className="flex items-center space-x-3 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Anillo izquierdo */}
                    <circle cx="9" cy="12" r="3.5" fill="none" stroke="white" />
                    {/* Anillo derecho */}
                    <circle cx="15" cy="12" r="3.5" fill="none" stroke="white" />
                    {/* Línea de unión elegante */}
                    <path d="M9 12 L15 12" stroke="white" strokeWidth="1.5" opacity="0.6" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-white">
                  {(() => {
                    const brandName = content?.footerBrandName || 'SuspiroNupcial';
                    if (brandName.includes('Nupcial')) {
                      const parts = brandName.split('Nupcial');
                      return (
                        <>
                          {parts[0]}
                          <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">Nupcial</span>
                        </>
                      );
                    }
                    return (
                      <>
                        {brandName}
                        <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">Nupcial</span>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
              <p className="text-slate-400 mb-6 max-w-md text-lg leading-relaxed">
                {content?.footerDescription || 'Creamos sitios web excepcionales para bodas, donde cada detalle cuenta la historia única de tu amor. Elegante, moderno y memorable.'}
              </p>
            </div>

            {/* Enlaces */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Enlaces Rápidos</h4>
              <div className="space-y-4">
                {(content?.footerLinks || ['Servicios', 'Planes', 'Contacto', 'Login']).map((link, index) => (
                  link === 'Login' ? (
                    <motion.div
                      key={link}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        to="/login"
                        className="block text-slate-400 hover:text-rose-400 transition-colors duration-300 text-lg py-2"
                      >
                        {link}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={link}
                      href={`#${link.toLowerCase()}`}
                      className="block text-slate-400 hover:text-rose-400 transition-colors duration-300 text-lg py-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  )
                ))}
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Contacto</h4>
              <div className="space-y-4 text-lg text-slate-400">
                <motion.a
                  href={`mailto:${content?.footerEmail || 'hola@suspironupcial.com'}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 hover:text-rose-400 transition-colors duration-300 cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <span>📧</span>
                  <span>{content?.footerEmail || 'hola@suspironupcial.com'}</span>
                </motion.a>
                <motion.a
                  href={`https://wa.me/${(content?.footerPhone || '+58 412 123 4567').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 hover:text-rose-400 transition-colors duration-300 cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <span>📱</span>
                  <span>{content?.footerPhone || '+58 412 123 4567'}</span>
                </motion.a>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <span>💬</span>
                  <span>WhatsApp disponible</span>
                </motion.p>
              </div>
            </div>
          </div>

          {/* Línea divisoria y copyright */}
          <motion.div
            className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="mb-4">
              {content?.footerCopyright || `© ${new Date().getFullYear()} Suspiro Nupcial. Todos los derechos reservados.`}
              <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent font-semibold ml-2">
                {content?.footerCopyrightText || 'Hecho con 💕 para tu día especial'}
              </span>
            </p>
            <div className="pt-8 flex flex-col items-center justify-center gap-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-semibold">
                Powered by
              </span>
              <a
                href="https://horizonstudio.site"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity hover:scale-105 transform duration-300"
              >
                <img
                  src="/Logo1.png"
                  alt="Horizon Studio"
                  className="h-12 w-auto object-contain rounded-lg shadow-sm"
                />
              </a>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mt-2"></div>
            </div>
          </motion.div>
        </div>
      </footer>

    </div>
  );
}
