import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SYSTEM_CONFIG } from '../lib/config';
import ContactForm from '../components/ContactForm';
import { MagneticButton } from '../components/MagneticButton';
import { loadLandingPageContent, type LandingPageContent } from '../lib/landing-page-content';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '51960696131';
const WHATSAPP_MESSAGE = 'Hola! Me interesa contratar un sitio web para mi boda. Podrian brindarme mas informacion sobre los planes disponibles?';

// Componente de partículas de nieve para el navbar (SIEMPRE visibles)
const NavbarSnowParticle = ({ index: _index, mobile = false }: { index: number, mobile?: boolean }) => {
  const isLarge = Math.random() < 0.3;
  const sizeBase = isLarge ? Math.random() * 8 + 6 : Math.random() * 5 + 3;
  const size = sizeBase * (mobile ? 0.6 : 1);
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = Math.random() * 6 + (isLarge ? 8 : 5);
  const delay = Math.random() * -8;
  const swayAmount = Math.random() * 50 + (isLarge ? 30 : 20);
  const opacity = isLarge ? 1 : Math.random() * 0.4 + 0.6;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        boxShadow: isLarge
          ? '0 0 20px 3px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 215, 0, 0.6)'
          : '0 0 15px rgba(255, 255, 255, 0.8), 0 0 5px rgba(255, 215, 0, 0.4)',
        left: `${startX}%`,
        top: `${startY}%`,
        filter: `blur(${isLarge ? 0.2 : 0.5}px)`,
        zIndex: 1,
      }}
      animate={{
        y: [`${startY}%`, `${startY + 150}%`],
        x: [0, swayAmount, -swayAmount, 0],
        scale: isLarge ? [1, 1.3, 1] : [1, 1.2, 1],
      }}
      transition={{
        y: {
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          delay: delay,
        },
        x: {
          duration: duration * 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        },
        scale: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        }
      }}
    />
  );
};

// Componente de partículas de nieve para el modo oscuro (SOLO en dark mode)
const DarkModeSnowParticle = ({ index: _index, mobile = false }: { index: number, mobile?: boolean }) => {
  const isLarge = Math.random() < 0.25;
  const sizeBase = isLarge ? Math.random() * 7 + 5 : Math.random() * 4 + 2;
  const size = sizeBase * (mobile ? 0.7 : 1);
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = Math.random() * 8 + (isLarge ? 12 : 8);
  const delay = Math.random() * -12;
  const swayAmount = Math.random() * 60 + (isLarge ? 40 : 25);
  const opacity = isLarge ? 0.9 : Math.random() * 0.3 + 0.5;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        boxShadow: isLarge
          ? '0 0 25px 4px rgba(255, 255, 255, 0.95), 0 0 12px rgba(255, 255, 255, 0.7)'
          : '0 0 18px 2px rgba(255, 255, 255, 0.85), 0 0 6px rgba(255, 255, 255, 0.5)',
        left: `${startX}%`,
        top: `${startY}%`,
        filter: `blur(${isLarge ? 0.1 : 0.3}px)`,
        zIndex: 0,
      }}
      animate={{
        y: [`${startY}%`, `${startY + 200}%`],
        x: [0, swayAmount, -swayAmount, 0],
        scale: isLarge ? [1, 1.4, 1] : [1, 1.15, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        y: {
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          delay: delay,
        },
        x: {
          duration: duration * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        },
        scale: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        },
        rotate: {
          duration: duration * 3,
          repeat: Infinity,
          ease: "linear",
          delay: delay,
        }
      }}
    />
  );
};

// Partículas de fondo mejoradas (sin nieve)
const FloatingParticles = ({ mobile = false }: { mobile?: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: mobile ? 8 : 20 }).map((_, i) => {
        const size = mobile ? (Math.random() * 2 + 1) : (Math.random() * 3 + 2);
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              rotate: [0, 180, 360],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut"
            }}
          >
            <div
              className={`${i % 4 === 0 ? 'bg-gradient-to-r from-rose-400/40 to-pink-400/40' :
                i % 4 === 1 ? 'bg-gradient-to-r from-amber-400/30 to-yellow-400/30' :
                  i % 4 === 2 ? 'bg-gradient-to-r from-emerald-400/20 to-teal-400/20' :
                    'bg-gradient-to-r from-violet-400/20 to-purple-400/20'
                } rounded-full blur-[1px]`}
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

