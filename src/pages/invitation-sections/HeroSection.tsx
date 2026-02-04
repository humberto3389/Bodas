import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useAudioContext } from '../../contexts/AudioContext';
import type { ClientToken } from '../../lib/auth-system';

interface HeroSectionProps {
    clientData: ClientToken;
}

// Helper para parsear fecha evitando problemas de zona horaria
function getLocalDate(dateInput: string | Date | undefined): Date {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) {
        // Si ya es un objeto Date, extraemos año/mes/día directamente
        // Esto evita el desfase de zona horaria que ocurre con .toISOString()
        return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }
    let rawDate = typeof dateInput === 'string' ? (dateInput.includes('T') ? dateInput.split('T')[0] : dateInput) : '';
    if (!rawDate) return new Date();
    const [y, m, d] = rawDate.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function HeroSection({ clientData }: HeroSectionProps) {
    const groom = clientData?.groomName;
    const bride = clientData?.brideName;
    const couple = clientData?.clientName;
    const planType = clientData?.planType || 'basic';
    const heroBg = clientData?.heroBackgroundUrl || '/boda.avif';
    const heroVideo = clientData?.heroBackgroundVideoUrl || '/hero.webm';
    const heroDisplayMode = clientData?.heroDisplayMode || 'image';
    const heroVideoAudioEnabled = clientData?.heroVideoAudioEnabled || false;
    const advancedAnimations = clientData?.advancedAnimations;
    const foilClass = (planType === 'deluxe' && advancedAnimations?.enabled && advancedAnimations?.floatingElements) ? 'deluxe-foil-text' : '';

    const showVideo = planType === 'deluxe' && heroVideo && heroDisplayMode === 'video';
    const dateObj = clientData?.weddingDate ? getLocalDate(clientData.weddingDate) : new Date(2026, 0, 24);

    // Formatting parts for a more modular and elegant design
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
    const dayNum = dateObj.toLocaleDateString('es-ES', { day: 'numeric' });
    const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });
    const yearNum = dateObj.getFullYear();

    // Audio Coordination
    const ref = useRef(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isInView = useInView(ref, { amount: 0.5 }); // 50% visible triggers logic
    const { requestFocus, releaseFocus } = useAudioContext();

    useEffect(() => {
        // Manage Audio Token
        if (showVideo && heroVideoAudioEnabled && isInView) {
            requestFocus('hero');
        } else {
            releaseFocus('hero');
        }

        // Manage Video Playback/Mute
        if (videoRef.current) {
            if (heroVideoAudioEnabled) {
                // If audio is enabled, we only want to hear it when in view.
                // When out of view, we should mute it OR pause it. 
                // User requested: "video se pausa, se reanuda solo cuando vuelve a tener el foco"
                if (isInView) {
                    videoRef.current.muted = false;
                    videoRef.current.play().catch(() => { });
                } else {
                    videoRef.current.pause();
                }
            } else {
                // Determine behavior if audio is NOT enabled. 
                // Usually just plays in background muted.
                videoRef.current.muted = true;
                if (videoRef.current.paused) videoRef.current.play().catch(() => { });
            }
        }
    }, [showVideo, heroVideoAudioEnabled, isInView, requestFocus, releaseFocus]);

    return (
        <section ref={ref} className="relative min-h-[100svh] w-full overflow-visible flex items-center justify-center bg-black py-8 sm:py-0">
            {/* Media Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="h-full w-full"
                >
                    {showVideo ? (
                        <video
                            ref={videoRef}
                            autoPlay loop muted={!heroVideoAudioEnabled} playsInline
                            preload="metadata"
                            poster={heroBg}
                            className="h-full w-full object-cover brightness-[0.7] contrast-[1.1]"
                        >
                            <source src={heroVideo} type="video/webm" />
                            <img
                                src={heroBg}
                                className="h-full w-full object-cover"
                                alt="Boda"
                                loading="eager"
                                fetchPriority="high"
                            />
                        </video>
                    ) : (
                        <div
                            className="h-full w-full bg-cover bg-center brightness-[0.7] transition-transform duration-[20s] hover:scale-110"
                            style={{ backgroundImage: `url(${heroBg})` }}
                        >
                            <img
                                src={heroBg}
                                alt="Boda"
                                className="hidden"
                                loading="eager"
                                fetchPriority="high"
                            />
                        </div>
                    )}
                </motion.div>
                {/* Dynamic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                <div className="absolute inset-0 bg-rose-900/05 mix-blend-overlay" />
            </div>

            {/* Deluxe Animations */}
            {planType === 'deluxe' && advancedAnimations?.enabled && (
                <div className="absolute inset-0 z-[1] pointer-events-none">
                    {advancedAnimations.particleEffects && (
                        <div className="absolute inset-0">
                            {Array.from({ length: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 30 }).map((_, i) => (
                                <motion.div
                                    key={`p-${i}`}
                                    className="absolute w-1 h-1 bg-white/40 rounded-full blur-[1px]"
                                    style={{ left: `${Math.random() * 100}%`, top: '-5%' }}
                                    animate={{
                                        y: ['0vh', '105vh'],
                                        x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 150],
                                        opacity: [0, 0.8, 0],
                                        scale: [0.5, 1.5, 0.5]
                                    }}
                                    transition={{
                                        duration: Math.random() * 10 + 10,
                                        repeat: Infinity,
                                        delay: Math.random() * 10,
                                        ease: "linear"
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-5xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="inline-block mb-6 sm:mb-10"
                    >
                        <span className="px-4 sm:px-6 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] font-light uppercase text-rose-100 shadow-2xl break-words">
                            Nuestra Historia Comienza
                        </span>
                    </motion.div>

                    <h1 className="flex flex-col items-center gap-1 sm:gap-2 mb-8 sm:mb-12">
                        {groom || bride ? (
                            <>
                                <motion.span
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8, duration: 1 }}
                                    className={`font-elegant text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[1.1] sm:leading-tight ${foilClass}`}
                                >
                                    {groom}
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, rotate: -45, scale: 0 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
                                    className="font-brush text-3xl sm:text-5xl md:text-6xl text-gold drop-shadow-lg my-1 sm:my-2 italic"
                                >
                                    &
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.5, duration: 1 }}
                                    className={`font-elegant text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[1.1] sm:leading-tight ${foilClass}`}
                                >
                                    {bride}
                                </motion.span>
                            </>
                        ) : (
                            <span className={`font-elegant text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter drop-shadow-2xl leading-[1.1] sm:leading-tight ${foilClass}`}>{couple}</span>
                        )}
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2, duration: 1.2 }}
                        className="inline-flex flex-col items-center mb-12 sm:mb-16"
                    >
                        {/* Elegant Date Container */}
                        <div className="relative py-6 px-10 sm:px-14 border-y border-white/10 backdrop-blur-sm group">
                            {/* Subtle Glow Background */}
                            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            {/* Decorative Corner Lines */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />

                            <div className="flex flex-col items-center gap-1 sm:gap-2">
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 0.7, y: 0 }}
                                    transition={{ delay: 2.2, duration: 1 }}
                                    className="text-[10px] sm:text-xs tracking-[0.4em] uppercase font-light text-rose-100 mb-1"
                                >
                                    {dayName}
                                </motion.span>

                                <div className="flex items-center gap-4 sm:gap-8">
                                    <div className="h-px w-6 sm:w-10 bg-gold/30 hidden sm:block" />
                                    <span className="font-elegant text-5xl sm:text-7xl md:text-8xl tracking-tight text-white drop-shadow-2xl">
                                        {dayNum}
                                    </span>
                                    <div className="h-px w-6 sm:w-10 bg-gold/30 hidden sm:block" />
                                </div>

                                <motion.span
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 0.9, y: 0 }}
                                    transition={{ delay: 2.4, duration: 1 }}
                                    className="text-sm sm:text-base md:text-lg tracking-[0.2em] sm:tracking-[0.3em] font-light text-white/80 uppercase"
                                >
                                    {monthName} <span className="opacity-40 mx-2">|</span> {yearNum}
                                </motion.span>
                            </div>
                        </div>

                        {/* Wedding Type Badge */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.8, duration: 1 }}
                            className="mt-6 flex items-center gap-3"
                        >
                            <div className="w-8 h-[0.5px] bg-white/20" />
                            <span className="text-[9px] sm:text-xs tracking-[0.2em] font-medium text-rose-200 uppercase">
                                {clientData.weddingType || 'Nuestra Boda'}
                            </span>
                            <div className="w-8 h-[0.5px] bg-white/20" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5, duration: 0.8 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full px-4 sm:px-0"
                    >
                        <motion.a
                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(251, 113, 133, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            href="#rsvp"
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-gradient-to-r from-rose-400 to-amber-500 text-white font-bold text-[10px] sm:text-xs tracking-wide sm:tracking-widest uppercase shadow-xl transition-all border border-rose-400/20"
                        >
                            Confirmar Asistencia
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                            whileTap={{ scale: 0.95 }}
                            href="#galeria"
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-[10px] sm:text-xs tracking-wide sm:tracking-widest uppercase hover:shadow-lg transition-all"
                        >
                            Nuestra Galería
                        </motion.a>
                    </motion.div>
                </motion.div>
            </div>


        </section>
    );
}
