import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useAudioContext } from '../../contexts/AudioContext';

export function VideoSection({ clientData, videos: propVideos }: { clientData: any; videos?: { name: string; url: string }[] }) {
    const [videos, setVideos] = useState<{ name: string; url: string }[]>([]);

    // Componente interno para manejar referencia de video individualmente
    const VideoPlayer = ({ url, poster, audioEnabled, isInView }: { url: string, poster: string, audioEnabled: boolean, isInView: boolean }) => {
        const videoRef = useRef<HTMLVideoElement>(null);

        useEffect(() => {
            if (!videoRef.current) return;

            if (audioEnabled) {
                // Si el audio está habilitado, comportamiento de foco estricto
                if (isInView) {
                    videoRef.current.muted = false; // Desmutear
                    videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
                } else {
                    videoRef.current.pause();
                }
            } else {
                // Si el audio está deshabilitado, reproducir muteado
                videoRef.current.muted = true;
                if (isInView && videoRef.current.paused) {
                    videoRef.current.play().catch(() => { });
                } else if (!isInView) {
                    // Opcional: pausar si no está en vista para ahorrar recursos
                    videoRef.current.pause();
                }
            }
        }, [audioEnabled, isInView, url]);

        return (
            <video
                ref={videoRef}
                src={url}
                controls
                muted={!audioEnabled} // Default inicial
                className="w-full h-full object-cover"
                poster={poster}
                playsInline
                preload="metadata"
            />
        );
    };

    // ✅ USAR DATOS DEL BFF si están disponibles
    useEffect(() => {
        if (propVideos && propVideos.length > 0) {
            setVideos(propVideos);
            return;
        }
        // Si no hay datos del BFF, mantener comportamiento original (fallback)
        if (!clientData?.id) return;
        // Este código solo se ejecuta si el BFF no proporciona datos (no debería pasar en producción)
    }, [propVideos, clientData?.id]);

    const [currentIndex, setCurrentIndex] = useState(0);

    /* Auto-play slider logic removed for video section to avoid interruption, kept manual only or very slow */

    // Audio Focus Logic
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.5 });
    const { requestFocus, releaseFocus } = useAudioContext();
    const audioEnabled = clientData.cinemaVideoAudioEnabled || false;

    useEffect(() => {
        // DEBUG LOGS
        console.log('[VideoSection] State:', {
            videos: videos.length,
            audioEnabled,
            isInView,
            dbValue: clientData.cinemaVideoAudioEnabled
        });

        if (videos.length > 0 && audioEnabled && isInView) {
            console.log('[VideoSection] Requesting Focus: cinema');
            requestFocus('cinema');
        } else {
            // console.log('[VideoSection] Releasing Focus: cinema');
            // Sólo soltamos si nosotros lo teníamos o si no estamos en vista, 
            // pero releaseFocus suele ser seguro de llamar.
            releaseFocus('cinema');
        }
    }, [videos.length, audioEnabled, isInView, requestFocus, releaseFocus]);

    if (videos.length === 0 || clientData.planType !== 'deluxe') return null;

    return (
        <section ref={ref} id="videos" className="py-20 relative overflow-hidden bg-transparent">
            <div className="section-container">
                <div className="text-center mb-16 relative">
                    <motion.div
                        className="inline-flex flex-col items-center gap-3 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-hati-accent">
                            Cinema
                        </span>
                        <div className="w-10 h-px bg-gray-100" />
                    </motion.div>
                    <h2 className="text-gray-900 text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                        Nuestra Historia
                    </h2>
                </div>

                <div className="relative mt-12 h-[400px] sm:h-[600px] perspective-2000">
                    <AnimatePresence initial={false} mode="popLayout">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {videos.map((video, idx) => {
                                const offset = (idx - currentIndex + videos.length) % videos.length;
                                const isCenter = offset === 0;
                                const isLeft = offset === videos.length - 1;
                                const isRight = offset === 1;

                                // Only render center, left, and right items for performance
                                if (!isCenter && !isLeft && !isRight) return null;

                                return (
                                    <motion.div
                                        key={video.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{
                                            opacity: isCenter ? 1 : 0.5,
                                            scale: isCenter ? 1 : 0.85,
                                            x: isCenter ? 0 : offset === 1 ? '60%' : '-60%', // Reduced offset for videos as they are wider
                                            z: isCenter ? 100 : 0,
                                            rotateY: isCenter ? 0 : offset === 1 ? -15 : 15,
                                            filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                                            zIndex: isCenter ? 30 : 10
                                        }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        onClick={() => !isCenter && setCurrentIndex(idx)}
                                        className={`absolute w-full max-w-5xl aspect-video ${!isCenter ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-sm relative border border-gray-100">
                                            {isCenter ? (
                                                <VideoPlayer
                                                    url={video.url}
                                                    poster={clientData.heroBackgroundUrl}
                                                    audioEnabled={audioEnabled}
                                                    isInView={isInView}
                                                />
                                            ) : (
                                                /* Side items show poster/placeholder */
                                                <div className="w-full h-full relative">
                                                    <img
                                                        src={clientData.heroBackgroundUrl}
                                                        className="w-full h-full object-cover opacity-60"
                                                        alt="Video thumbnail"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>

                    {/* Navegación Minimalista - Dots */}
                    {videos.length > 1 && (
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-8">
                            <button
                                onClick={() => setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)}
                                className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" /></svg>
                            </button>

                            <div className="flex gap-3">
                                {videos.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`transition-all duration-500 h-1.5 rounded-full ${currentIndex === idx ? 'w-8 bg-hati-accent' : 'w-1.5 bg-gray-200'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentIndex((prev) => (prev + 1) % videos.length)}
                                className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export function InvitationFooter({ clientData }: { clientData: any }) {
    return (
        <footer className="py-20 bg-white relative overflow-hidden border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">

                {/* Logo Minimalista */}
                <motion.div
                    className="flex flex-col items-center gap-4 mb-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>
                    <span className="font-sans font-bold text-xl text-gray-900 tracking-tight uppercase">
                        Suspiro<span className="text-hati-accent">Nupcial</span>
                    </span>
                </motion.div>

                <div className="text-center mb-16 max-w-2xl">
                    <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold uppercase tracking-tighter leading-none mb-6">
                        {clientData.groomName} <span className="text-hati-accent text-xl align-middle mx-1">&</span> {clientData.brideName}
                    </h2>
                    <p className="text-gray-400 text-base font-normal tracking-wide leading-relaxed italic">
                        "Gracias por ser parte de nuestra historia."
                    </p>
                </div>

                <div className="w-full border-t border-gray-50 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300">
                    <span>© 2026 Reservado</span>

                    <div className="flex items-center gap-2">
                        <span>Desarrollado por</span>
                        <a href="#" className="text-gray-900 hover:text-hati-accent transition-colors">Horizon Studio</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
