import { useEffect } from 'react';
import { motion } from 'framer-motion';

export function MobileAppChrome() {
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
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* FLOATING BOTTOM NAV (Native App Feel) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm sm:hidden">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] rounded-full px-6 py-3 flex items-center justify-between"
                >
                    <NavIcon label="Inicio" icon="🏠" onClick={() => scrollToSection('hero')} />
                    <NavIcon label="Mapa" icon="📍" onClick={() => scrollToSection('snap-location')} />
                    <NavIcon label="RSVP" icon="💌" onClick={() => scrollToSection('snap-rsvp')} isPrimary />
                    <NavIcon label="Fotos" icon="📸" onClick={() => scrollToSection('snap-gallery')} />
                </motion.div>
            </div>
        </>
    );
}

function NavIcon({ label, icon, onClick, isPrimary = false }: { label: string, icon: string, onClick: () => void, isPrimary?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${isPrimary ? 'scale-110 -translate-y-2' : 'opacity-60'}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isPrimary ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : ''}`}>
                {icon}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">{label}</span>
        </button>
    );
}
