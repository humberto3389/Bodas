import { supabase } from './supabase';
import { generateClientToken } from './auth-system';

export interface Client {
    id: string;
    clientName: string;
    subdomain: string;
    email: string;
    plan: 'basic' | 'premium' | 'deluxe';
    status: 'active' | 'pending' | 'expired' | 'suspended';
    createdAt: string;
    expiresAt: string;
    token: string;
    weddingDate: string;
    guestCount: number;
    lastLogin?: string;
    avatar?: string;
    brideName?: string;
    groomName?: string;
    provisioned?: boolean;
    provisionError?: string;
    planStatus?: 'active' | 'pending_upgrade' | 'expired';
    pendingPlan?: 'premium' | 'deluxe';
    pendingSince?: string;
}

export interface NewClientForm {
    clientName: string;
    subdomain: string;
    email: string;
    plan: 'basic' | 'premium' | 'deluxe';
    weddingDate: string;
    guestCount: number;
    brideName: string;
    groomName: string;
}

export interface EditingClient {
    id: string;
    clientName: string;
    email: string;
    plan: 'basic' | 'premium' | 'deluxe';
    weddingDate: string;
    guestCount: number;
    brideName?: string;
    groomName?: string;
}

// Función para crear un nuevo cliente
export async function createNewClient(data: {
    clientName: string;
    subdomain: string;
    email: string;
    plan: 'basic' | 'premium' | 'deluxe';
    weddingDate: Date;
    guestCount: number;
    brideName: string;
    groomName: string;
}): Promise<{ success: boolean; client?: Client; token?: string; error?: string }> {
    try {
        // Normalizar subdominio
        const normalizedSubdomain = data.subdomain.toLowerCase().trim();

        // Verificar que el subdominio no esté duplicado
        const { data: existingClient, error: checkError } = await supabase
            .from('clients')
            .select('id, subdomain')
            .eq('subdomain', normalizedSubdomain)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            return { success: false, error: `Error al verificar subdominio: ${checkError.message}` };
        }

        if (existingClient) {
            return { success: false, error: `El subdominio "${normalizedSubdomain}" ya está en uso. Por favor, elige otro.` };
        }

        // Generar token del cliente
        const clientToken = await generateClientToken(
            data.clientName,
            normalizedSubdomain,
            data.weddingDate,
            data.plan
        );

        // Crear registro en Supabase
        const clientEmail = (data.email && data.email.trim()) ? data.email.trim() : `client-${normalizedSubdomain}@invitacionbodas.com`;
        const { data: newClientData, error: insertError } = await supabase
            .from('clients')
            .insert([{
                id: clientToken.id,
                client_name: data.clientName,
                subdomain: normalizedSubdomain,
                email: clientEmail,
                token: clientToken.token,
                is_active: true,
                wedding_date: data.weddingDate.toISOString(),
                access_until: clientToken.accessUntil.toISOString(),
                plan_type: data.plan,
                max_guests: data.guestCount,
                groom_name: data.groomName || null,
                bride_name: data.brideName || null,
                created_at: new Date().toISOString(),
                last_used: null,
                provisioned: false
            }])
            .select()
            .single();

        if (insertError) {
            if (insertError.code === '23505' ||
                insertError.code === 'PGRST116' ||
                insertError.message?.includes('duplicate') ||
                insertError.message?.includes('already exists') ||
                insertError.message?.includes('Conflict')) {
                return { success: false, error: `El subdominio "${normalizedSubdomain}" ya está en uso. Por favor, elige otro.` };
            }
            return { success: false, error: `Error al crear cliente: ${insertError.message || 'Error desconocido'}` };
        }

        // Crear usuario en auth.users
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: clientEmail,
                password: clientToken.token,
                options: {
                    data: {
                        role: 'client',
                        subdomain: normalizedSubdomain,
                        clientId: newClientData.id,
                        clientName: data.clientName
                    }
                }
            });

            if (currentSession) {
                await supabase.auth.setSession({
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token
                }).catch(() => { });
            }

            if (signUpError) {
                console.warn('[createNewClient] Advertencia en signUp:', signUpError);

                if (signUpError.message?.includes('already registered') ||
                    signUpError.message?.includes('duplicate') ||
                    signUpError.message?.includes('User already registered')) {

                    console.log(`[createNewClient] Usuario Auth existente detectado (${clientEmail}). Intentando limpieza automática con force_delete_user...`);

                    // Intentar borrar el usuario zombie usando la RPC segura
                    const { error: rpcError } = await supabase.rpc('force_delete_user', { target_email: clientEmail });

                    if (rpcError) {
                        console.error('[createNewClient] Falló la limpieza automática:', rpcError);
                        return {
                            success: true,
                            client: newClientData,
                            token: clientToken.token,
                            error: `⚠️ El usuario Auth ya existía y no se pudo limpiar automáticamente: ${rpcError.message}. Borra el usuario manualmente en Supabase.`
                        };
                    }

                    // Reintentar creación tras borrado exitoso
                    console.log('[createNewClient] Limpieza exitosa. Reintentando creación de Auth User...');
                    const { data: retrySignUpData, error: retrySignUpError } = await supabase.auth.signUp({
                        email: clientEmail,
                        password: clientToken.token,
                        options: {
                            data: {
                                role: 'client',
                                subdomain: normalizedSubdomain,
                                clientId: newClientData.id,
                                clientName: data.clientName
                            }
                        }
                    });

                    if (retrySignUpError) {
                        console.error('[createNewClient] Falló el reintento de creación:', retrySignUpError);
                        return {
                            success: true,
                            client: newClientData,
                            token: clientToken.token,
                            error: `⚠️ Se limpió el usuario anterior, pero falló la nueva creación: ${retrySignUpError.message}.`
                        };
                    }

                    // Éxito tras reintento
                    console.log('[createNewClient] Reintento exitoso. Cliente y Auth sincronizados.');

                    // Marcar como provisionado
                    await supabase
                        .from('clients')
                        .update({ provisioned: true, provision_error: null })
                        .eq('id', newClientData.id);
                } else {
                    // Otros errores (rate limit, etc)
                    await supabase
                        .from('clients')
                        .update({
                            provisioned: false,
                            provision_error: `Auth Error: ${signUpError.message}`
                        })
                        .eq('id', newClientData.id);

                    return {
                        success: true,
                        client: newClientData,
                        token: clientToken.token,
                        error: `⚠️ El cliente se creó pero hubo un error en Auth: ${signUpError.message}`
                    };
                }
            } else if (signUpData?.user) {
                await supabase
                    .from('clients')
                    .update({ provisioned: true, provision_error: null })
                    .eq('id', newClientData.id);
            }
        } catch (authErr: any) {
            await supabase
                .from('clients')
                .update({
                    provisioned: false,
                    provision_error: `Error: ${authErr?.message || 'Error desconocido'}. El cliente puede usar método de token.`
                })
                .eq('id', newClientData.id);
        }

        const client: Client = {
            id: newClientData.id,
            clientName: newClientData.client_name,
            subdomain: newClientData.subdomain,
            email: newClientData.email,
            plan: newClientData.plan_type,
            status: newClientData.is_active ? 'active' : 'pending',
            createdAt: newClientData.created_at,
            expiresAt: newClientData.access_until,
            token: newClientData.token,
            weddingDate: newClientData.wedding_date,
            guestCount: newClientData.max_guests,
            lastLogin: newClientData.last_used || undefined,
            brideName: newClientData.bride_name || undefined,
            groomName: newClientData.groom_name || undefined,
            provisioned: newClientData.provisioned || false,
            provisionError: newClientData.provision_error || undefined
        };

        return { success: true, client, token: clientToken.token };
    } catch (error: any) {
        return { success: false, error: error.message || 'Error desconocido al crear cliente' };
    }
}

export async function updateClient(
    clientId: string,
    data: {
        client_name?: string;
        email?: string;
        plan_type?: 'basic' | 'premium' | 'deluxe';
        wedding_date?: string;
        max_guests?: number;
        bride_name?: string | null;
        groom_name?: string | null;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('clients')
            .update(data)
            .eq('id', clientId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Error desconocido al actualizar cliente' };
    }
}

export async function logAdminAction(action: string, resource: string, resourceId: string, metadata?: any): Promise<void> {
    try {
        await supabase
            .from('admin_actions')
            .insert([{
                action,
                resource,
                resource_id: resourceId,
                metadata: metadata || {},
                created_at: new Date().toISOString()
            }]);
    } catch (error) {
        // Ignorar fallos de loggeo
    }
}