// Componente de partículas geométricas
const GeometricParticle = ({ index: _index }: { index: number }) => {
  const shapes = ['circle', 'square', 'triangle'];
  const shape = shapes[_index % 3];
  const size = Math.random() * 8 + 4;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = Math.random() * 8 + 12;
  const delay = Math.random() * -15;
  const opacity = Math.random() * 0.3 + 0.1;

  const getShape = () => {
    switch (shape) {
      case 'square':
        return 'rounded-lg';
      case 'triangle':
        return 'w-0 h-0 border-l-transparent border-r-transparent border-b-white';
      default:
        return 'rounded-full';
    }
  };

  return (
    <motion.div
      className={`absolute pointer-events-none ${getShape()} ${shape !== 'triangle' ? 'bg-white/10 backdrop-blur-sm' : 'border-l-[6px] border-r-[6px] border-b-[10px] border-b-white/10'
        }`}
      style={{
        width: shape !== 'triangle' ? `${size}px` : '0',
        height: shape !== 'triangle' ? `${size}px` : '0',
        left: `${startX}%`,
        top: `${startY}%`,
        opacity,
        filter: 'blur(0.5px)',
      }}
      animate={{
        y: [`${startY}%`, `${startY + 150}%`],
        x: [0, Math.random() * 30 - 15, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        y: {
          duration,
          repeat: Infinity,
          ease: "linear",
          delay,
        },
        x: {
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        rotate: {
          duration: duration * 2,
          repeat: Infinity,
          ease: "linear",
          delay,
        }
      }}
    />
  );
};

import { SEO_Landing } from '../components/SEO_Landing';

export default function LandingPage() {
  const [selectedPlan] = useState<'basic' | 'premium' | 'deluxe' | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [content, setContent] = useState<LandingPageContent | null>(null);

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
    setIsDark(prev => {
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
    let message = WHATSAPP_MESSAGE;
    if (planName) {
      message = `Hola! Me interesa el plan *${planName}* para crear mi sitio web de boda. ¿Podrían brindarme más información al respecto?`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-500">
      <SEO_Landing />
      {/* Partículas de fondo */}
      <FloatingParticles mobile={isMobile} />

      {/* Partículas geométricas */}
      {Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => (
        <GeometricParticle key={i} index={i} />
      ))}

      {/* Partículas de nieve SOLO en modo oscuro para el landing page */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: isMobile ? 15 : 35 }).map((_, i) => (
            <DarkModeSnowParticle key={i} index={i} mobile={isMobile} />
          ))}
        </div>
      )}

      {/* Navbar ultra moderno - SIEMPRE con fondo oscuro y partículas de nieve */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-slate-700/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Partículas de nieve en el navbar - SIEMPRE visibles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: isMobile ? 12 : 25 }).map((_, i) => (
            <NavbarSnowParticle key={i} index={i} mobile={isMobile} />
          ))}
        </div>

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
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="block">{content?.heroTitleLine1 || 'Donde cada'}</span>
              <motion.span
                className="bg-gradient-to-r from-rose-400 via-rose-500 to-amber-500 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
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

            {/* Botones de acción */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MagneticButton
                href="#planes"
                strength={0.4}
                className="group bg-gradient-to-r from-rose-400 to-amber-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/30 transition-all duration-500"
              >
                <span className="flex items-center space-x-2">
                  <span>{content?.heroButton1Text || 'Descubrir Planes'}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </MagneticButton>

              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 font-semibold px-8 py-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-green-400/50 transition-all duration-500 flex items-center space-x-3 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </motion.div>
                <span>{content?.heroButton2Text || 'Consultar Disponibilidad'}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>


      </header>

      {/* Sección de Características - Diseño Moderno */}
      <section id="servicios" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div
              className="inline-flex items-center gap-2 text-rose-500 dark:text-rose-400 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
              <span className="text-sm font-semibold tracking-wider">{content?.featuresBadge || 'CARACTERÍSTICAS EXCLUSIVAS'}</span>
            </motion.div>
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {content?.featuresTitleLine1 || 'Diseñado para el'}{' '}
              <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">
                {content?.featuresTitleHighlight || 'amor eterno'}
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {content?.featuresDescription || 'Cada detalle cuidadosamente creado para hacer de tu sitio web el reflejo perfecto de tu historia de amor'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(content?.featuresList || [
              {
                icon: '💒',
                title: 'Diseño Exclusivo',
                description: 'Plantillas únicas adaptadas a tu estilo y personalidad con tecnología de vanguardia'
              },
              {
                icon: '📸',
                title: 'Galería Elegante',
                description: 'Muestra tus mejores momentos con una galería sofisticada y de alta resolución'
              },
              {
                icon: '✉️',
                title: 'RSVP Inteligente',
                description: 'Gestión automática de confirmaciones con recordatorios inteligentes'
              },
              {
                icon: '💌',
                title: 'Mensajes Especiales',
                description: 'Libro de visitas digital para recuerdos eternos de tus seres queridos'
              },
              {
                icon: '⏰',
                title: 'Cuenta Regresiva',
                description: 'Mantén la emoción con un contador elegante y personalizable'
              },
              {
                icon: '🎵',
                title: 'Ambiente Musical',
                description: 'Tu canción especial ambientando cada visita al sitio'
              }
            ]).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl border border-white/50 dark:border-slate-700/50 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Efecto de gradiente al hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-amber-50/50 dark:from-rose-900/10 dark:to-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icono animado */}
                <motion.div
                  className="relative z-10 text-5xl mb-6"
                  animate={{
                    scale: hoveredCard === index ? 1.1 : 1,
                    rotate: hoveredCard === index ? 5 : 0
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>

                {/* Contenido */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Línea decorativa animada */}
                <motion.div
                  className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-rose-400 to-amber-500 group-hover:w-full transition-all duration-700"
                  initial={false}
                  animate={{ width: hoveredCard === index ? '100%' : '0%' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Planes - Diseño Premium */}
      <section id="planes" className="py-32 relative bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              className="inline-flex items-center gap-2 text-rose-500 dark:text-rose-400 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
              <span className="text-sm font-semibold tracking-wider">{content?.plansBadge || 'PLANES Y PRECIOS'}</span>
            </motion.div>
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {content?.plansTitleLine1 || 'El plan perfecto para'}{' '}
              <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">
                {content?.plansTitleHighlight || 'tu día especial'}
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {content?.plansDescription || 'Desde lo esencial hasta una experiencia completa y personalizada para hacer tu boda inolvidable'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {['basic', 'premium', 'deluxe'].map((key, index) => {
              const plans = content?.plansData || SYSTEM_CONFIG.PLANS;
              const plan = (plans as any)[key];
              if (!plan) return null;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`relative group ${key === 'premium' ? 'md:-translate-y-4' : ''
                    }`}
                >
                  {key === 'premium' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-400 to-amber-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg z-30">
                      {content?.plansPopularBadge || 'Más Popular'}
                    </div>
                  )}
                  <div className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl border-2 transition-all duration-500 overflow-hidden ${selectedPlan === key
                    ? 'border-rose-400 shadow-3xl scale-105'
                    : 'border-white/50 dark:border-slate-700/50 group-hover:border-rose-300/50'
                    } ${key === 'premium' ? 'ring-2 ring-rose-400/20' : ''}`}>

                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      {/* Header del plan */}
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">S/ {plan.price}</span>
                          <span className="text-slate-500 dark:text-slate-400 text-lg ml-2">/una vez</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                          <p>Duración: {plan.duration} días</p>
                          <p>{plan.maxGuests >= 999999 ? 'Invitados ILIMITADOS' : `Hasta ${plan.maxGuests} invitados`}</p>
                        </div>
                      </div>

                      {/* Lista de características */}
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature: string, featureIndex: number) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: featureIndex * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-3 text-slate-600 dark:text-slate-300"
                          >
                            <motion.svg
                              className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              whileHover={{ scale: 1.2, rotate: 5 }}
                            >
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </motion.svg>
                            <span className="leading-relaxed">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* Botón de selección */}
                      <motion.button
                        onClick={(e) => handleWhatsAppClick(e, plan.name)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-rose-400 to-amber-500 text-white shadow-lg hover:shadow-xl`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          <span>Elegir Plan</span>
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección de Contacto - Diseño Elegante */}
      <section id="contacto" className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        {/* Efecto de partículas en el footer */}
        {Array.from({ length: 8 }).map((_, i) => (
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
