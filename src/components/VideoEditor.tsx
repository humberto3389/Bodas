import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoEditor, type VideoEdits } from '../hooks/useVideoEditor';

interface VideoEditorProps {
    videoUrl: string;
    videoFile: File | null;
    onSave: (editedBlob: Blob, edits: VideoEdits) => Promise<void>;
    onCancel: () => void;
}

const FILTER_PRESETS = [
    { id: 'none', name: 'Original', icon: '🎬' },
    { id: 'sepia', name: 'Sepia', icon: '📜' },
    { id: 'grayscale', name: 'B/N', icon: '⚫' },
    { id: 'brightness', name: 'Luz', icon: '☀️' },
    { id: 'contrast', name: 'Contraste', icon: '🌓' },
    { id: 'vintage', name: 'Vintage', icon: '📷' },
    { id: 'warm', name: 'Cálido', icon: '🔥' },
    { id: 'cool', name: 'Frío', icon: '❄️' },
] as const;

const SPEED_PRESETS = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1.0x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2.0x' },
];

export function VideoEditor({ videoUrl, videoFile, onSave, onCancel }: VideoEditorProps) {
    const {
        edits,
        updateEdit,
        duration,
        isProcessing,
        progress,
        processVideo,
        videoRef,
        loadFFmpeg,
        ffmpegLoaded
    } = useVideoEditor(videoUrl, videoFile);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Load FFmpeg on mount
    useEffect(() => {
        loadFFmpeg();
    }, [loadFFmpeg]);

    // Update current time
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        video.addEventListener('timeupdate', updateTime);
        return () => video.removeEventListener('timeupdate', updateTime);
    }, [videoRef]);

    // Apply CSS filters for preview
    const getFilterStyle = (): React.CSSProperties => {
        const filters: string[] = [];
        switch (edits.filter) {
            case 'sepia': filters.push('sepia(100%)'); break;
            case 'grayscale': filters.push('grayscale(100%)'); break;
            case 'brightness': filters.push('brightness(1.2)'); break;
            case 'contrast': filters.push('contrast(1.5)'); break;
            case 'vintage': filters.push('sepia(50%) contrast(1.2) brightness(0.9)'); break;
            case 'warm': filters.push('sepia(30%) saturate(1.2)'); break;
            case 'cool': filters.push('hue-rotate(180deg) saturate(0.8)'); break;
        }
        return filters.length > 0 ? { filter: filters.join(' ') } : {};
    };

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) video.pause();
        else video.play();
        setIsPlaying(!isPlaying);
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || !videoRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * duration;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleSave = async () => {
        const blob = await processVideo();
        if (blob) {
            await onSave(blob, edits);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
                onClick={onCancel}
            >
                {/* Modal Container con Centrado Vertical Perfecto */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
                >
                    {/* Cabecera Limpia */}
                    <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Editor de Video</h2>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                        {/* Área de Visualización (Izquierda) */}
                        <div className="lg:col-span-8 p-8 flex flex-col gap-8 bg-slate-50/30">
                            {/* Video Player */}
                            <div className="relative aspect-video rounded-2xl bg-black shadow-lg overflow-hidden border border-slate-200">
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full h-full object-contain"
                                    style={getFilterStyle()}
                                    muted={!edits.audioEnabled}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />

                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer group"
                                    onClick={togglePlayPause}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-slate-900 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                                    >
                                        {isPlaying ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </motion.button>
                                </div>

                                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-white text-[10px] font-mono tracking-widest">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            {/* Timeline Control */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recorte del Video</span>
                                    <div className="flex gap-4 text-xs font-bold font-mono">
                                        <span className="text-rose-500">I: {formatTime(edits.trimStart)}</span>
                                        <span className="text-amber-500">F: {formatTime(edits.trimEnd)}</span>
                                    </div>
                                </div>

                                <div
                                    ref={timelineRef}
                                    className="relative h-12 bg-slate-50 rounded-xl cursor-pointer overflow-hidden border border-slate-100"
                                    onClick={handleTimelineClick}
                                >
                                    {/* Zona de Trim */}
                                    <div
                                        className="absolute top-0 bottom-0 bg-rose-500/10 border-x border-rose-500/30 transition-all"
                                        style={{
                                            left: `${(edits.trimStart / duration) * 100}%`,
                                            right: `${100 - (edits.trimEnd / duration) * 100}%`
                                        }}
                                    />

                                    {/* Tirador Inicio */}
                                    <motion.div
                                        drag="x"
                                        dragConstraints={timelineRef}
                                        dragElastic={0}
                                        dragMomentum={false}
                                        onDrag={(_, info) => {
                                            if (!timelineRef.current) return;
                                            const rect = timelineRef.current.getBoundingClientRect();
                                            const x = info.point.x - rect.left;
                                            const time = Math.max(0, Math.min(duration, (x / rect.width) * duration));
                                            updateEdit('trimStart', Math.min(time, edits.trimEnd - 0.5));
                                        }}
                                        className="absolute top-0 bottom-0 w-1 bg-rose-500 z-10 cursor-ew-resize flex items-center justify-center"
                                        style={{ left: `${(edits.trimStart / duration) * 100}%` }}
                                    >
                                        <div className="w-3 h-8 bg-rose-500 rounded-full shadow-lg border-2 border-white -translate-x-1/2" />
                                    </motion.div>

                                    {/* Tirador Fin */}
                                    <motion.div
                                        drag="x"
                                        dragConstraints={timelineRef}
                                        dragElastic={0}
                                        dragMomentum={false}
                                        onDrag={(_, info) => {
                                            if (!timelineRef.current) return;
                                            const rect = timelineRef.current.getBoundingClientRect();
                                            const x = info.point.x - rect.left;
                                            const time = Math.max(0, Math.min(duration, (x / rect.width) * duration));
                                            updateEdit('trimEnd', Math.max(time, edits.trimStart + 0.5));
                                        }}
                                        className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10 cursor-ew-resize flex items-center justify-center"
                                        style={{ left: `${(edits.trimEnd / duration) * 100}%` }}
                                    >
                                        <div className="w-3 h-8 bg-amber-500 rounded-full shadow-lg border-2 border-white -translate-x-1/2" />
                                    </motion.div>

                                    {/* Scrubber */}
                                    <div
                                        className="absolute top-0 bottom-0 w-[2px] bg-indigo-500 z-20 pointer-events-none"
                                        style={{ left: `${(currentTime / duration) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Panel de Controles (Derecha) */}
                        <div className="lg:col-span-4 p-8 bg-white border-l border-slate-50 flex flex-col gap-10 overflow-y-auto">

                            {/* Ajustes Rápidos */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                        Efecto Visual
                                    </h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {FILTER_PRESETS.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => updateEdit('filter', f.id as any)}
                                                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border-2 ${edits.filter === f.id ? 'border-amber-500 bg-amber-50' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}
                                            >
                                                <span className="text-xl">{f.icon}</span>
                                                <span className={`text-[8px] font-bold uppercase ${edits.filter === f.id ? 'text-amber-600' : 'text-slate-400'}`}>{f.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        Velocidad
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {SPEED_PRESETS.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => updateEdit('speed', s.value)}
                                                className={`py-2 rounded-lg text-[10px] font-bold transition-all ${edits.speed === s.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${edits.audioEnabled ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-400'}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-800 uppercase">Sonido Original</p>
                                                <p className="text-[9px] text-slate-500">{edits.audioEnabled ? 'Habilitado' : 'Silenciado'}</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={edits.audioEnabled}
                                            onChange={(e) => updateEdit('audioEnabled', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="mt-auto flex flex-col gap-3">
                                {isProcessing ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                                            <span>Procesando Video...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-indigo-500 shadow-lg"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={!ffmpegLoaded}
                                            className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                                        >
                                            Guardar Cambios
                                        </button>
                                        <button
                                            onClick={onCancel}
                                            className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all"
                                        >
                                            Descartar Edición
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
