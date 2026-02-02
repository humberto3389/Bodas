import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ClientToken } from '../lib/auth-system';
import { fetchWeddingDataFromBFF, mapClientDataFromBFF } from '../lib/bff-client';

export function useInvitation(subdomain?: string, initialData?: ClientToken, refresh: boolean = false) {
    const [urlClient, setUrlClient] = useState<ClientToken | null>(null);
    const [loading, setLoading] = useState(!!subdomain);
    const [messages, setMessages] = useState<any[]>([]);
    // Datos adicionales del BFF
    const [galleryImages, setGalleryImages] = useState<{ name: string; url: string }[]>([]);
    const [videos, setVideos] = useState<{ name: string; url: string }[]>([]);
    const [padrinos, setPadrinos] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Cargar datos por subdominio desde el BFF
    useEffect(() => {
        const loadClient = async () => {
            if (!subdomain) return;

            // Si es la carga inicial y ya tenemos initialData, podemos saltarnos la primera llamada al BFF
            // PERO si refresh es true o refreshTrigger > 0, FORZAMOS la carga para actualizar.
            if (initialData && refreshTrigger === 0 && !refresh && !urlClient) {
                setUrlClient(initialData);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // ✅ USAR BFF
                const bffData = await fetchWeddingDataFromBFF(subdomain, refresh || refreshTrigger > 0);
                const mappedClient = mapClientDataFromBFF(bffData.client);
                setUrlClient(mappedClient);
                setMessages(bffData.messages || []);
                setGalleryImages(bffData.galleryImages || []);
                setVideos(bffData.videos || []);
                setPadrinos(bffData.padrinos || []);
            } catch (e) {
                console.error("[useInvitation] Error loading client from BFF:", e);
                if (!initialData) setUrlClient(null);
            } finally {
                setLoading(false);
            }
        };

        loadClient();
    }, [subdomain, refresh, refreshTrigger]); // Quitamos initialData de aquí para evitar loops, pero lo manejamos dentro

    // Realtime: Escuchar cambios en mensajes (solo para actualizaciones en tiempo real)
    // NOTA: La carga inicial viene del BFF, pero escuchamos cambios para mantener UI actualizada
    useEffect(() => {
        const currentClient = initialData || urlClient;
        if (!currentClient?.id) return;

        const channel = supabase
            .channel(`messages-${currentClient.id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'messages', filter: `client_id=eq.${currentClient.id}` },
                async () => {
                    // Solo recargar mensajes cuando hay cambios (no toda la página)
                    const { data, error } = await supabase
                        .from('messages')
                        .select('*')
                        .eq('client_id', currentClient.id)
                        .order('created_at', { ascending: false })
                        .limit(30); // Límite para mantener consistencia con BFF
                    if (!error && data) setMessages(data);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [urlClient?.id, initialData?.id]);

    // Realtime: Escuchar cambios en la tabla 'clients' para actualizar datos automáticamente
    useEffect(() => {
        const currentClient = initialData || urlClient;
        if (!currentClient?.id) return;

        console.log(`[useInvitation] Intentando suscribirse a cambios para cliente ${currentClient.id}...`);

        const channel = supabase
            .channel(`client-live-updates-${currentClient.id}`)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'clients',
                    filter: `id=eq.${currentClient.id}`
                },
                (payload) => {
                    console.log("[useInvitation] ⚡ ¡Cambio detectado en tiempo real!", payload);
                    setRefreshTrigger(prev => prev + 1);
                }
            )
            .subscribe((status, err) => {
                console.log(`[useInvitation] Suscripción 'clients' status: ${status}`, err ? err : "");
                if (status === 'CHANNEL_ERROR') {
                    console.error("[useInvitation] Error en canal de Realtime. Verifica que Realtime esté habilitado en la tabla 'clients'.");
                }
            });

        return () => {
            console.log("[useInvitation] Limpiando canal de Realtime");
            supabase.removeChannel(channel);
        };
    }, [urlClient?.id, initialData?.id]);

    // Calcular client usando useMemo para que se actualice cuando cambien las dependencias
    const client = useMemo(() => initialData || urlClient, [initialData, urlClient]);

    const submitRSVP = useCallback(async (data: {
        name: string;
        email: string;
        phone?: string;
        guests: number;
        isAttending: boolean;
        attendingNames?: string;
        notAttendingNames?: string;
    }) => {
        if (!client?.id) throw new Error('Cliente no identificado');

        // Validación de límite de invitados (solo si asiste)
        if (data.isAttending) {
            const maxGuests = client.maxGuests || 50;
            const { data: existingRSVPs, error: countError } = await supabase
                .from('rsvps')
                .select('guests')
                .eq('client_id', client.id);

            if (countError) throw countError;

            const currentTotal = (existingRSVPs || []).reduce((acc, r) => acc + (r.guests || 0) + 1, 0);
            const newTotal = currentTotal + (data.guests || 0) + 1;

            if (newTotal > maxGuests) {
                throw new Error(`Se ha alcanzado el límite de ${maxGuests} invitados.`);
            }
        }

        const { error } = await supabase.from('rsvps').insert({
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            guests: data.isAttending ? (data.guests || 0) : 0,
            client_id: client.id,
            is_attending: data.isAttending,
            attending_names: data.attendingNames || null,
            not_attending_names: data.notAttendingNames || null
        });

        if (error) throw error;
        return true;
    }, [client?.id, client?.maxGuests]);

    const submitMessage = useCallback(async (name: string, message: string) => {
        if (!client?.id) throw new Error('Cliente no identificado');

        const { error } = await supabase.from('messages').insert({
            name: name.trim(),
            message: message.trim(),
            client_id: client.id
        });

        if (error) throw error;
        return true;
    }, [client?.id]);

    const isExpired = useMemo(() => {
        if (!client?.expiresAt) return false;
        return new Date() > new Date(client.expiresAt);
    }, [client?.expiresAt]);

    const planType = client?.planType || 'basic';

    return {
        client,
        loading,
        messages,
        submitRSVP,
        submitMessage,
        isExpired,
        planType,
        // Datos adicionales del BFF
        galleryImages,
        videos,
        padrinos
    };
}
