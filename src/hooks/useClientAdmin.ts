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
        return hasAuth;
    });
    const [clientSession, setClientSession] = useState<ClientToken | null>(() => {
        try {
            const s = sessionStorage.getItem('clientAuth');
            return s ? JSON.parse(s) : null;
        } catch (err) {
            return null;
        }
    });

    // Ref para rastrear si acabamos de guardar (previene race condition)
    const isSavingRef = useRef<boolean>(false);
    const hasLoadedOnceRef = useRef<boolean>(false);

    const detectedClient = getCurrentClientData();
    const clientLike = authed ? (clientSession || detectedClient) : null;
    const clientId = clientLike ? clientLike.id : null;

    const [editForm, setEditForm] = useState(() => {
        const s = clientSession;
        return {
            clientName: s?.clientName || '',
            groomName: s?.groomName || '',
            brideName: s?.brideName || '',
            weddingDate: s?.weddingDate ? (s.weddingDate instanceof Date ? s.weddingDate.toISOString().split('T')[0] : String(s.weddingDate).split('T')[0]) : '',
            weddingTime: s?.weddingTime || '',
            receptionTime: s?.receptionTime || '',
            weddingLocation: s?.weddingLocation || '',
            weddingType: s?.weddingType || 'Boda',
            religiousSymbol: s?.religiousSymbol || '',
            bibleVerse: s?.bibleVerse || '',
            bibleVerseBook: s?.bibleVerseBook || '',
            invitationText: s?.invitationText || '',
            backgroundAudioUrl: s?.backgroundAudioUrl || '',
            heroBackgroundUrl: s?.heroBackgroundUrl || '',
            heroBackgroundVideoUrl: s?.heroBackgroundVideoUrl || '',
            heroDisplayMode: (s?.heroDisplayMode as any) || 'image',
            heroVideoAudioEnabled: s?.heroVideoAudioEnabled || false,
            cinemaVideoAudioEnabled: s?.cinemaVideoAudioEnabled || false,
            advancedAnimations: (s?.advancedAnimations as any) || {
                enabled: false,
                particleEffects: false,
                parallaxScrolling: false,
                floatingElements: false
            },
            mapCoordinates: s?.mapCoordinates || { lat: -12.0932, lng: -77.0314 },
            churchName: s?.churchName || '',
            ceremonyLocationName: s?.ceremonyLocationName || '',
            receptionLocationName: s?.receptionLocationName || '',
            ceremonyAddress: s?.ceremonyAddress || '',
            ceremonyReference: s?.ceremonyReference || '',
            ceremonyMapUrl: s?.ceremonyMapUrl || '',
            receptionAddress: s?.receptionAddress || '',
            receptionReference: s?.receptionReference || '',
            receptionMapUrl: s?.receptionMapUrl || '',
            isReceptionSameAsCeremony: s?.isReceptionSameAsCeremony || false,
            isCeremonySameAsReception: s?.isCeremonySameAsReception || false,
            changeExplanation: s?.changeExplanation || '',
            verseImageUrl: s?.verseImageUrl || '',
            isUrgent: s?.isUrgent || false
        };
    });

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Redirect if not authed
    useEffect(() => {
        // Double check storage to prevent race conditions
        const storedAuth = sessionStorage.getItem('clientAuth');
        if (!authed && storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                setClientSession(parsed);
                setAuthed(true);
                return; // Stop redirect
            } catch (e) {
            }
        }

        if (!authed && !storedAuth) {
            navigate('/login', { replace: true });
        } else {
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

        let ignore = false;

        const loadClientData = async () => {
            if (isSavingRef.current) {
                return;
            }

            try {
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

                if (clientData.id !== clientId) return;

                const mappedClient = mapSupabaseClientToToken(clientData);
                const isChanged = JSON.stringify(mappedClient) !== JSON.stringify(clientSession);

                if (isChanged || !hasLoadedOnceRef.current) {
                    sessionStorage.setItem('clientAuth', JSON.stringify(mappedClient));
                    window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(mappedClient) } }));
                    setClientSession(mappedClient);

                    setEditForm({
                        clientName: mappedClient.clientName || '',
                        groomName: mappedClient.groomName || '',
                        brideName: mappedClient.brideName || '',
                        weddingDate: mappedClient.weddingDate && !isNaN(new Date(mappedClient.weddingDate).getTime())
                            ? new Date(mappedClient.weddingDate).toISOString().split('T')[0]
                            : '',
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
                        isCeremonySameAsReception: mappedClient.isCeremonySameAsReception || false,
                        changeExplanation: mappedClient.changeExplanation || '',
                        verseImageUrl: mappedClient.verseImageUrl || '',
                        isUrgent: mappedClient.isUrgent || false
                    });
                }

                hasLoadedOnceRef.current = true;
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
        isSavingRef.current = true;

        try {
            const effectivePlan = getEffectivePlan(clientSession);
            let audioUrl = editForm.backgroundAudioUrl;
            if (!['premium', 'deluxe'].includes(effectivePlan)) audioUrl = '';

            let heroVideoUrl = editForm.heroBackgroundVideoUrl;
            if (effectivePlan !== 'deluxe') heroVideoUrl = '';

            const advancedAnimations = effectivePlan === 'deluxe'
                ? editForm.advancedAnimations
                : { enabled: false, particleEffects: false, parallaxScrolling: false, floatingElements: false };

            const weddingTimeFormatted = validateAndFormatTime(editForm.weddingTime);
            const receptionTimeFormatted = validateAndFormatTime(editForm.receptionTime);
            const weddingUTC = localToUTC(editForm.weddingDate, editForm.weddingTime);

            const { data: updatedData, error: updateError } = await supabase
                .from('clients')
                .update({
                    client_name: editForm.clientName,
                    wedding_date: editForm.weddingDate || null,
                    wedding_datetime_utc: weddingUTC || null,
                    groom_name: editForm.groomName,
                    bride_name: editForm.brideName,
                    wedding_time: weddingTimeFormatted || null,
                    reception_time: receptionTimeFormatted || null,
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
                    is_ceremony_same_as_reception: editForm.isCeremonySameAsReception,
                    change_explanation: editForm.changeExplanation,
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
                    verse_image_url: editForm.verseImageUrl || null,
                    is_urgent: editForm.isUrgent
                })
                .eq('id', clientId)
                .select()
                .single();

            if (updateError) throw updateError;

            if (updatedData) {
                const freshClient = mapSupabaseClientToToken(updatedData);
                sessionStorage.setItem('clientAuth', JSON.stringify(freshClient));
                window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(freshClient) } }));
                setClientSession(freshClient);
            }

            setSaveStatus('success');
            setTimeout(() => {
                isSavingRef.current = false;
                setSaveStatus('idle');
            }, 5000);
        } catch (err) {
            isSavingRef.current = false;
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

    const deleteRSVP = async (rsvpId: string): Promise<boolean> => {
        if (!clientId) return false;
        try {
            const { error } = await supabase
                .from('rsvps')
                .delete()
                .eq('id', rsvpId);

            if (error) throw error;
            await fetchData(); // Reload the list
            return true;
        } catch (err) {
            console.error('Error deleting RSVP:', err);
            return false;
        }
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
        fetchData,
        deleteRSVP
    };
}
