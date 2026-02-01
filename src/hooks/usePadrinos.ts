import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Padrino {
    id: string;
    client_id: string;
    name: string;
    role: string;
    description?: string;
    photo_url?: string;
    display_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PadrinoFormData {
    name: string;
    role: string;
    description?: string;
    photo_url?: string;
    is_active?: boolean;
}

export function usePadrinos(clientId: string | null | undefined) {
    const [padrinos, setPadrinos] = useState<Padrino[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load padrinos for the client
    const loadPadrinos = useCallback(async () => {
        if (!clientId) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('padrinos')
                .select('*')
                .eq('client_id', clientId)
                .order('display_order', { ascending: true });

            if (fetchError) throw fetchError;

            setPadrinos(data || []);
        } catch (err: any) {
            console.error('[usePadrinos] Error loading:', err);
            setError(err.message || 'Error al cargar padrinos');
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    // Add a new padrino
    const addPadrino = useCallback(async (data: PadrinoFormData): Promise<Padrino | null> => {
        if (!clientId) return null;

        try {
            // Get the next display_order
            const maxOrder = padrinos.reduce((max, p) => Math.max(max, p.display_order), -1);

            const { data: newPadrino, error: insertError } = await supabase
                .from('padrinos')
                .insert([{
                    client_id: clientId,
                    name: data.name,
                    role: data.role,
                    description: data.description || null,
                    photo_url: data.photo_url || null,
                    display_order: maxOrder + 1,
                    is_active: data.is_active ?? true
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            setPadrinos(prev => [...prev, newPadrino]);
            return newPadrino;
        } catch (err: any) {
            console.error('[usePadrinos] Error adding:', err);
            setError(err.message || 'Error al agregar padrino');
            return null;
        }
    }, [clientId, padrinos]);

    // Update an existing padrino
    const updatePadrino = useCallback(async (id: string, data: Partial<PadrinoFormData>): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('padrinos')
                .update({
                    name: data.name,
                    role: data.role,
                    description: data.description,
                    photo_url: data.photo_url,
                    is_active: data.is_active
                })
                .eq('id', id);

            if (updateError) throw updateError;

            setPadrinos(prev => prev.map(p =>
                p.id === id ? { ...p, ...data } : p
            ));
            return true;
        } catch (err: any) {
            console.error('[usePadrinos] Error updating:', err);
            setError(err.message || 'Error al actualizar padrino');
            return false;
        }
    }, []);

    // Delete a padrino
    const deletePadrino = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('padrinos')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setPadrinos(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (err: any) {
            console.error('[usePadrinos] Error deleting:', err);
            setError(err.message || 'Error al eliminar padrino');
            return false;
        }
    }, []);

    // Toggle active status
    const toggleActive = useCallback(async (id: string): Promise<boolean> => {
        const padrino = padrinos.find(p => p.id === id);
        if (!padrino) return false;

        return updatePadrino(id, { is_active: !padrino.is_active });
    }, [padrinos, updatePadrino]);

    // Reorder padrinos
    const reorderPadrinos = useCallback(async (orderedIds: string[]): Promise<boolean> => {
        try {
            // Update each padrino's display_order
            const updates = orderedIds.map((id, index) =>
                supabase
                    .from('padrinos')
                    .update({ display_order: index })
                    .eq('id', id)
            );

            await Promise.all(updates);

            // Update local state
            const reordered = orderedIds
                .map(id => padrinos.find(p => p.id === id))
                .filter((p): p is Padrino => p !== undefined)
                .map((p, index) => ({ ...p, display_order: index }));

            setPadrinos(reordered);
            return true;
        } catch (err: any) {
            console.error('[usePadrinos] Error reordering:', err);
            setError(err.message || 'Error al reordenar padrinos');
            return false;
        }
    }, [padrinos]);

    // Load on mount
    useEffect(() => {
        loadPadrinos();
    }, [loadPadrinos]);

    return {
        padrinos,
        activePadrinos: padrinos.filter(p => p.is_active),
        loading,
        error,
        loadPadrinos,
        addPadrino,
        updatePadrino,
        deletePadrino,
        toggleActive,
        reorderPadrinos
    };
}
