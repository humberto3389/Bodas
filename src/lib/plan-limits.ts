import type { ClientToken } from './auth-system';

export type PlanType = 'basic' | 'premium' | 'deluxe';
export type ResourceType = 'guests' | 'rsvps' | 'messages' | 'photos' | 'videos';

// Defines the strict limits for each plan
export const PLAN_LIMITS = {
    basic: {
        guests: 50,
        rsvps: 50,
        messages: 50,
        photos: 30,
        videos: 1,
        videoDurationSec: 120, // 2 minutes
    },
    premium: {
        guests: 200,
        rsvps: 200,
        messages: 200,
        photos: 80,
        videos: 3,
        videoDurationSec: 300, // 5 minutes
    },
    deluxe: {
        guests: Infinity,
        rsvps: Infinity,
        messages: Infinity,
        photos: Infinity,
        videos: Infinity,
        videoDurationSec: 600, // 10 minutes
    }
};

/**
 * Returns the usage statistics and limits for a given client.
 * Handles logic for "Pending Upgrades" in Strict Mode (24h grace period).
 */
/**
 * Obtiene el plan efectivo considerando el periodo de gracia de 24h para upgrades pendientes.
 */
export function getEffectivePlan(client: ClientToken): PlanType {
    let effectivePlan: PlanType = (client.planType as PlanType) || 'basic';

    // Si el upgrade fue aprobado y confirmado por el admin, usar el plan aprobado (permanente)
    if (client.planStatus === 'upgrade_approved' && 
        client.upgradeConfirmed) {
        // Upgrade confirmado, plan permanente
        effectivePlan = client.planType as PlanType;
    }
    // Si está en pending_upgrade (solicitud inicial - cliente tiene acceso temporal)
    else if (client.planStatus === 'pending_upgrade' && client.pendingPlan && client.pendingSince) {
        const pendingSince = new Date(client.pendingSince);
        const now = new Date();
        const diffHours = (now.getTime() - pendingSince.getTime()) / (1000 * 60 * 60);

        // Si no han pasado 24h, cliente tiene acceso temporal al nuevo plan
        if (diffHours < 24) {
            effectivePlan = client.pendingPlan as PlanType;
        } else {
            // Si pasaron 24h sin confirmar, revertir al plan original
            effectivePlan = (client.originalPlanType as PlanType) || effectivePlan;
        }
    }

    return effectivePlan;
}

/**
 * Returns the usage statistics and limits for a given client.
 * Handles logic for "Pending Upgrades" in Strict Mode (24h grace period).
 */
export function getClientLimits(client: ClientToken) {
    const effectivePlan = getEffectivePlan(client);
    return PLAN_LIMITS[effectivePlan];
}

/**
 * Checks if a specific action is allowed based on current usage.
 * @returns { allowed: boolean, limit: number, current: number, plan: PlanType }
 */
export function checkLimit(
    client: ClientToken,
    resource: ResourceType,
    currentCount: number
): { allowed: boolean; limit: number; current: number; effectivePlan: PlanType; message?: string } {

    const limits = getClientLimits(client);
    const limit = limits[resource];
    const effectivePlan = getEffectivePlan(client);

    // Safety check for Infinity
    if (limit === Infinity) {
        return { allowed: true, limit: Infinity, current: currentCount, effectivePlan };
    }

    const allowed = currentCount < limit;
    let message = '';

    if (!allowed) {
        const resourceName = resource === 'photos' ? 'fotos' : resource === 'videos' ? 'videos' : resource;
        message = `Has alcanzado el límite de ${limit} ${resourceName} para el plan ${effectivePlan.toUpperCase()}. Mejora tu plan para añadir más.`;
    }

    return {
        allowed,
        limit,
        current: currentCount,
        effectivePlan,
        message
    };
}

/**
 * Formats duration text (e.g. "2 min", "5 min")
 */
export function getMaxDurationText(plan: PlanType): string {
    const sec = PLAN_LIMITS[plan].videoDurationSec;
    return `${Math.floor(sec / 60)} min`;
}
