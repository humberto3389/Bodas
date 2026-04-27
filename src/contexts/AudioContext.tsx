import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';

type AudioSource = 'hero' | 'cinema';

interface AudioContextType {
    activeSource: AudioSource | null;
    isInteracted: boolean;
    setInteracted: (value: boolean) => void;
    requestFocus: (source: AudioSource) => void;
    releaseFocus: (source: AudioSource) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
    const [activeSource, setActiveSource] = useState<AudioSource | null>(null);
    const [isInteracted, setIsInteracted] = useState(false);

    const setInteracted = useCallback((value: boolean) => {
        setIsInteracted(value);
    }, []);

    // Listener global para detectar la primera interacción del usuario
    useEffect(() => {
        if (isInteracted) return;

        const handleInteraction = () => {
            setIsInteracted(true);
            const events = ['click', 'keydown', 'touchstart', 'mousedown'];
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };

        const events = ['click', 'keydown', 'touchstart', 'mousedown'];
        events.forEach(event => window.addEventListener(event, handleInteraction));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };
    }, [isInteracted]);

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
        <AudioContext.Provider value={{ activeSource, isInteracted, setInteracted, requestFocus, releaseFocus }}>
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
