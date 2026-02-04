import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authenticateClientWithToken, type ClientToken, requestUpgrade, checkAndRevertExpiredUpgrades } from '../lib/auth-system';
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
        isReceptionSameAsCeremony: false
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
        // Removing race condition check to fix stale data issue

        let ignore = false;

        const loadClientData = async () => {
            try {
                // Verificar y revertir upgrades expirados antes de cargar datos
                await checkAndRevertExpiredUpgrades(clientId);

                const { data: clientData, error } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', clientId)
                    .maybeSingle();

                if (ignore || error || !clientData) return;

                // Acceder a campos de upgrade de manera segura (pueden no existir si la migración no se ejecutó)
                const upgradeApprovedAt = (clientData as any).upgrade_approved_at
                    ? new Date((clientData as any).upgrade_approved_at)
                    : undefined;
                const upgradeConfirmed = (clientData as any).upgrade_confirmed ?? false;
                const originalPlanType = (clientData as any).original_plan_type;

                const effectivePlan = getEffectivePlan({
                    ...clientSession,
                    planStatus: clientData.plan_status,
                    pendingPlan: clientData.pending_plan,
                    pendingSince: clientData.pending_since ? new Date(clientData.pending_since) : undefined,
                    upgradeApprovedAt,
                    upgradeConfirmed,
                    originalPlanType
                } as any);

                // Filter data based on plan (Server side should also handle this, but frontend ensures consistency)
                const audioUrl = ['premium', 'deluxe'].includes(effectivePlan)
                    ? (clientData.background_audio_url || clientSession.backgroundAudioUrl)
                    : undefined;

                const videoUrl = effectivePlan === 'deluxe'
                    ? (clientData.hero_background_video_url || clientSession.heroBackgroundVideoUrl)
                    : undefined;

                const advAnimations = effectivePlan === 'deluxe'
                    ? (clientData.advanced_animations || clientSession.advancedAnimations || { enabled: false, particleEffects: false, parallaxScrolling: false, floatingElements: false })
                    : { enabled: false, particleEffects: false, parallaxScrolling: false, floatingElements: false };

                // Acceder a campos de upgrade de manera segura
                const upgradeApprovedAtValue = (clientData as any).upgrade_approved_at
                    ? new Date((clientData as any).upgrade_approved_at)
                    : clientSession.upgradeApprovedAt;
                const upgradeConfirmedValue = (clientData as any).upgrade_confirmed ?? clientSession.upgradeConfirmed;
                const originalPlanTypeValue = (clientData as any).original_plan_type ?? clientSession.originalPlanType;

                const updated: ClientToken = {
                    ...clientSession,
                    planType: clientData.plan_type ?? clientSession.planType,
                    planStatus: clientData.plan_status ?? clientSession.planStatus,
                    pendingPlan: clientData.pending_plan ?? clientSession.pendingPlan,
                    pendingSince: clientData.pending_since ? new Date(clientData.pending_since) : clientSession.pendingSince,
                    upgradeApprovedAt: upgradeApprovedAtValue,
                    upgradeConfirmed: upgradeConfirmedValue,
                    originalPlanType: originalPlanTypeValue,
                    clientName: clientData.client_name ?? clientSession.clientName,
                    groomName: clientData.groom_name ?? clientSession.groomName,
                    brideName: clientData.bride_name ?? clientSession.brideName,
                    weddingDate: clientData.wedding_date ? new Date(clientData.wedding_date) : clientSession.weddingDate,
                    weddingTime: clientData.wedding_time ?? clientSession.weddingTime,
                    weddingLocation: clientData.wedding_location ?? clientSession.weddingLocation,
                    weddingType: clientData.wedding_type ?? clientSession.weddingType,
                    religiousSymbol: clientData.religious_symbol ?? clientSession.religiousSymbol,
                    bibleVerse: clientData.bible_verse ?? clientSession.bibleVerse,
                    bibleVerseBook: clientData.bible_verse_book ?? clientSession.bibleVerseBook,
                    invitationText: clientData.invitation_text ?? clientSession.invitationText,
                    ceremonyAddress: clientData.ceremony_address ?? clientSession.ceremonyAddress,
                    ceremonyReference: clientData.ceremony_reference ?? clientSession.ceremonyReference,
                    ceremonyMapUrl: clientData.ceremony_map_url ?? clientSession.ceremonyMapUrl,
                    receptionAddress: clientData.reception_address ?? clientSession.receptionAddress,
                    receptionReference: clientData.reception_reference ?? clientSession.receptionReference,
                    receptionMapUrl: clientData.reception_map_url ?? clientSession.receptionMapUrl,
                    isReceptionSameAsCeremony: clientData.is_reception_same_as_ceremony ?? clientSession.isReceptionSameAsCeremony ?? false,
                    backgroundAudioUrl: audioUrl,
                    heroBackgroundUrl: clientData.hero_background_url ?? clientSession.heroBackgroundUrl,
                    heroBackgroundVideoUrl: videoUrl,
                    heroDisplayMode: (clientData.hero_display_mode as 'image' | 'video') || clientSession.heroDisplayMode,
                    heroVideoAudioEnabled: clientData.hero_video_audio_enabled ?? clientSession.heroVideoAudioEnabled,
                    cinemaVideoAudioEnabled: clientData.cinema_video_audio_enabled ?? clientSession.cinemaVideoAudioEnabled,
                    advancedAnimations: advAnimations,
                    mapCoordinates: clientData.map_coordinates || clientSession.mapCoordinates,
                    churchName: clientData.church_name || clientSession.churchName,
                    ceremonyLocationName: clientData.ceremony_location_name || clientSession.ceremonyLocationName,
                    receptionLocationName: clientData.reception_location_name || clientSession.receptionLocationName,
                    receptionTime: clientData.reception_time || clientSession.receptionTime,

                };

                console.log('[loadClientData] Datos cargados de Supabase:', {
                    groomName: clientData.groom_name,
                    brideName: clientData.bride_name,
                    weddingTime: clientData.wedding_time,
                    weddingDate_raw: clientData.wedding_date,
                    weddingDate_processed: clientData.wedding_date ? new Date(clientData.wedding_date).toISOString().slice(0, 10) : null,
                    bibleVerse: clientData.bible_verse
                });

                // CRÍTICO: Verificar que los datos pertenezcan al mismo usuario antes de actualizar
                if (updated.id !== clientId) {
                    console.warn('[loadClientData] Datos de otro usuario detectados, ignorando actualización', {
                        esperado: clientId,
                        recibido: updated.id
                    });
                    return;
                }

                // Prevent infinite loops by checking if data actually changed
                if (JSON.stringify(updated) !== JSON.stringify(clientSession)) {
                    console.log('[loadClientData] Datos actualizados, guardando nuevos datos...');
                    sessionStorage.setItem('clientAuth', JSON.stringify(updated));
                    window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(updated) } }));
                    setClientSession(updated);

                    // ACTUALIZAR editForm con los datos cargados de Supabase
                    setEditForm({
                        clientName: clientData.client_name || '',
                        groomName: clientData.groom_name || '',
                        brideName: clientData.bride_name || '',
                        weddingDate: clientData.wedding_date ? String(clientData.wedding_date).split('T')[0] : '',
                        weddingTime: clientData.wedding_time || '',
                        receptionTime: clientData.reception_time || '',
                        weddingLocation: clientData.wedding_location || '',
                        weddingType: clientData.wedding_type || '',
                        religiousSymbol: clientData.religious_symbol || '',
                        bibleVerse: clientData.bible_verse || '',
                        bibleVerseBook: clientData.bible_verse_book || '',
                        invitationText: clientData.invitation_text || '',
                        backgroundAudioUrl: audioUrl || '',
                        heroBackgroundUrl: clientData.hero_background_url || '',
                        heroBackgroundVideoUrl: videoUrl || '',
                        heroDisplayMode: (clientData.hero_display_mode as 'image' | 'video') || 'image',
                        heroVideoAudioEnabled: clientData.hero_video_audio_enabled || false,
                        cinemaVideoAudioEnabled: clientData.cinema_video_audio_enabled || false,
                        advancedAnimations: advAnimations,
                        mapCoordinates: clientData.map_coordinates || { lat: -12.0932, lng: -77.0314 },
                        churchName: clientData.church_name || '',
                        ceremonyLocationName: clientData.ceremony_location_name || '',
                        receptionLocationName: clientData.reception_location_name || '',
                        ceremonyAddress: clientData.ceremony_address || '',
                        ceremonyReference: clientData.ceremony_reference || '',
                        ceremonyMapUrl: clientData.ceremony_map_url || '',
                        receptionAddress: clientData.reception_address || '',
                        receptionReference: clientData.reception_reference || '',
                        receptionMapUrl: clientData.reception_map_url || '',
                        isReceptionSameAsCeremony: clientData.is_reception_same_as_ceremony || false
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

            console.log('[saveClientProfile] PRE-SAVE weddingTime:', editForm.weddingTime);
            console.log('[saveClientProfile] VALIDATED weddingTime:', validateAndFormatTime(editForm.weddingTime));

            // Guardar en Supabase PRIMERO para asegurar consistencia
            const { data: updatedData, error: updateError } = await supabase
                .from('clients')
                .update({
                    client_name: editForm.clientName,
                    // FIX ZONA HORARIA: Guardar mediodía UTC para evitar desplazamientos
                    wedding_date: editForm.weddingDate ? `${editForm.weddingDate}T12:00:00` : null,
                    wedding_datetime_utc: weddingUTC,
                    groom_name: editForm.groomName,
                    bride_name: editForm.brideName,
                    wedding_time: validateAndFormatTime(editForm.weddingTime),
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
                    hero_background_url: editForm.heroBackgroundUrl || null,
                    hero_background_video_url: heroVideoUrl || null,
                    hero_display_mode: editForm.heroDisplayMode || 'image',
                    hero_video_audio_enabled: editForm.heroVideoAudioEnabled,
                    cinema_video_audio_enabled: editForm.cinemaVideoAudioEnabled,
                    church_name: editForm.churchName,
                    ceremony_location_name: editForm.ceremonyLocationName,
                    reception_location_name: editForm.receptionLocationName,
                    reception_time: validateAndFormatTime(editForm.receptionTime),
                    advanced_animations: advancedAnimations,
                    map_coordinates: editForm.mapCoordinates,
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
            // We can manually update session here for instant feedback
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
        logout,
        handleUpgradeRequest
    };
}
