import { useState, useRef, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoEdits {
    audioEnabled: boolean;
    trimStart: number;
    trimEnd: number;
    speed: number;
    filter: 'none' | 'sepia' | 'grayscale' | 'brightness' | 'contrast' | 'vintage' | 'warm' | 'cool';
}

export function useVideoEditor(videoUrl: string, videoFile: File | null) {
    const [edits, setEdits] = useState<VideoEdits>({
        audioEnabled: true,
        trimStart: 0,
        trimEnd: 0,
        speed: 1,
        filter: 'none'
    });

    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

    const ffmpegRef = useRef<FFmpeg | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Initialize FFmpeg
    const loadFFmpeg = useCallback(async () => {
        if (ffmpegLoaded || !ffmpegRef.current) return;

        try {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            const ffmpeg = ffmpegRef.current;

            ffmpeg.on('log', ({ message }) => {
                console.log('[FFmpeg]', message);
            });

            ffmpeg.on('progress', ({ progress: p }) => {
                setProgress(Math.round(p * 100));
            });

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            setFfmpegLoaded(true);
        } catch (error) {
            console.error('Error loading FFmpeg:', error);
        }
    }, [ffmpegLoaded]);

    // Initialize FFmpeg instance
    useEffect(() => {
        ffmpegRef.current = new FFmpeg();
    }, []);

    // Load video metadata
    useEffect(() => {
        if (!videoUrl) return;

        const video = document.createElement('video');
        video.src = videoUrl;
        video.onloadedmetadata = () => {
            setDuration(video.duration);
            setEdits(prev => ({ ...prev, trimEnd: video.duration }));
        };
    }, [videoUrl]);

    const updateEdit = useCallback(<K extends keyof VideoEdits>(key: K, value: VideoEdits[K]) => {
        setEdits(prev => ({ ...prev, [key]: value }));
    }, []);

    const getFilterString = useCallback(() => {
        const filters: string[] = [];

        // Speed filter
        if (edits.speed !== 1) {
            filters.push(`setpts=${1 / edits.speed}*PTS`);
        }

        // Visual filters
        switch (edits.filter) {
            case 'sepia':
                filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
                break;
            case 'grayscale':
                filters.push('hue=s=0');
                break;
            case 'brightness':
                filters.push('eq=brightness=0.2');
                break;
            case 'contrast':
                filters.push('eq=contrast=1.5');
                break;
            case 'vintage':
                filters.push('curves=vintage');
                break;
            case 'warm':
                filters.push('colortemperature=temperature=6500');
                break;
            case 'cool':
                filters.push('colortemperature=temperature=9000');
                break;
        }

        return filters.length > 0 ? filters.join(',') : null;
    }, [edits.speed, edits.filter]);

    const processVideo = useCallback(async (): Promise<Blob | null> => {
        if (!videoFile || !ffmpegRef.current) return null;

        setIsProcessing(true);
        setProgress(0);

        try {
            // Load FFmpeg if not loaded
            if (!ffmpegLoaded) {
                await loadFFmpeg();
            }

            const ffmpeg = ffmpegRef.current;

            // Write input file
            await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

            // Build FFmpeg command
            const args: string[] = ['-i', 'input.mp4'];

            // Trim
            if (edits.trimStart > 0) {
                args.push('-ss', edits.trimStart.toString());
            }
            if (edits.trimEnd < duration) {
                args.push('-t', (edits.trimEnd - edits.trimStart).toString());
            }

            // Audio
            if (!edits.audioEnabled) {
                args.push('-an');
            }

            // Filters
            const filterStr = getFilterString();
            if (filterStr) {
                args.push('-vf', filterStr);
            }

            // Output
            args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23');
            if (edits.audioEnabled) {
                args.push('-c:a', 'aac');
            }
            args.push('output.mp4');

            // Execute
            await ffmpeg.exec(args);

            // Read output
            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data], { type: 'video/mp4' });

            // Cleanup
            await ffmpeg.deleteFile('input.mp4');
            await ffmpeg.deleteFile('output.mp4');

            setIsProcessing(false);
            return blob;
        } catch (error) {
            console.error('Error processing video:', error);
            setIsProcessing(false);
            return null;
        }
    }, [videoFile, edits, duration, ffmpegLoaded, loadFFmpeg, getFilterString]);

    return {
        edits,
        updateEdit,
        duration,
        isProcessing,
        progress,
        processVideo,
        videoRef,
        loadFFmpeg,
        ffmpegLoaded
    };
}
