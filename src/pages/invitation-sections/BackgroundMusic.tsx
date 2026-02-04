import { useEffect, useState, useRef } from 'react';
import { useAudioContext } from '../../contexts/AudioContext';

export function BackgroundMusic({ src, shouldPlay = true }: { src: string; shouldPlay?: boolean }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [needsUnlock, setNeedsUnlock] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const { activeSource } = useAudioContext();

    // Only play if global shouldPlay is true AND no other section has audio focus
    const effectivelyPlaying = shouldPlay && activeSource === null;

    useEffect(() => {
        if (!src) return;

        const audio = new Audio();
        audio.src = src;
        audio.loop = true;
        audio.volume = 0.4;
        audio.preload = 'auto'; // Load entire audio file to prevent buffering
        audioRef.current = audio;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        // Ya no intentamos reproducir automáticamente en el montaje
        // setNeedsUnlock(true); // Mostrar botón de "Activar música" si no se puede auto-reproducir
        // Eliminamos el bloque playPromise inicial para evitar carga innecesaria

        const unlock = () => {
            if (audioRef.current && audioRef.current.paused && effectivelyPlaying) {
                audioRef.current.play().catch(() => { });
                setNeedsUnlock(false);
            }
        };

        const events = ['click', 'keydown', 'pointerdown', 'touchstart'];
        events.forEach(e => document.addEventListener(e, unlock));

        // Si effectivelyPlaying es true pero no hay interacción, mostramos el botón de desbloqueo
        if (effectivelyPlaying) {
            setNeedsUnlock(true);
        }

        return () => {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            events.forEach(e => document.removeEventListener(e, unlock));
        };
    }, [src, effectivelyPlaying]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (effectivelyPlaying) {
            audioRef.current.play().catch(() => setNeedsUnlock(true));
        } else {
            audioRef.current.pause();
        }
    }, [effectivelyPlaying]);

    const toggle = () => {
        if (!audioRef.current) return;
        if (audioRef.current.paused) {
            audioRef.current.play().catch(() => { });
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {needsUnlock && (
                <button
                    onClick={toggle}
                    className="group relative bg-rose-600 hover:bg-rose-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white/50 animate-bounce"
                    title="Activar música"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                    <span className="absolute -top-12 right-0 bg-white text-neutral-800 text-[10px] font-bold px-3 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Haz clic para escuchar música 🎵
                    </span>
                </button>
            )}
            {!needsUnlock && (
                <button
                    onClick={toggle}
                    className={`group relative backdrop-blur-md rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 border border-white/20 ${isPlaying ? 'bg-neutral-900/80 text-white' : 'bg-white/80 text-neutral-800'
                        }`}
                >
                    {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                    {isPlaying && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse border-2 border-white"></div>
                    )}
                </button>
            )}
        </div>
    );
}
