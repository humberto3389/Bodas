import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useAudioContext } from '../../contexts/AudioContext';
import type { ClientToken } from '../../lib/auth-system';
import { getOptimizedImageUrl } from '../../lib/image-optimization';

import { safeNewDate } from '../../lib/timezone-utils';

interface HeroSectionProps {
    clientData: ClientToken;
    videos?: { name: string; url: string }[];
}

// Helper para parsear fecha evitando problemas de zona horaria y NaN en móviles
function getLocalDate(dateInput: string | Date | undefined): Date {
    const d = safeNewDate(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function HeroSection({ clientData, videos }: HeroSectionProps) {
    console.log(clientData); // Debugging clientData
    const groom = clientData?.groomName;
    const bride = clientData?.brideName;
    const couple = clientData?.clientName;
    const planType = clientData?.planType || 'basic';
    const heroBg = clientData?.heroBackgroundUrl || '/boda.avif';
    
    // SMART FALLBACK: Si no hay video específico del hero, usar el primero de la lista de videos subidos
    const heroVideo = clientData?.heroBackgroundVideoUrl || (videos && videos.length > 0 ? videos[0].url : undefined);
    
    const heroDisplayMode = clientData?.heroDisplayMode || 'image';
    const heroVideoAudioEnabled = clientData?.heroVideoAudioEnabled || false;
    const advancedAnimations = clientData?.advancedAnimations;
    const foilClass = (planType === 'deluxe' && advancedAnimations?.enabled && advancedAnimations?.floatingElements) ? 'deluxe-foil-text' : '';

    // Safety Fallback: If user provides a video, respect the mode. 
    // If no mode is set but video exists, we could default to video, 
    // but the user says it "doesn't change", implying they ARE changing the mode but it's not reflecting.
    // LOG CRÍTICO para depurar video
    useEffect(() => {
        console.log('Hero Background Video State:', {
            videoUrl: !!heroVideo,
            displayMode: heroDisplayMode,
            plan: planType,
            willShow: !!heroVideo && heroDisplayMode === 'video'
        });
    }, [heroVideo, heroDisplayMode, planType]);

    const showVideo = !!heroVideo && heroDisplayMode === 'video';
    const dateObj = clientData?.weddingDate ? getLocalDate(clientData.weddingDate) : new Date(2026, 1, 21);

    // Formatting parts for a more modular and elegant design
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
    const dayNum = dateObj.toLocaleDateString('es-ES', { day: 'numeric' });
    const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });
    const yearNum = dateObj.getFullYear();

    // Safety check for NaN to prevent UI issues
    const isDateValid = !isNaN(dateObj.getTime());
    const displayYear = isDateValid ? yearNum : '';

    // Audio Coordination
    const ref = useRef(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isInView = useInView(ref, { amount: 0.5 }); // 50% visible triggers logic
    const { requestFocus, releaseFocus, isInteracted } = useAudioContext();

    // Cinematic Parallax Implementation
    const { scrollY } = useScroll();
    const bgY = useTransform(scrollY, [0, 500], [0, 150]);
    // Safety check for window to avoid SSR issues if necessary, 
    // though Framer Motion hooks are safe in Next.js/Vite typically.
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    // EFECTO CRÍTICO: Desbloqueo inmediato de audio mediante gesto real
    // Los navegadores bloquean .play() si ocurre en un microtask o efecto de React (fuera del tick original)
    useEffect(() => {
        if (!showVideo || !heroVideoAudioEnabled) return;

        const unlockVideo = async () => {
            const video = videoRef.current;
            if (!video) return;

            // Solo desbloquear si está en vista
            if (isInView) {
                try {
                    video.muted = false;
                    await video.play();
                    requestFocus('hero');
                } catch (err) {
                    console.warn("Direct video unlock failed:", err);
                }
            }
            
            // Una vez intentado (éxito o fallo), removemos los listeners de este componente
            const events = ['click', 'touchstart', 'mousedown'];
            events.forEach(e => window.removeEventListener(e, unlockVideo));
        };

        if (!isInteracted) {
            const events = ['click', 'touchstart', 'mousedown'];
            events.forEach(e => window.addEventListener(e, unlockVideo));
            return () => events.forEach(e => window.removeEventListener(e, unlockVideo));
        }
    }, [showVideo, heroVideoAudioEnabled, isInView, isInteracted, requestFocus]);

    useEffect(() => {
        const video = videoRef.current;
        if (!showVideo || !video) return;

        const handlePlayback = async () => {
            try {
                // Si el audio está habilitado y ya hubo interacción
                if (heroVideoAudioEnabled && isInView) {
                    if (isInteracted) {
                        video.muted = false;
                        await video.play();
                        requestFocus('hero');
                    } else {
                        // Si no hay interacción aún, reproducir silenciado por defecto
                        video.muted = true;
                        await video.play();
                        releaseFocus('hero');
                    }
                } else if (isInView) {
                    // Solo video sin audio
                    video.muted = true;
                    await video.play();
                    releaseFocus('hero');
                } else {
                    video.pause();
                    releaseFocus('hero');
                }
            } catch (error) {
                console.warn("Hero video background playback stalled:", error);
                video.muted = true;
                video.play().catch(() => {});
            }
        };

        handlePlayback();
    }, [showVideo, heroVideoAudioEnabled, isInView, requestFocus, releaseFocus, isInteracted]);

    return (
        <section
            id="hero"
            ref={ref}
            className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-black"
        >
            {/* Media Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="h-full w-full"
                    style={{
                        // Parallax sutil solo en desktop
                        y: isDesktop ? bgY : 0
                    }}
                >
                    {showVideo ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted={true}
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover transform scale-105"
                        >
                            <source src={heroVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <div
                            className="h-full w-full bg-cover bg-center brightness-[0.7] transition-transform duration-[20s] hover:scale-110"
                            style={{ 
                                backgroundImage: `url(${getOptimizedImageUrl(heroBg, { width: isDesktop ? 1920 : 800, quality: 80 })})` 
                            }}
                        >
                            <img
                                src={getOptimizedImageUrl(heroBg, { width: 1200, quality: 80 })}
                                srcSet={`${getOptimizedImageUrl(heroBg, { width: 600, quality: 70 })} 600w, ${getOptimizedImageUrl(heroBg, { width: 1200, quality: 80 })} 1200w`}
                                sizes="100vw"
                                alt="Boda"
                                className="hidden"
                                fetchPriority="high"
                            />
                        </div>
                    )}
                </motion.div>
                {/* Dynamic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-theme-primary/70 via-theme-primary/40 to-theme-primary/95" />
                <div className="absolute inset-0 mix-blend-overlay bg-theme-accent/10" />
            </div>

            {/* Deluxe Animations */}
            {
                planType === 'deluxe' && advancedAnimations?.enabled && (
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
                )
            }

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
                        <span className="px-4 sm:px-6 py-3 rounded-full bg-theme-surface/10 backdrop-blur-xl border border-theme-accent/40 text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] font-light uppercase text-theme-accent shadow-2xl break-words">
                            Nuestra Historia Comienza
                        </span>
                    </motion.div>

                    <div className="flex flex-col items-center gap-1 sm:gap-2 mb-8 sm:mb-12">
                        {groom || bride ? (
                            <>
                                <motion.h1
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1, duration: 1.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <motion.span
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8, duration: 1 }}
                                        className={`font-elegant tracking-tighter text-hero-premium leading-[1.1] sm:leading-tight ${foilClass}`}
                                        style={{ fontSize: 'var(--font-size-4xl)' }}
                                    >
                                        {groom}
                                    </motion.span>
                                    <motion.span
                                        initial={{ opacity: 0, rotate: -45, scale: 0 }}
                                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                        transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
                                        className="font-brush text-4xl sm:text-6xl md:text-7xl text-theme-accent drop-shadow-lg my-1 sm:my-2 italic"
                                    >
                                        &
                                    </motion.span>
                                    <motion.span
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.5, duration: 1 }}
                                        className={`font-elegant tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[1.1] sm:leading-tight ${foilClass}`}
                                        style={{ fontSize: 'var(--font-size-4xl)' }}
                                    >
                                        {bride}
                                    </motion.span>
                                </motion.h1>
                            </>
                        ) : (
                            <h1 className={`font-elegant text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter text-hero-premium leading-[1.1] sm:leading-tight ${foilClass}`}>{couple}</h1>
                        )}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2, duration: 1.2 }}
                        className="relative inline-flex flex-col items-center mb-10 sm:mb-14 px-8 sm:px-12 py-6 sm:py-8"
                    >
                        {/* Warm Spotlight Background - Subtle amber/gold glow */}
                        <div className="absolute inset-0 bg-gradient-radial from-theme-accent/[0.15] via-theme-accent/[0.05] to-transparent blur-[80px] rounded-full pointer-events-none scale-150" />
                        <div className="absolute inset-0 bg-gradient-radial from-theme-surface/[0.1] to-transparent blur-[60px] rounded-full pointer-events-none scale-125" />

                        <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
                            {/* Day Name */}
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.9, y: 0 }}
                                transition={{ delay: 2.2, duration: 1 }}
                                className="text-[10px] sm:text-xs tracking-[0.5em] uppercase font-light text-theme-accent mb-1 italic"
                            >
                                {dayName}
                            </motion.span>

                            {/* Day Number with Gold Diagonal Shimmer */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 2.4, duration: 1 }}
                                className="relative"
                            >
                                <span
                                    className="font-elegant text-size-hero tracking-tighter text-theme-bg drop-shadow-2xl relative inline-block leading-none"
                                    style={{
                                        fontSize: 'var(--font-size-4xl)', // Fallback for custom size
                                        background: 'linear-gradient(135deg, var(--theme-bg) 0%, var(--theme-bg) 30%, var(--theme-accent) 50%, var(--theme-bg) 70%, var(--theme-bg) 100%)',
                                        backgroundSize: '200% 200%',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        animation: 'shimmer-gold-diagonal 5s ease-in-out infinite'
                                    }}
                                >
                                    {dayNum}
                                </span>
                            </motion.div>

                            {/* Month and Year */}
                            <motion.span
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 0.9, y: 0 }}
                                transition={{ delay: 2.6, duration: 1 }}
                                className="text-lg sm:text-xl md:text-2xl tracking-[0.3em] font-light text-theme-surface uppercase mt-2"
                            >
                                {monthName} <span className="opacity-30 mx-3 text-theme-accent">|</span> {displayYear}
                            </motion.span>
                        </div>

                        {/* Wedding Type Badge */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.8, duration: 1 }}
                            className="mt-6 flex items-center gap-4 opacity-60"
                        >
                            <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-theme-accent/60" />
                            <span className="text-[9px] sm:text-xs tracking-[0.4em] font-light text-theme-accent uppercase">
                                {clientData.weddingType || 'Boda'}
                            </span>
                            <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-theme-accent/60" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5, duration: 0.8 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full px-4 sm:px-0"
                    >
                        <motion.a
                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(191,161,123,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            href="#rsvp"
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-theme-accent/95 backdrop-blur-md border border-theme-accent text-theme-primary font-bold text-[10px] sm:text-xs tracking-wide sm:tracking-widest uppercase shadow-2xl transition-all hover:bg-theme-accent"
                        >
                            Confirmar Asistencia
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(250,249,246,0.15)" }}
                            whileTap={{ scale: 0.95 }}
                            href="#galeria"
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-theme-surface/10 backdrop-blur-xl border border-theme-accent/40 text-theme-bg font-bold text-[10px] sm:text-xs tracking-wide sm:tracking-widest uppercase hover:shadow-lg transition-all"
                        >
                            Nuestra Galería
                        </motion.a>
                    </motion.div>
                </motion.div>
            </div>


        </section >
    );
}
