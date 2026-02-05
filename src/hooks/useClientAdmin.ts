import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authenticateClientWithToken, type ClientToken, requestUpgrade, checkAndRevertExpiredUpgrades, mapSupabaseClientToToken } from '../lib/auth-system';
import { getCurrentClientData } from '../lib/client-data';
import { getEffectivePlan } from '../lib/plan-limits';
import { localToUTC, validateAndFormatTime } from '../lib/timezone-utils';

export function useClientAdmin() {
    const navigate = useNavigate();
    const [authed, setAuthed] = useState(() => {
        const hasAuth = !!sessionStorage.getItem('clientAuth');
        console.log('[useClientAdmin] Estado inicial authed:', hasAuth);
        return hasAuth;
    });
    const [clientSession, setClientSession] = useState<ClientToken | null>(() => {
        try {
            const s = sessionStorage.getItem('clientAuth');
            console.log('[useClientAdmin] Sesión cargada:', s ? 'Sí' : 'No');
            return s ? JSON.parse(s) : null;
        } catch (err) {
            console.error('[useClientAdmin] Error parseando sesión:', err);
            return null;
        }
    });

    // Ref para rastrear si acabamos de guardar (previene race condition)
    const lastSaveTimeRef = useRef<number>(0);
    const hasLoadedOnceRef = useRef<boolean>(false);

    const detectedClient = getCurrentClientData();
    const clientLike = authed ? (clientSession || detectedClient) : null;
    const clientId = clientLike ? clientLike.id : null;

    const [editForm, setEditForm] = useState({
        clientName: '',
        groomName: '',
        brideName: '',
        weddingDate: '',
        weddingTime: '',
        receptionTime: '',
        weddingLocation: '',
        weddingType: '',
        religiousSymbol: '',
        bibleVerse: '',
        bibleVerseBook: '',
        invitationText: '',
        backgroundAudioUrl: '',
        heroBackgroundUrl: '',
        heroBackgroundVideoUrl: '',
        heroDisplayMode: 'image' as 'image' | 'video',
        heroVideoAudioEnabled: false,
        cinemaVideoAudioEnabled: false,
        advancedAnimations: {
            enabled: false,
            particleEffects: false,
            parallaxScrolling: false,
            floatingElements: false
        },
        mapCoordinates: { lat: -12.0932, lng: -77.0314 },
        churchName: '',
        ceremonyLocationName: '',
        receptionLocationName: '',
        ceremonyAddress: '',
        ceremonyReference: '',
        ceremonyMapUrl: '',
        receptionAddress: '',
        receptionReference: '',
        receptionMapUrl: '',
        isReceptionSameAsCeremony: false,
        decorationImageUrl: ''
    });

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Redirect if not authed
    useEffect(() => {
        // Double check storage to prevent race conditions
        const storedAuth = sessionStorage.getItem('clientAuth');
        if (!authed && storedAuth) {
            console.log('[useClientAdmin] Recuperando sesión perdida de storage...');
            try {
                const parsed = JSON.parse(storedAuth);
                setClientSession(parsed);
                setAuthed(true);
                return; // Stop redirect
            } catch (e) {
                console.error('[useClientAdmin] Error recuperando sesión:', e);
            }
        }

        if (!authed && !storedAuth) {
            console.warn('[useClientAdmin] No authed, redirigiendo a /login...');
            navigate('/login', { replace: true });
        } else {
            console.log('[useClientAdmin] Usuario autenticado, permaneciendo en Admin.');
        }
    }, [authed, navigate]);

    // Maintain Supabase session
    useEffect(() => {
        if (!authed || !clientSession?.token) return;

        const maintainAuth = async () => {
            await authenticateClientWithToken(clientSession.token);
        };

        maintainAuth();
        const interval = setInterval(maintainAuth, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [authed, clientSession?.token]);

    // Load client data from Supabase
    useEffect(() => {
        if (!authed || !clientId || !clientSession) return;

        // Force load every time hook mounts/updates to ensure fresh data
        let ignore = false;

        const loadClientData = async () => {
            try {
                // Verificar y revertir upgrades expirados antes de cargar datos
                await checkAndRevertExpiredUpgrades(clientId);

                const { data: clientData, error: fetchError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', clientId)
                    .maybeSingle();

                if (ignore || fetchError || !clientData) {
                    if (fetchError) console.error('Error fetching client data:', fetchError);
                    return;
                }

                // CRÍTICO: Verificar que los datos pertenezcan al mismo usuario antes de actualizar
                if (clientData.id !== clientId) {
                    console.warn('[loadClientData] Datos de otro usuario detectados, ignorando actualización', {
                        esperado: clientId,
                        recibido: clientData.id
                    });
                    return;
                }

                // Usar el mapeo centralizado para garantizar coherencia
                const mappedClient = mapSupabaseClientToToken(clientData);

                // Prevent infinite loops by checking if data actually changed
                if (JSON.stringify(mappedClient) !== JSON.stringify(clientSession)) {
                    console.log('[loadClientData] Datos actualizados, guardando nuevos datos...');
                    sessionStorage.setItem('clientAuth', JSON.stringify(mappedClient));
                    window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(mappedClient) } }));
                    setClientSession(mappedClient);

                    // ACTUALIZAR editForm con los datos cargados de Supabase
                    setEditForm({
                        clientName: mappedClient.clientName || '',
                        groomName: mappedClient.groomName || '',
                        brideName: mappedClient.brideName || '',
                        weddingDate: mappedClient.weddingDate ? mappedClient.weddingDate.toISOString().split('T')[0] : '',
                        weddingTime: mappedClient.weddingTime || '',
                        receptionTime: mappedClient.receptionTime || '',
                        weddingLocation: mappedClient.weddingLocation || '',
                        weddingType: mappedClient.weddingType || 'Boda',
                        religiousSymbol: mappedClient.religiousSymbol || '',
                        bibleVerse: mappedClient.bibleVerse || '',
                        bibleVerseBook: mappedClient.bibleVerseBook || '',
                        invitationText: mappedClient.invitationText || '',
                        backgroundAudioUrl: mappedClient.backgroundAudioUrl || '',
                        heroBackgroundUrl: mappedClient.heroBackgroundUrl || '',
                        heroBackgroundVideoUrl: mappedClient.heroBackgroundVideoUrl || '',
                        heroDisplayMode: mappedClient.heroDisplayMode || 'image',
                        heroVideoAudioEnabled: mappedClient.heroVideoAudioEnabled || false,
                        cinemaVideoAudioEnabled: mappedClient.cinemaVideoAudioEnabled || false,
                        advancedAnimations: (mappedClient.advancedAnimations as any) || {
                            enabled: false,
                            particleEffects: false,
                            parallaxScrolling: false,
                            floatingElements: false
                        },
                        mapCoordinates: mappedClient.mapCoordinates || { lat: -12.0932, lng: -77.0314 },
                        churchName: mappedClient.churchName || '',
                        ceremonyLocationName: mappedClient.ceremonyLocationName || '',
                        receptionLocationName: mappedClient.receptionLocationName || '',
                        ceremonyAddress: mappedClient.ceremonyAddress || '',
                        ceremonyReference: mappedClient.ceremonyReference || '',
                        ceremonyMapUrl: mappedClient.ceremonyMapUrl || '',
                        receptionAddress: mappedClient.receptionAddress || '',
                        receptionReference: mappedClient.receptionReference || '',
                        receptionMapUrl: mappedClient.receptionMapUrl || '',
                        isReceptionSameAsCeremony: mappedClient.isReceptionSameAsCeremony || false,
                        decorationImageUrl: mappedClient.decorationImageUrl || ''
                    });

                    console.log('[loadClientData] editForm actualizado con datos de Supabase');
                } else {
                    console.log('[loadClientData] Datos idénticos, saltando actualización para prevenir loop.');
                }

                hasLoadedOnceRef.current = true; // Marcar que ya cargamos una vez
            } catch (err) {
                console.error('Error loading client data:', err);
            }
        };

        loadClientData();
        return () => { ignore = true; };
    }, [authed, clientId, clientSession?.id]);


    const saveClientProfile = async () => {
        if (!clientSession || !clientId) return;
        setSaveStatus('saving');

        // Marcar timestamp de guardado para prevenir race condition
        lastSaveTimeRef.current = Date.now();

        try {
            const effectivePlan = getEffectivePlan(clientSession);

            // Logic for filtering fields based on plan before saving
            let audioUrl = editForm.backgroundAudioUrl;
            if (!['premium', 'deluxe'].includes(effectivePlan)) audioUrl = '';

            let heroVideoUrl = editForm.heroBackgroundVideoUrl;
            if (effectivePlan !== 'deluxe') heroVideoUrl = '';

            const advancedAnimations = effectivePlan === 'deluxe'
                ? editForm.advancedAnimations
                : { enabled: false, particleEffects: false, parallaxScrolling: false, floatingElements: false };

            const updated: ClientToken = {
                ...clientSession,
                ...editForm,
                weddingDate: editForm.weddingDate ? new Date(`${editForm.weddingDate}T12:00:00Z`) : clientSession.weddingDate,
                backgroundAudioUrl: audioUrl || undefined,
                heroBackgroundUrl: editForm.heroBackgroundUrl || undefined,
                heroBackgroundVideoUrl: heroVideoUrl || undefined,
                advancedAnimations: advancedAnimations,
                decorationImageUrl: editForm.decorationImageUrl || undefined
            };

            const weddingUTC = localToUTC(editForm.weddingDate, editForm.weddingTime);

            console.log('[saveClientProfile] Guardando datos:', {
                groomName: editForm.groomName,
                brideName: editForm.brideName,
                weddingTime: editForm.weddingTime,
                weddingDate_raw: editForm.weddingDate,
                weddingDate_toSave: editForm.weddingDate ? `${editForm.weddingDate}T12:00:00` : null,
                weddingUTC: weddingUTC,
                bibleVerse: editForm.bibleVerse,
                invitationText: editForm.invitationText
            });

            // CRÍTICO: Verificar que el updated pertenezca al mismo usuario
            if (updated.id !== clientId) {
                console.error('[saveClientProfile] ERROR CRÍTICO: Intento de guardar datos de otro usuario!', {
                    esperado: clientId,
                    recibido: updated.id
                });
                setSaveStatus('error');
                return;
            }

            // Actualizar estado local inmediatamente para feedback UI
            setClientSession(updated);

            // Guardar en Supabase PRIMERO para asegurar consistencia
            const { data: updatedData, error: updateError } = await supabase
                .from('clients')
                .update({
                    client_name: editForm.clientName,
                    // FIX ZONA HORARIA: Guardar mediodía UTC para evitar desplazamientos
                    wedding_date: editForm.weddingDate ? `${editForm.weddingDate}T12:00:00` : null,
                    wedding_datetime_utc: weddingUTC, // CRITICAL: Save absolute UTC time
                    groom_name: editForm.groomName,
                    bride_name: editForm.brideName,
                    wedding_time: validateAndFormatTime(editForm.weddingTime) || null,
                    reception_time: validateAndFormatTime(editForm.receptionTime) || null,
                    wedding_location: editForm.weddingLocation,
                    wedding_type: editForm.weddingType,
                    religious_symbol: editForm.religiousSymbol,
                    bible_verse: editForm.bibleVerse,
                    bible_verse_book: editForm.bibleVerseBook,
                    ceremony_address: editForm.ceremonyAddress,
                    ceremony_reference: editForm.ceremonyReference,
                    ceremony_map_url: editForm.ceremonyMapUrl,
                    reception_address: editForm.receptionAddress,
                    reception_reference: editForm.receptionReference,
                    reception_map_url: editForm.receptionMapUrl,
                    is_reception_same_as_ceremony: editForm.isReceptionSameAsCeremony,
                    invitation_text: editForm.invitationText,
                    background_audio_url: audioUrl || null,
                    hero_background_url: (editForm.heroBackgroundUrl && (editForm.heroBackgroundUrl.includes('supabase.co') || editForm.heroBackgroundUrl.startsWith('/'))) ? editForm.heroBackgroundUrl : null,
                    hero_background_video_url: heroVideoUrl || null,
                    hero_display_mode: editForm.heroDisplayMode || 'image',
                    hero_video_audio_enabled: editForm.heroVideoAudioEnabled,
                    church_name: editForm.churchName || null,
                    ceremony_location_name: editForm.ceremonyLocationName || null,
                    reception_location_name: editForm.receptionLocationName || null,
                    advanced_animations: advancedAnimations,
                })
                .eq('id', clientId)
                .select();

            if (updateError) {
                if (updateError.message !== 'Supabase no está configurado.') {
                    console.error('Error al guardar perfil (Supabase Update):', updateError);
                    alert(`Error al guardar: ${updateError.message}`);
                    throw updateError;
                }
            } else if (!updatedData || updatedData.length === 0) {
                console.error('Error: No se actualizó ninguna fila. Verifique el ID del cliente o permisos RLS.', { clientId });
                alert('Error: No se pudieron guardar los cambios. Parece que el cliente no existe o no tienes permisos.');
                throw new Error('No rows updated');
            }

            console.log('[saveClientProfile] Guardado exitoso en Supabase');
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            console.error('Error saving profile (Catch):', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const [rsvps, setRsvps] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [imageFiles, setImageFiles] = useState<any[]>([]);
    const [audioFiles, setAudioFiles] = useState<any[]>([]);
    const [videoFiles, setVideoFiles] = useState<any[]>([]);

    // Load RSVPs and Messages
    const fetchData = useCallback(async () => {
        if (!clientId) return;
        const { data: rData } = await supabase.from('rsvps').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (rData) setRsvps(rData);

        const { data: mData } = await supabase.from('messages').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (mData) setMessages(mData);
    }, [clientId]);

    useEffect(() => {
        if (authed) fetchData();
    }, [authed, fetchData]);

    // Load Files Helper
    const listClientFiles = useCallback(async (bucket: 'gallery' | 'audio' | 'videos') => {
        if (!clientId) return [];
        const folder = bucket === 'gallery' ? 'hero' : bucket === 'audio' ? 'audio' : 'video';
        const { data } = await supabase.storage.from(bucket).list(`${clientId}/${folder}`, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

        return (data || []).filter(f => !f.name.startsWith('.') && f.id).map(f => ({
            name: f.name,
            path: `${clientId}/${folder}/${f.name}`,
            created: f.created_at || new Date().toISOString()
        }));
    }, [clientId]);

    const loadFiles = useCallback(async () => {
        if (!authed || !clientId) return;
        const [imgs, auds, vids] = await Promise.all([
            listClientFiles('gallery'),
            listClientFiles('audio'),
            listClientFiles('videos')
        ]);

        setImageFiles([{ name: 'Imagen por Defecto', path: '/boda.webp', created: new Date().toISOString(), isSystem: true }, ...imgs]);
        setAudioFiles([{ name: 'Música por Defecto', path: '/audio.ogg', created: new Date().toISOString(), isSystem: true }, ...auds]);
        setVideoFiles([{ name: 'Video por Defecto', path: '/hero.webm', created: new Date().toISOString(), isSystem: true }, ...vids]);
    }, [authed, clientId, listClientFiles]);

    useEffect(() => {
        loadFiles();
        const i = setInterval(loadFiles, 30000);
        return () => clearInterval(i);
    }, [loadFiles]);

    const handleUpload = async (bucket: 'gallery' | 'audio' | 'videos', file: File): Promise<string | null> => {
        if (!clientId) return null;
        try {
            const folder = bucket === 'gallery' ? 'hero' : bucket === 'audio' ? 'audio' : 'video';
            const path = `${clientId}/${folder}/${file.name}`;
            const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

            if (uploadError) throw uploadError;

            await loadFiles();
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return data.publicUrl;
        } catch (e) {
            console.error('Error al subir archivo:', e);
            return null;
        }
    };

    const handleDelete = async (bucket: 'gallery' | 'audio' | 'videos', fileName: string): Promise<boolean> => {
        if (!clientId) return false;
        const folder = bucket === 'gallery' ? 'hero' : bucket === 'audio' ? 'audio' : 'video';
        const path = `${clientId}/${folder}/${fileName}`;

        try {
            const { error } = await supabase.storage.from(bucket).remove([path]);
            if (error) throw error;
            await loadFiles();
            return true;
        } catch (err) {
            console.error('Error al eliminar archivo:', err);
            return false;
        }
    };

    const login = async (token: string) => {
        const validated = await authenticateClientWithToken(token);
        if (validated) {
            const s = sessionStorage.getItem('clientAuth');
            if (s) {
                setClientSession(JSON.parse(s));
                setAuthed(true);
                return true;
            }
        }
        return false;
    };

    const logout = useCallback(() => {
        sessionStorage.removeItem('clientAuth');
        setAuthed(false);
        setClientSession(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    const handleUpgradeRequest = async (newPlan: 'premium' | 'deluxe') => {
        if (!clientId) return false;
        const success = await requestUpgrade(clientId, newPlan);
        if (success) {
            // Force reload to update UI
            setClientSession(prev => prev ? {
                ...prev,
                planStatus: 'pending_upgrade',
                pendingPlan: newPlan,
                pendingSince: new Date()
            } : null);
        }
        return success;
    };

    return {
        authed,
        clientSession,
        clientId,
        detectedClient,
        editForm,
        setEditForm,
        saveStatus,
        saveClientProfile,
        login,
        logout,
        handleUpgradeRequest,
        rsvps,
        messages,
        imageFiles,
        audioFiles,
        videoFiles,
        handleUpload,
        handleDelete,
        fetchData
    };
}
