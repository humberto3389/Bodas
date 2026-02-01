import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ClientToken } from '../lib/auth-system';

export function useInvitation(subdomain?: string, initialData?: ClientToken) {
    const [urlClient, setUrlClient] = useState<ClientToken | null>(null);
    const [loading, setLoading] = useState(!!subdomain);
    const [messages, setMessages] = useState<any[]>([]);

    // Cargar datos por subdominio si es necesario
    useEffect(() => {
        if (subdomain) {
            const loadClient = async () => {
                setLoading(true);
                try {
                    const { fetchClientBySubdomain } = await import('../lib/auth-system');
                    const data = await fetchClientBySubdomain(subdomain);
                    if (data) setUrlClient(data);
                } catch (e) {
                    console.error("Error loading preview client:", e);
                } finally {
                    setLoading(false);
                }
            };
            loadClient();
        }
    }, [subdomain]);

    // Realtime: Escuchar cambios en la data del cliente (para vista previa en vivo)
    useEffect(() => {
        if (!urlClient?.id || !subdomain) return;

        const channel = supabase
            .channel(`client-updates-${urlClient.id}`)
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'clients', filter: `id=eq.${urlClient.id}` },
                async () => {
                    // Recargar datos completos al detectar cambios
                    const { fetchClientBySubdomain } = await import('../lib/auth-system');
                    const data = await fetchClientBySubdomain(subdomain);
                    if (data) setUrlClient(data);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [urlClient?.id, subdomain]);

    const client = initialData || urlClient;

    // Cargar mensajes del Libro de Visitas (Real-time)
    useEffect(() => {
        if (!client?.id) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('client_id', client.id)
                .order('created_at', { ascending: false });

            if (!error && data) setMessages(data);
        };

        fetchMessages();

        const channel = supabase
            .channel(`messages-${client.id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'messages', filter: `client_id=eq.${client.id}` },
                () => fetchMessages()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [client?.id]);

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
        planType
    };
}
