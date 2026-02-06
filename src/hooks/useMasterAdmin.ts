import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isMasterAdmin } from '../pages/MasterAdmin';

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

export interface AdminMessage {
    id: string;
    type: 'contact' | 'upgrade';
    client_id: string | null;
    client_name: string | null;
    email: string;
    subject: string | null;
    message: string | null;
    requested_plan: string | null;
    status: 'new' | 'read' | 'approved' | 'rejected';
    created_at: string;
}

export interface MasterStats {
    totalClients: number;
    activeClients: number;
    pendingClients: number;
    expiredClients: number;
    monthlyRevenue: number;
    popularPlan: string;
    totalRevenue: number;
    growthRate: number;
    revenueThisMonth: number;
    newClientsThisMonth: number;
    pendingUpgradesCount: number;
}

const PLAN_PRICES = {
    basic: 10,  // Valores por defecto si SYSTEM_CONFIG falla
    premium: 25,
    deluxe: 50
};

export function useMasterAdmin() {
    const navigate = useNavigate();
    const [authed, setAuthed] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [adminInfo, setAdminInfo] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [stats, setStats] = useState<MasterStats>({
        totalClients: 0, activeClients: 0, pendingClients: 0, expiredClients: 0,
        monthlyRevenue: 0, popularPlan: 'basic', totalRevenue: 0, growthRate: 0,
        revenueThisMonth: 0, newClientsThisMonth: 0, pendingUpgradesCount: 0
    });

    const isFetchingRef = useRef(false);

    // Helper para notificaciones locales (podría ser reemplazado por un contexto global)
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const showNotification = useCallback((type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    const calculateStats = useCallback((clientList: Client[]) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalClients = clientList.length;
        const activeClients = clientList.filter(c => c.status === 'active').length;
        const pendingClients = clientList.filter(c => c.status === 'pending').length;
        const expiredClients = clientList.filter(c => c.status === 'expired' || c.status === 'suspended').length;

        const newClientsThisMonth = clientList.filter(client => {
            const createdDate = new Date(client.createdAt);
            return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        const totalRevenue = clientList.reduce((total, client) => total + (PLAN_PRICES[client.plan] || 0), 0);
        const monthlyRevenue = clientList.reduce((total, client) =>
            client.status === 'active' ? total + (PLAN_PRICES[client.plan] || 0) : total, 0);

        const revenueThisMonth = clientList.reduce((total, client) => {
            const createdDate = new Date(client.createdAt);
            if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
                return total + (PLAN_PRICES[client.plan] || 0);
            }
            return total;
        }, 0);

        const planCounts = clientList.reduce((acc, client) => {
            acc[client.plan] = (acc[client.plan] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const popularPlan = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'basic';

        const lastMonthClients = clientList.filter(client => {
            const createdDate = new Date(client.createdAt);
            const lastMonth = new Date(currentYear, currentMonth - 1);
            return createdDate.getMonth() === lastMonth.getMonth() && createdDate.getFullYear() === lastMonth.getFullYear();
        }).length;

        const growthRate = lastMonthClients > 0 ? ((newClientsThisMonth - lastMonthClients) / lastMonthClients) * 100 : 0;

        const pendingUpgradesCount = clientList.filter(c => c.planStatus === 'pending_upgrade').length;

        setStats({
            totalClients, activeClients, pendingClients, expiredClients,
            monthlyRevenue, popularPlan, totalRevenue,
            growthRate: Math.round(growthRate * 100) / 100,
            revenueThisMonth, newClientsThisMonth,
            pendingUpgradesCount
        });
    }, []);

    // Cargar clientes desde Supabase
    const loadClients = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoadingClients(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmail = session?.user?.email || '';
            const adminId = session?.user?.id || '';

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.message !== 'Supabase no está configurado.') {
                    showNotification('error', `Error al cargar clientes: ${error.message}`);
                }
                return;
            }

            if (data) {
                const filteredData = data.filter((c: any) => c.id !== adminId && c.email !== adminEmail);

                const formattedClients: Client[] = filteredData.map((c: any) => ({
                    id: c.id,
                    clientName: c.client_name || 'Sin nombre',
                    subdomain: c.subdomain || 'sin-subdominio',
                    email: c.email || 'sin-email',
                    plan: c.plan_type || 'basic',
                    status: c.is_active ? (new Date(c.access_until) > new Date() ? 'active' : 'expired') : 'suspended',
                    createdAt: c.created_at,
                    expiresAt: c.access_until,
                    token: c.token || '',
                    weddingDate: c.wedding_date,
                    guestCount: c.max_guests || 0,
                    brideName: c.bride_name,
                    groomName: c.groom_name,
                    provisioned: c.provisioned,
                    planStatus: c.plan_status,
                    pendingPlan: c.pending_plan,
                    pendingSince: c.pending_since
                }));

                setClients(formattedClients);
                calculateStats(formattedClients);
            }
        } catch (err) {
        } finally {
            isFetchingRef.current = false;
            setLoadingClients(false);
        }
    }, [showNotification, calculateStats]);

    const loadMessages = useCallback(async () => {
        setLoadingMessages(true);
        try {
            const { data, error } = await supabase
                .from('admin_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (err: any) {
            showNotification('error', `Error al cargar mensajes: ${err.message}`);
        } finally {
            setLoadingMessages(false);
        }
    }, [showNotification]);

    const updateMessageStatus = async (id: string, status: AdminMessage['status']) => {
        try {
            const { error } = await supabase
                .from('admin_messages')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            showNotification('success', 'Estado actualizado');
            loadMessages();
            return true;
        } catch (err: any) {
            showNotification('error', `Error: ${err.message}`);
            return false;
        }
    };

    const approveUpgradeRequest = async (message: AdminMessage) => {
        if (!message.client_id || !message.requested_plan) return false;

        try {
            // Cuando el admin aprueba, confirma que recibió el comprobante de pago
            // El plan ya está activo desde que el cliente lo solicitó
            // Solo cambiamos el estado y confirmamos el pago
            const { error: clientError } = await supabase
                .from('clients')
                .update({
                    plan_status: 'upgrade_approved', // Cambiar a aprobado
                    upgrade_approved_at: new Date().toISOString(), // Marcar fecha de aprobación
                    upgrade_confirmed: true, // Confirmar pago (comprobante recibido)
                    pending_since: null // Ya no es pending, es approved
                })
                .eq('id', message.client_id);

            if (clientError) throw clientError;

            // Mark message as approved
            await updateMessageStatus(message.id, 'approved');

            showNotification('success', `Pago confirmado. El upgrade al plan ${message.requested_plan.toUpperCase()} es ahora permanente.`);
            loadClients();
            return true;
        } catch (err: any) {
            showNotification('error', `Error al aprobar: ${err.message}`);
            return false;
        }
    };

    const confirmUpgradePayment = async (clientId: string): Promise<boolean> => {
        try {
            // Esta función ya no es necesaria porque approveUpgradeRequest ya confirma el pago
            // Pero la mantenemos por compatibilidad
            const { error: clientError } = await supabase
                .from('clients')
                .update({
                    plan_status: 'active', // Cambiar a active (permanente)
                    upgrade_confirmed: true, // Confirmar pago
                    original_plan_type: null, // Ya no necesitamos el plan original
                    pending_plan: null, // Ya no es pending
                    upgrade_approved_at: null // Limpiar fecha de aprobación
                })
                .eq('id', clientId);

            if (clientError) throw clientError;

            showNotification('success', 'Pago confirmado. El upgrade es ahora permanente.');
            loadClients();
            return true;
        } catch (err: any) {
            showNotification('error', `Error al confirmar pago: ${err.message}`);
            return false;
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            sessionStorage.removeItem('adminAuthed');
            sessionStorage.removeItem('adminEmail');
            sessionStorage.removeItem('adminId');
            setAuthed(false);
            setAdminInfo(null);
            navigate('/admin/login', { replace: true });
        } catch (error) {
            navigate('/admin/login', { replace: true });
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            setIsCheckingAuth(true);
            const safetyTimeout = setTimeout(() => setIsCheckingAuth(false), 10000);

            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session || !isMasterAdmin(session.user)) {
                    setAuthed(false);
                    navigate('/admin/login', { replace: true });
                    return;
                }

                const email = session.user.email || '';
                const fullName = session.user.user_metadata?.full_name || email.split('@')[0] || 'Administrador';

                setAuthed(true);
                setAdminInfo({ id: session.user.id, email, full_name: fullName });
                loadClients();
            } catch (error) {
                setAuthed(false);
                navigate('/admin/login', { replace: true });
            } finally {
                clearTimeout(safetyTimeout);
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [navigate, loadClients]);

    const confirmUpgrade = async (clientId: string, newPlan: 'premium' | 'deluxe') => {
        try {
            // Calculate new expiration date? Or keep the same? 
            // Usually upgrades prolong subscription or start a new cycle. 
            // For now, let's just switch the plan and set status to active.

            // Get current client to check duration
            // But simplify: Just update plan_type and reset pending fields.

            const { error } = await supabase
                .from('clients')
                .update({
                    plan_type: newPlan,
                    plan_status: 'active',
                    pending_plan: null,
                    pending_since: null
                })
                .eq('id', clientId);

            if (error) throw error;

            showNotification('success', 'Plan actualizado correctamente');
            loadClients(); // Refresh list
            return true;
        } catch (err: any) {
            showNotification('error', `Error al confirmar upgrade: ${err.message}`);
            return false;
        }
    };

    return {
        authed,
        isCheckingAuth,
        adminInfo,
        clients,
        setClients,
        loadingClients,
        stats,
        calculateStats,
        notification,
        showNotification,
        loadClients,
        messages,
        loadingMessages,
        loadMessages,
        updateMessageStatus,
        approveUpgradeRequest,
        confirmUpgradePayment,
        logout,
        confirmUpgrade
    };
}
