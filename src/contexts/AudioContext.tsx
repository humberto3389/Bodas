import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';

type AudioSource = 'hero' | 'cinema';

interface AudioContextType {
    activeSource: AudioSource | null;
    isInteracted: boolean;
    requestFocus: (source: AudioSource) => void;
    releaseFocus: (source: AudioSource) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
    const [activeSource, setActiveSource] = useState<AudioSource | null>(null);
    const [isInteracted, setIsInteracted] = useState(false);

    // Listener global para detectar la primera interacción del usuario
    // Esto es crucial para cumplir con las políticas de autoplay de los navegadores
    useEffect(() => {
        const handleInteraction = () => {
            setIsInteracted(true);
            // Remover listeners una vez que se detecta la interacción
            const events = ['click', 'keydown', 'touchstart', 'mousedown'];
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };

        const events = ['click', 'keydown', 'touchstart', 'mousedown'];
        events.forEach(event => window.addEventListener(event, handleInteraction));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };
    }, []);

    const requestFocus = useCallback((source: AudioSource) => {
        setActiveSource(source);
    }, []);

    const releaseFocus = useCallback((source: AudioSource) => {
        setActiveSource((current) => {
            if (current === source) {
                return null;
            }
            return current;
        });
    }, []);

    return (
        <AudioContext.Provider value={{ activeSource, isInteracted, requestFocus, releaseFocus }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudioContext() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudioContext must be used within an AudioProvider');
    }
    return context;
}
