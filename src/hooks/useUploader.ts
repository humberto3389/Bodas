import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { compressImageForWeb } from '../utils/compressImage';

export type MediaFile = { name: string; path: string; created: string; isSystem?: boolean };
export type UploadProgress = { isUploading: boolean; progress: number; fileName: string };

export function useUploader(clientId: string | null, clientToken?: string) {
    const [imageFiles, setImageFiles] = useState<MediaFile[]>([]);
    const [audioFiles, setAudioFiles] = useState<MediaFile[]>([]);
    const [videoFiles, setVideoFiles] = useState<MediaFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ isUploading: false, progress: 0, fileName: '' });

    const getPublicUrl = useCallback((bucket: 'gallery' | 'audio' | 'videos', path: string) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl || '';
    }, []);

    const listFiles = useCallback(async (bucket: 'gallery' | 'audio' | 'videos') => {
        if (!clientId) return [];

        try {
            let folder = '';
            if (bucket === 'gallery') folder = 'hero';
            else if (bucket === 'audio') folder = 'audio';
            else if (bucket === 'videos') folder = 'video';

            const listPath = `${clientId}/${folder}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .list(listPath, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

            if (error) return [];

            const mappedFiles = (data || [])
                .filter(file => !file.name.startsWith('.') && file.id)
                .map(file => ({
                    name: file.name,
                    path: `${clientId}/${folder}/${file.name}`,
                    created: file.created_at || new Date().toISOString()
                }));

            if (bucket === 'gallery') setImageFiles(mappedFiles);
            else if (bucket === 'audio') setAudioFiles(mappedFiles);
            else if (bucket === 'videos') setVideoFiles(mappedFiles);

            return mappedFiles;
        } catch (err) {
            console.error(`Error listing ${bucket}:`, err);
            return [];
        }
    }, [clientId]);

    const deleteFile = useCallback(async (bucket: 'gallery' | 'audio' | 'videos', fileName: string) => {
        if (!clientId) return false;

        let path = fileName;
        if (bucket === 'gallery' && !fileName.includes('/')) path = `${clientId}/hero/${fileName}`;
        if (bucket === 'videos' && !fileName.includes('/')) path = `${clientId}/video/${fileName}`;

        try {
            const { error } = await supabase.storage.from(bucket).remove([path]);
            if (error) throw error;

            await listFiles(bucket);
            return true;
        } catch (err) {
            console.error('Error deleting file:', err);
            return false;
        }
    }, [clientId, listFiles]);

    const uploadFile = useCallback(async (
        bucket: 'gallery' | 'audio' | 'videos',
        file: File,
        customFolder?: string
    ) => {
        if (!clientId) return null;

        const fileName = file.name;
        // Si se provee customFolder, usarlo. Si no, usar lógica por defecto ('hero' para gallery).
        const folder = customFolder || (bucket === 'gallery' ? 'hero' : (bucket === 'audio' ? 'audio' : 'video'));
        const path = `${clientId}/${folder}/${fileName}`;

        setUploadProgress({ isUploading: true, progress: 0, fileName });

        let fileToUpload = file;

        // Compresión de imágenes usando la utilidad centralizada
        if (file.type.startsWith('image/')) {
            try {
                fileToUpload = await compressImageForWeb(file);
            } catch (e) {
                console.warn('Compression failed, uploading original:', e);
            }
        }

        try {
            // 1. Try standard upload
            setUploadProgress(p => ({ ...p, progress: 30 }));
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, fileToUpload, { upsert: true, contentType: fileToUpload.type });

            if (uploadError) {
                // 2. Fallback to Edge Function if standard upload fails (e.g. size or CORS in some environments)
                setUploadProgress(p => ({ ...p, progress: 50 }));

                const buf = await file.arrayBuffer();
                let b64 = '';
                const bytes = new Uint8Array(buf);
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    b64 += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as any);
                }
                b64 = btoa(b64);

                setUploadProgress(p => ({ ...p, progress: 60 }));
                const { data: fnData, error: fnError } = await supabase.functions.invoke('upload_media', {
                    body: { bucket, path, clientId, token: clientToken, file: b64, contentType: fileToUpload.type }
                });

                if (fnError) throw fnError;

                const publicUrl = (fnData as any)?.publicUrl;
                if (!publicUrl) throw new Error('No public URL returned from upload function');

                setUploadProgress(p => ({ ...p, progress: 90 }));
                await listFiles(bucket);
                setUploadProgress({ isUploading: false, progress: 100, fileName: '' });
                return publicUrl;
            }

            // Standard success
            setUploadProgress(p => ({ ...p, progress: 90 }));
            const publicUrl = getPublicUrl(bucket, path);
            await listFiles(bucket);
            setUploadProgress({ isUploading: false, progress: 100, fileName: '' });
            return publicUrl;

        } catch (err) {
            console.error('Error uploading file:', err);
            setUploadProgress({ isUploading: false, progress: 0, fileName: '' });
            return null;
        }
    }, [clientId, clientToken, listFiles, getPublicUrl]);

    return {
        imageFiles,
        audioFiles,
        videoFiles,
        uploadProgress,
        listFiles,
        deleteFile,
        uploadFile,
        getPublicUrl
    };
}
