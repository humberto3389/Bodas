import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

        // Compresión básica de imágenes antes de subir
        if (bucket === 'gallery' && file.type.startsWith('image/')) {
            try {
                fileToUpload = await compressImage(file);
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
async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max resolution 1600px
                const MAX_WIDTH = 1600;
                const MAX_HEIGHT = 1600;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                }, 'image/jpeg', 0.8); // 80% quality
            };
            img.onerror = (e) => reject(e);
        };
        reader.onerror = (e) => reject(e);
    });
}
