import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

type AudioSource = 'hero' | 'cinema';

interface AudioContextType {
    activeSource: AudioSource | null;
    requestFocus: (source: AudioSource) => void;
    releaseFocus: (source: AudioSource) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
    const [activeSource, setActiveSource] = useState<AudioSource | null>(null);

    const requestFocus = useCallback((source: AudioSource) => {
        setActiveSource(source);
        console.log('[AudioContext] Focus requested by:', source);
    }, []);

    const releaseFocus = useCallback((source: AudioSource) => {
        setActiveSource((current) => {
            if (current === source) {
                console.log('[AudioContext] Focus released by:', source);
                return null;
            }
            return current;
        });
    }, []);

    return (
        <AudioContext.Provider value={{ activeSource, requestFocus, releaseFocus }}>
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
