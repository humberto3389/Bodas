import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function MobileAppChrome() {
  const [activeSection, setActiveSection] = useState('hero');

  // Update Theme Color meta tag for native browser integration
  useEffect(() => {
    const themeColor = '#fdf8f4'; // Matching silk-bg
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', themeColor);

    // Add apple-mobile-web-app-capable for standalone feel
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMeta) {
      appleMeta = document.createElement('meta');
      appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
      appleMeta.setAttribute('content', 'yes');
      document.head.appendChild(appleMeta);
    }

    // Status bar style for immersive backgrounds - Translucent allows content behind
    let statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!statusMeta) {
      statusMeta = document.createElement('meta');
      statusMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      statusMeta.setAttribute('content', 'black-translucent');
      document.head.appendChild(statusMeta);
    } else {
      statusMeta.setAttribute('content', 'black-translucent');
    }
  }, []);

  // Track active section for menu focus
  useEffect(() => {
    const sections = ['hero', 'location', 'rsvp', 'gallery'];

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // More sensitive to top/center entrance
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* FLOATING BOTTOM NAV (Native App Feel) */}
      <div className="fixed bottom-8 left-0 right-0 z-[60] flex justify-center px-4 md:hidden pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 dark:border-slate-700/40 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] rounded-[32px] px-7 py-4 flex items-center justify-between pointer-events-auto w-full max-w-[340px]"
        >
          <NavIcon label="Inicio" icon="🏠" onClick={() => scrollToSection('hero')} isActive={activeSection === 'hero'} />
          <NavIcon label="Mapa" icon="📍" onClick={() => scrollToSection('location')} isActive={activeSection === 'location'} />
          <NavIcon label="RSVP" icon="💌" onClick={() => scrollToSection('rsvp')} isActive={activeSection === 'rsvp'} />
          <NavIcon label="Fotos" icon="📸" onClick={() => scrollToSection('gallery')} isActive={activeSection === 'gallery'} />
        </motion.div>
      </div>
    </>
  );
}

function NavIcon({ label, icon, onClick, isPrimary = false, isActive = false }: { label: string, icon: string, onClick: () => void, isPrimary?: boolean, isActive?: boolean }) {
  // Use the RSVP background style if either isPrimary OR isActive is true
  const highlight = isPrimary || isActive;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${highlight ? 'scale-110 -translate-y-2' : 'opacity-40'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${highlight ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : ''}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-300 ${highlight ? 'text-rose-600' : 'text-slate-900'}`}>{label}</span>
    </button>
  );
}
