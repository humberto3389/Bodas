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

    // Cargar datos por subdominio desde el BFF (solo para página pública)
    useEffect(() => {
        if (subdomain && !initialData) {
            const loadClient = async () => {
                setLoading(true);
                try {
                    // ✅ USAR BFF en lugar de consulta directa
                    const bffData = await fetchWeddingDataFromBFF(subdomain, refresh);
                    const mappedClient = mapClientDataFromBFF(bffData.client);
                    setUrlClient(mappedClient);
                    // Los mensajes vienen del BFF, pero los actualizamos en tiempo real
                    setMessages(bffData.messages || []);
                    // Datos adicionales del BFF
                    setGalleryImages(bffData.galleryImages || []);
                    setVideos(bffData.videos || []);
                    setPadrinos(bffData.padrinos || []);
                } catch (e) {
                    console.error("[useInvitation] Error loading client from BFF:", e);
                    // ❌ ELIMINADO: Fallback a consulta directa. La página pública DEBE usar solo el BFF.
                    // Si el BFF falla, mostrar error al usuario en lugar de hacer consulta directa.
                    // Esto asegura que NO haya consultas directas a Supabase desde el frontend público.
                    setUrlClient(null);
                } finally {
                    setLoading(false);
                }
            };
            loadClient();
        } else if (initialData) {
            // Si ya tenemos datos iniciales, usarlos directamente
            setUrlClient(initialData);
            setLoading(false);
        }
    }, [subdomain, initialData, refresh]);

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
