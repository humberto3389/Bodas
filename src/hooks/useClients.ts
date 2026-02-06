import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SYSTEM_CONFIG } from '../lib/config';
import {
    createNewClient,
    updateClient,
    logAdminAction,
    type Client,
    type NewClientForm,
    type EditingClient
} from '../lib/clients-admin';
import { deleteClientStorage } from '../lib/storage-cleanup';

export function useClients(
    clients: Client[],
    setClients: React.Dispatch<React.SetStateAction<Client[]>>,
    loadClients: () => Promise<void>,
    calculateStats: (clientList: Client[]) => void,
    showNotification: (type: 'success' | 'error', message: string) => void,
    showConfirm: (options: any) => Promise<boolean>
) {
    // Modal states
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [createdClientData, setCreatedClientData] = useState<{ token: string; subdomain: string; clientName: string } | null>(null);
    const [editingClient, setEditingClient] = useState<EditingClient | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [subdomainManual, setSubdomainManual] = useState(false);
    const [provisionStatus, setProvisionStatus] = useState<Record<string, { status: 'idle' | 'in_progress' | 'success' | 'error'; error?: string }>>({});
    const [isCreating, setIsCreating] = useState(false);

    // Form state for new client
    const [newClient, setNewClient] = useState<NewClientForm>({
        clientName: '',
        subdomain: '',
        email: '',
        plan: 'basic',
        weddingDate: '',
        guestCount: 100,
        brideName: '',
        groomName: ''
    });

    const generateAvatar = (): string => {
        const avatars = ['👰‍♂️', '💑', '👩‍❤️‍👨', '💒', '🎊', '✨', '🌟', '🥂'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    };

    const createClient = async () => {
        if (!newClient.clientName || !newClient.subdomain || !newClient.weddingDate) {
            showNotification('error', 'Por favor completa todos los campos obligatorios');
            return;
        }

        setIsCreating(true);
        try {
            const result = await createNewClient({
                ...newClient,
                weddingDate: new Date(newClient.weddingDate)
            });

            if (!result.success) {
                const errorMsg = result.error || 'Error al crear el cliente';
                if (errorMsg.includes('subdominio') && (errorMsg.includes('ya está') || errorMsg.includes('duplicado'))) {
                    showNotification('error', `❌ ${errorMsg}\n\n💡 Tip: Prueba agregando números o fechas al subdominio.`);
                    return;
                }
                showNotification('error', errorMsg);
                return;
            }

            if (result.client?.id) {
                await logAdminAction('create_client', 'client', result.client.id, {
                    clientName: newClient.clientName,
                    subdomain: newClient.subdomain,
                    plan: newClient.plan
                });
            }

            if (result.client) {
                const newClientWithAvatar = {
                    ...result.client,
                    avatar: generateAvatar()
                };
                setClients(prevClients => {
                    const updatedClients = [newClientWithAvatar, ...prevClients];
                    calculateStats(updatedClients);
                    return updatedClients;
                });
            }

            setCreatedClientData({
                token: result.token || '',
                subdomain: newClient.subdomain.toLowerCase(),
                clientName: newClient.clientName
            });
            setShowTokenModal(true);

            const createdClientName = newClient.clientName;
            setNewClient({
                clientName: '',
                subdomain: '',
                email: '',
                plan: 'basic',
                weddingDate: '',
                guestCount: 100,
                brideName: '',
                groomName: ''
            });
            setIsCreatingClient(false);
            setSubdomainManual(false);

            setTimeout(async () => {
                await loadClients();
            }, 1000);

            showNotification('success', `✅ Cliente "${createdClientName}" creado exitosamente`);
        } catch (error: any) {
            showNotification('error', 'Error al crear el cliente: ' + (error.message || 'Error desconocido'));
        } finally {
            setIsCreating(false);
        }
    };

    const updateClientStatus = async (clientId: string, status: Client['status']) => {
        try {
            const { error } = await supabase
                .from('clients')
                .update({ is_active: status === 'active' })
                .eq('id', clientId);

            if (error) {
                showNotification('error', error.message || 'Error al actualizar');
                return;
            }

            await loadClients();
            showNotification('success', `Estado actualizado a ${status}`);
        } catch (error) {
            showNotification('error', 'Error al actualizar el estado');
        }
    };

    const deleteClient = async (clientId: string) => {
        const client = clients.find(c => c.id === clientId);

        const confirmed = await showConfirm({
            title: 'Eliminar Cliente',
            message: `¿Estás seguro de que quieres eliminar a "${client?.clientName}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            showNotification('success', `🔄 Iniciando limpieza profunda para "${client?.clientName}"...`);

            // 1. Limpieza de Storage (Bukets: gallery, audio, videos)
            await deleteClientStorage(clientId);

            // 2. Limpieza de Tablas relacionadas
            // Usamos Promise.allSettled para no bloquear si una tabla no existe o falla
            await Promise.allSettled([
                supabase.from('rsvps').delete().eq('client_id', clientId),
                supabase.from('messages').delete().eq('client_id', clientId),
                supabase.from('admin_messages').delete().eq('client_id', clientId),
                supabase.from('admin_actions').delete().eq('resource_id', clientId)
            ]);

            // 3. Limpieza de Usuario Auth (RPC segura)
            if (client?.email) {
                await supabase.rpc('force_delete_user', { target_email: client.email });
            }

            // 4. Finalmente, eliminar el registro del cliente
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) {
                showNotification('error', `❌ Error al eliminar registro: ${error.message || 'Error desconocido'}`);
                return;
            }

            await loadClients();
            setSelectedClient(null);
            showNotification('success', `✅ Cliente "${client?.clientName}" eliminado exitosamente`);
            await logAdminAction('delete_client', 'client', clientId, {
                clientName: client?.clientName
            });
        } catch (error: any) {
            showNotification('error', `❌ Error al eliminar el cliente: ${error.message || 'Error inesperado'}`);
        }
    };

    const openEditClient = (client: Client) => {
        setEditingClient({
            id: client.id,
            clientName: client.clientName,
            email: client.email,
            plan: client.plan,
            weddingDate: client.weddingDate?.split('T')[0],
            guestCount: client.guestCount,
            brideName: client.brideName,
            groomName: client.groomName
        });
        setShowEditModal(true);
    };

    const updateEditingClient = async () => {
        if (!editingClient) return;

        try {
            const result = await updateClient(editingClient.id, {
                client_name: editingClient.clientName,
                email: editingClient.email,
                plan_type: editingClient.plan,
                wedding_date: editingClient.weddingDate,
                max_guests: editingClient.guestCount,
                bride_name: editingClient.brideName || null,
                groom_name: editingClient.groomName || null
            });

            if (!result.success) {
                showNotification('error', result.error || 'Error al actualizar');
                return;
            }

            await loadClients();
            setShowEditModal(false);
            setEditingClient(null);
            showNotification('success', 'Cliente actualizado exitosamente');
        } catch (error) {
            showNotification('error', 'Error al actualizar el cliente');
        }
    };

    const handleEditClientChange = useCallback((field: keyof EditingClient, value: any) => {
        setEditingClient(prev => {
            if (!prev) return null;
            return { ...prev, [field]: value };
        });
    }, []);

    const renewClientAccess = async (clientId: string, additionalDays: number) => {
        try {
            const client = clients.find(c => c.id === clientId);
            if (!client) return;

            const newExpiryDate = new Date(client.expiresAt);
            newExpiryDate.setDate(newExpiryDate.getDate() + additionalDays);

            const { error } = await supabase
                .from('clients')
                .update({
                    access_until: newExpiryDate.toISOString(),
                    is_active: true
                })
                .eq('id', clientId);

            if (error) {
                showNotification('error', 'Error al renovar acceso');
                return;
            }

            await loadClients();
            showNotification('success', `Acceso renovado por ${additionalDays} días`);
        } catch (error) {
            showNotification('error', 'Error al renovar acceso');
        }
    };

    const changeClientPlan = async (clientId: string, newPlan: 'basic' | 'premium' | 'deluxe') => {
        try {
            const { error } = await supabase
                .from('clients')
                .update({
                    plan_type: newPlan,
                    max_guests: SYSTEM_CONFIG.PLANS[newPlan].maxGuests
                })
                .eq('id', clientId);

            if (error) {
                showNotification('error', 'Error al cambiar plan');
                return;
            }

            await loadClients();
            showNotification('success', `Plan cambiado a ${newPlan}`);
        } catch (error) {
            showNotification('error', 'Error al cambiar plan');
        }
    };

    const provisionClient = async (client: Client) => {
        if (!client || !client.id) {
            showNotification('error', '❌ Error: Cliente no seleccionado correctamente');
            return;
        }

        const clientId = client.id;
        const clientSubdomain = client.subdomain;
        const clientToken = client.token;
        const clientName = client.clientName;

        setProvisionStatus(ps => ({ ...ps, [clientId]: { status: 'in_progress' } }));

        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (!currentSession) {
                setProvisionStatus(ps => ({ ...ps, [clientId]: { status: 'error', error: 'No hay sesión activa' } }));
                showNotification('error', '❌ Error: No hay sesión activa. Por favor, inicia sesión nuevamente.');
                return;
            }

            const email = `client-${clientSubdomain}@invitacionbodas.com`;

            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password: clientToken,
                options: {
                    data: {
                        role: 'client',
                        subdomain: clientSubdomain,
                        clientId: clientId,
                        clientName: clientName
                    }
                }
            });

            if (currentSession) {
                await supabase.auth.setSession({
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token
                }).catch(() => {
                    supabase.auth.refreshSession(currentSession).catch(() => { });
                });
            }

            if (signUpError) {
                if (!signUpError.message?.includes('already registered') && !signUpError.message?.includes('duplicate')) {
                    setProvisionStatus(ps => ({ ...ps, [clientId]: { status: 'error', error: signUpError.message } }));
                    showNotification('error', `Error al provisionar acceso: ${signUpError.message}`);
                    return;
                }
            }

            const { error: updateError } = await supabase
                .from('clients')
                .update({
                    provisioned: true,
                    provision_error: null
                })
                .eq('id', clientId);

            if (updateError) {
                setProvisionStatus(ps => ({ ...ps, [clientId]: { status: 'error', error: updateError.message } }));
                showNotification('error', `Error al guardar provisión: ${updateError.message}`);
                return;
            }

            setProvisionStatus(ps => ({ ...ps, [clientId]: { status: 'success' } }));
            showNotification('success', `Acceso provisionado correctamente\n\nEmail: ${email}`);

            await new Promise(resolve => setTimeout(resolve, 500));
            await loadClients();
        } catch (err: any) {
            setProvisionStatus(ps => ({ ...ps, [clientId]: { status: 'error', error: err.message } }));
            showNotification('error', `❌ Error inesperado: ${err.message}`);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showNotification('success', 'Copiado al portapapeles');
    };

    return {
        selectedClient,
        setSelectedClient,
        isCreatingClient,
        setIsCreatingClient,
        showTokenModal,
        setShowTokenModal,
        createdClientData,
        setCreatedClientData,
        editingClient,
        setEditingClient,
        showEditModal,
        setShowEditModal,
        newClient,
        setNewClient,
        subdomainManual,
        setSubdomainManual,
        provisionStatus,
        setProvisionStatus,
        isCreating,
        createClient,
        updateClientStatus,
        deleteClient,
        openEditClient,
        updateEditingClient,
        handleEditClientChange,
        renewClientAccess,
        changeClientPlan,
        provisionClient,
        copyToClipboard,
        generateAvatar
    };
}
