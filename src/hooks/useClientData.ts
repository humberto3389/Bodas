import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type RSVP = {
    name: string;
    email: string;
    phone?: string;
    guests: number;
    created_at?: string;
    is_attending?: boolean;
    attending_names?: string;
    not_attending_names?: string;
};
export type GuestMessage = { name: string; message: string; created_at?: string };

export function useClientData(clientId: string | null, authed: boolean) {
    const [rsvps, setRsvps] = useState<RSVP[]>([]);
    const [messages, setMessages] = useState<GuestMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const totalGuests = useMemo(() => rsvps.reduce((a, r) => {
        // El total es: Invitado principal (si asiste) + Acompañantes
        if (r.is_attending === false) return a;
        return a + (Number(r.guests) || 0) + 1;
    }, 0), [rsvps]);

    const loadData = useCallback(async () => {
        if (!authed) return;
        setIsLoading(true);
        try {
            const rsvpQuery = supabase
                .from('rsvps')
                .select('*')
                .order('created_at', { ascending: false });

            const messageQuery = supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (clientId) {
                rsvpQuery.eq('client_id', clientId);
                messageQuery.eq('client_id', clientId);
            }

            const [{ data: rData }, { data: mData }] = await Promise.all([rsvpQuery, messageQuery]);

            setRsvps((rData || []) as RSVP[]);
            setMessages((mData || []) as GuestMessage[]);
        } catch (err) {
            console.error('Error loading client data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [authed, clientId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const downloadCSV = useCallback((filename: string, rows: Array<Record<string, unknown>>) => {
        if (rows.length === 0) return;
        const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
        const csv = [
            headers.join(','),
            ...rows.map((r) => headers.map((h) => JSON.stringify(((r as Record<string, unknown>)[h] ?? '') as string)).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    return {
        rsvps,
        messages,
        totalGuests,
        isLoading,
        loadData,
        downloadCSV
    };
}
