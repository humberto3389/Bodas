// Sistema de autenticación para alquiler de sitios de bodas
import { supabase } from './supabase';
import { validateAndFormatTime, UTCToLocal24h } from './timezone-utils';

// Debounce para evitar sincronizaciones repetidas
const syncDebounceMap = new Map<string, number>();
const SYNC_DEBOUNCE_INTERVAL = 30000; // 30 segundos mínimo entre sincronizaciones

export interface ClientToken {
  id: string;
  clientName: string;
  subdomain: string; // subdominio único para cada cliente
  token: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  weddingDate: Date;
  accessUntil: Date; // Fecha de expiración del acceso
  planType: 'basic' | 'premium' | 'deluxe'; // Tipo de plan contratado
  maxGuests: number; // Límite de invitados según el plan
  features: string[]; // Características incluidas en el plan
  planStatus?: 'active' | 'pending_upgrade' | 'expired' | 'upgrade_approved'; // Estado del plan
  pendingPlan?: 'premium' | 'deluxe'; // Plan solicitado
  pendingSince?: Date; // Fecha de solicitud
  upgradeApprovedAt?: Date; // Fecha en que el admin aprobó el upgrade
  upgradeConfirmed?: boolean; // Si el pago fue confirmado por el admin
  originalPlanType?: 'basic' | 'premium' | 'deluxe'; // Plan original antes del upgrade aprobado
  email?: string; // Email del cliente
  // Campos adicionales para personalización
  groomName?: string;
  brideName?: string;
  weddingLocation?: string;
  weddingTime?: string;
  bibleVerse?: string;
  bibleVerseBook?: string;
  invitationText?: string;
  weddingType?: string;
  religiousSymbol?: string;
  // Música de fondo personalizada
  backgroundAudioUrl?: string;
  // Imagen de fondo del Hero
  heroBackgroundUrl?: string;
  // Video de fondo del Hero (solo plan Deluxe)
  heroBackgroundVideoUrl?: string;
  // Preferencia del cliente: qué mostrar en el hero (imagen o video)
  heroDisplayMode?: 'image' | 'video'; // Por defecto 'image'
  // Si el video tiene audio habilitado o no
  heroVideoAudioEnabled?: boolean; // Por defecto false (sin audio)
  // Si el video de la sección Multimedia (Cinema) tiene audio habilitado
  cinemaVideoAudioEnabled?: boolean; // Por defecto false (sin audio)
  // Configuración de animaciones avanzadas (solo plan Deluxe)
  advancedAnimations?: {
    enabled: boolean;
    particleEffects?: boolean;
    parallaxScrolling?: boolean;
    floatingElements?: boolean;
  };
  // Campos para ubicación del mapa
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  ceremonyLocationName?: string;
  receptionLocationName?: string;
  receptionTime?: string;
  churchName?: string;
  // Campos de ubicación de ceremonia
  ceremonyAddress?: string;
  ceremonyMapUrl?: string;
  ceremonyReference?: string;
  // Campos de ubicación de recepción
  receptionAddress?: string;
  receptionMapUrl?: string;
  receptionReference?: string;
  isReceptionSameAsCeremony?: boolean;
  expiresAt: Date; // Fecha formal de expiración de la invitación
  wedding_datetime_utc?: string; // Nuevo campo para hora precisa
  timezone?: string; // Zona horaria del evento
  decorationImageUrl?: string;
}

// Planes disponibles
export const PLANS = {
  basic: {
    name: 'Básico',
    duration: 30, // días
    maxGuests: 50,
    features: ['Sitio web personalizado', 'Galería de fotos', 'RSVP', 'Mensajes']
  },
  premium: {
    name: 'Premium',
    duration: 60, // días
    maxGuests: 200,
    features: ['Sitio web personalizado', 'Galería de fotos', 'RSVP', 'Mensajes', 'Countdown', 'Música de fondo']
  },
  deluxe: {
    name: 'Deluxe',
    duration: 90, // días
    maxGuests: 999999, // Ilimitado visualmente
    features: ['Sitio web personalizado', 'Galería de fotos', 'RSVP', 'Mensajes', 'Countdown', 'Música de fondo', 'Video de fondo', 'Animaciones avanzadas']
  }
};

// Clientes por defecto
// Clientes por defecto (ELIMINADOS PARA EVITAR DATOS ESTÁTICOS)
const DEFAULT_CLIENTS: ClientToken[] = [];

// Función para cargar clientes desde localStorage
function loadClientsFromStorage(): ClientToken[] {
  try {
    const stored = sessionStorage.getItem('clientAuth');
    if (stored) {
      const client = JSON.parse(stored);
      // Retornar solo el cliente actual mapeado correctamente
      return [{
        ...client,
        createdAt: new Date(client.createdAt),
        weddingDate: client.weddingDate ? new Date(client.weddingDate) : undefined,
        accessUntil: client.accessUntil ? new Date(client.accessUntil) : undefined,
        expiresAt: (client.expiresAt || client.accessUntil) ? new Date(client.expiresAt || client.accessUntil) : undefined,
        lastUsed: client.lastUsed ? new Date(client.lastUsed) : undefined
      }];
    }
  } catch (error) {
  }
  return [];
}

// Función para guardar clientes en sessionStorage
function saveClientsToStorage(clients: ClientToken[]): void {
  try {
    // Si tenemos clientes, guardamos el primero como sesión activa
    if (clients.length > 0) {
      sessionStorage.setItem('clientAuth', JSON.stringify(clients[0]));
    }
  } catch (error) {
  }
}

// Función para sincronizar cliente con Supabase
async function syncClientToSupabase(client: ClientToken): Promise<void> {
  try {
    // Validar que el cliente tenga un ID válido
    if (!client.id) {
      console.warn('[syncClientToSupabase] Cliente sin ID, omitiendo sincronización:', client.clientName);
      return;
    }

    // DEBOUNCE: Evitar sincronizaciones repetidas del mismo cliente
    const now = Date.now();
    const lastSync = syncDebounceMap.get(client.id) || 0;

    if (now - lastSync < SYNC_DEBOUNCE_INTERVAL) {
      // Demasiado pronto, saltar sincronización
      return;
    }

    // Registrar el tiempo de esta sincronización
    syncDebounceMap.set(client.id, now);

    // Datos básicos para sincronizar
    const baseData = {
      id: client.id,
      client_name: client.clientName || '',
      subdomain: client.subdomain || '',
      token: client.token || '',
      is_active: client.isActive ?? true,
      created_at: client.createdAt?.toISOString() || new Date().toISOString(),
      last_used: client.lastUsed?.toISOString() || null,
      // FIX: Usar fecha ISO simple (YYYY-MM-DD) o asegurar mediodía UTC para evitar desfases de zona horaria
      wedding_date: client.weddingDate ? client.weddingDate.toISOString().split('T')[0] : null,
      access_until: client.accessUntil?.toISOString() || null,
      plan_type: client.planType || 'basic',
      max_guests: client.maxGuests ?? 50,
      expires_at: client.expiresAt?.toISOString() || null,
      wedding_type: client.weddingType || 'Boda', // Asegurar que se guarde el tipo de boda
    };

    // ESTRATEGIA: Verificar si el cliente ya existe
    const { data: existing, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (esto está bien)
      console.debug('[syncClientToSupabase] Error al verificar cliente:', checkError.message);
      return;
    }

    // Si existe, hacer UPDATE; si no existe, hacer INSERT
    if (existing?.id) {
      // Ya existe, hacer UPDATE
      const { error: updateError } = await supabase
        .from('clients')
        .update(baseData)
        .eq('id', client.id);

      if (updateError) {
        console.debug('[syncClientToSupabase] Error en UPDATE:', updateError.message);
        return;
      }
    } else {
      // No existe, hacer INSERT
      const { error: insertError } = await supabase
        .from('clients')
        .insert([baseData]);

      if (insertError) {
        console.debug('[syncClientToSupabase] Error en INSERT (puede ocurrir en race condition):', insertError.message);
        // Si falla por duplicado, intentar UPDATE como fallback
        const { error: updateError } = await supabase
          .from('clients')
          .update(baseData)
          .eq('id', client.id);

        if (updateError) {
          console.debug('[syncClientToSupabase] Error en UPDATE fallback:', updateError.message);
          return;
        }
      }
    }

    // Si el INSERT/UPDATE básico funcionó, intentar actualizar campos opcionales
    try {
      const updateData: Record<string, any> = {};


      if (client.groomName) updateData.groom_name = client.groomName;
      if (client.brideName) updateData.bride_name = client.brideName;
      if (client.weddingLocation) updateData.wedding_location = client.weddingLocation;
      if (client.weddingTime) updateData.wedding_time = client.weddingTime;
      // Asegurar también aquí por si acaso
      if (client.weddingType) updateData.wedding_type = client.weddingType;
      if (client.bibleVerse) updateData.bible_verse = client.bibleVerse;
      if (client.invitationText) updateData.invitation_text = client.invitationText;
      // Actualizar audio: incluir incluso si está vacío para poder eliminar
      if (client.backgroundAudioUrl !== undefined) updateData.background_audio_url = client.backgroundAudioUrl || null;
      if (client.heroBackgroundUrl) updateData.hero_background_url = client.heroBackgroundUrl;
      if (client.heroBackgroundVideoUrl) updateData.hero_background_video_url = client.heroBackgroundVideoUrl;
      if (client.cinemaVideoAudioEnabled !== undefined) updateData.cinema_video_audio_enabled = client.cinemaVideoAudioEnabled;

      // Solo actualizar si hay campos para actualizar
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', client.id);

        if (updateError) {
          console.debug('[syncClientToSupabase] Error actualizando campos opcionales:', updateError.message);
        }
      }
    } catch (e) {
      // Silencioso: si los campos no existen en el esquema, ignorar
      console.debug('[syncClientToSupabase] Campos opcionales no disponibles');
    }
  } catch (error) {
    // Silencioso completamente - la sincronización es opcional
    // No registrar nada para evitar spam en console
  }
}

// Función para cargar clientes desde Supabase (con fallback a localStorage)
async function loadClientsFromSupabase(): Promise<ClientToken[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Silencioso: no mostrar error si Supabase no está configurado
      if (error.message === 'Supabase no está configurado.') {
      } else {
      }
      throw error;
    }

    if (data && data.length > 0) {
      // Convertir datos de Supabase a ClientToken usando el mapeo centralizado
      return data.map((row: any) => mapSupabaseClientToToken(row));
    }
  } catch (error) {
    // Silencioso en modo desarrollo
    if (error && typeof error === 'object' && 'message' in error && error.message === 'Supabase no está configurado.') {
      // No hacer nada, es esperado en desarrollo
    } else {
    }
  }

  // Fallback a localStorage
  return loadClientsFromStorage();
}

/**
 * Mapea una fila de Supabase al formato ClientToken de forma centralizada.
 * Esta es la ÚNICA fuente de verdad para el mapeo de datos del cliente.
 */
export function mapSupabaseClientToToken(row: any): ClientToken {
  return {
    id: row.id,
    clientName: row.client_name,
    subdomain: row.subdomain,
    token: row.token,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    lastUsed: row.last_used ? new Date(row.last_used) : undefined,
    weddingDate: new Date(row.wedding_date),
    accessUntil: new Date(row.access_until),
    planType: row.plan_type,
    maxGuests: row.max_guests,
    expiresAt: new Date(row.expires_at || row.access_until),
    features: row.features || [],
    groomName: row.groom_name,
    brideName: row.bride_name,
    weddingLocation: row.wedding_location,
    // FIX: Usar wedding_datetime_utc como verdad absoluta si existe.
    weddingTime: row.wedding_datetime_utc
      ? UTCToLocal24h(row.wedding_datetime_utc)
      : (row.wedding_time ? validateAndFormatTime(row.wedding_time) : '18:00'),
    receptionTime: row.reception_time ? validateAndFormatTime(row.reception_time) : '21:00',
    bibleVerse: row.bible_verse,
    bibleVerseBook: row.bible_verse_book,
    invitationText: row.invitation_text,
    wedding_datetime_utc: row.wedding_datetime_utc,
    timezone: row.timezone,
    backgroundAudioUrl: row.background_audio_url || undefined,
    heroBackgroundUrl: row.hero_background_url || undefined,
    heroBackgroundVideoUrl: row.hero_background_video_url || undefined,
    heroDisplayMode: row.hero_display_mode || 'image',
    heroVideoAudioEnabled: row.hero_video_audio_enabled || false,
    advancedAnimations: row.advanced_animations || {
      enabled: false,
      particleEffects: false,
      parallaxScrolling: false,
      floatingElements: false
    },
    ceremonyLocationName: row.ceremony_location_name || undefined,
    receptionLocationName: row.reception_location_name || undefined,
    churchName: row.church_name || undefined,
    ceremonyAddress: row.ceremony_address,
    ceremonyReference: row.ceremony_reference,
    ceremonyMapUrl: row.ceremony_map_url,
    receptionAddress: row.reception_address,
    receptionMapUrl: row.reception_map_url,
    receptionReference: row.reception_reference,
    isReceptionSameAsCeremony: row.is_reception_same_as_ceremony,
    weddingType: row.wedding_type || undefined,
  };
}

// Cargar clientes iniciales
let CLIENT_TOKENS: ClientToken[] = loadClientsFromStorage();

// Intentar cargar desde Supabase al iniciar (async, no bloquea)
loadClientsFromSupabase().then(clients => {
  if (clients.length > 0) {
    CLIENT_TOKENS = clients;
    saveClientsToStorage(clients);
  }
}).catch(() => {
  // Modo degradado: usar localStorage
  // FIX: No usar fallback por defecto si falla la carga inicial, dejar que la UI maneje el estado de carga
  // Esto evita que aparezcan datos "zombies" de DEFAULT_CLIENTS
});

// Función para obtener todos los clientes
export function getAllClients(): ClientToken[] {
  return CLIENT_TOKENS;
}

// Función para actualizar la lista de clientes
export async function updateClientsList(clients: ClientToken[]): Promise<void> {
  CLIENT_TOKENS = clients;
  saveClientsToStorage(clients);

  // Sincronizar todos los clientes con Supabase
  for (const client of clients) {
    await syncClientToSupabase(client);
  }
}

// Función para validar token de cliente
export function validateClientToken(token: string): ClientToken | null {
  const client = CLIENT_TOKENS.find(c => c.token === token && c.isActive);

  if (!client) return null;

  const now = new Date();

  // Verificar si ha pasado la fecha de acceso
  if (now > client.accessUntil) {
    client.isActive = false;
    // Purga de datos al expirar acceso
    purgeClientData(client).catch(() => { });
    return null;
  }

  // Actualizar último uso
  client.lastUsed = now;
  saveClientsToStorage(CLIENT_TOKENS);

  // DESHABILITADO: Esta sincronización estaba sobrescribiendo datos buenos de Supabase
  // con datos viejos de localStorage. Los datos deben fluir de Supabase -> Local, no al revés.
  // syncClientToSupabase(client).catch(() => {
  //   // Modo degradado: continuar sin Supabase
  // });

  return client;
}

// Función para obtener cliente por subdominio
export function getClientBySubdomain(subdomain: string): ClientToken | null {
  const client = CLIENT_TOKENS.find(c => c.subdomain === subdomain && c.isActive);

  if (!client) return null;

  const now = new Date();

  // Verificar si ha pasado la fecha de acceso
  if (now > client.accessUntil) {
    client.isActive = false;
    purgeClientData(client).catch(() => { });
    return null;
  }

  return client;
}

// Función para obtener cliente por subdominio directamente de Supabase (datos frescos)
export async function fetchClientBySubdomain(subdomain: string): Promise<ClientToken | null> {
  const { data: clientData, error } = await supabase
    .from('clients')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !clientData) return null;

  // Mapear a ClientToken usando el mapeo centralizado
  return mapSupabaseClientToToken(clientData);
}

// Función para generar UUIDs simples (sin librerías externas)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Función para generar nuevo token de acceso para cliente
export async function generateClientToken(
  clientName: string,
  subdomain: string,
  weddingDate: Date,
  planType: 'basic' | 'premium' | 'deluxe'
): Promise<ClientToken> {
  // Generar token único y seguro
  const clientId = generateUUID(); // UUID real en formato correcto
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  const token = `boda-${subdomain}-${timestamp}-${randomPart}`;

  const plan = PLANS[planType];

  // Calcular fecha de acceso (boda + duración del plan)
  const accessUntil = new Date(weddingDate);
  accessUntil.setDate(accessUntil.getDate() + plan.duration);

  const newClient: ClientToken = {
    id: clientId,
    clientName,
    subdomain,
    token,
    isActive: true,
    createdAt: new Date(),
    weddingDate,
    accessUntil,
    planType,
    maxGuests: plan.maxGuests,
    features: plan.features,
    expiresAt: accessUntil
  };

  // Guardar en localStorage
  CLIENT_TOKENS.push(newClient);
  saveClientsToStorage(CLIENT_TOKENS);

  // NO sincronizar con Supabase aquí - se hace en createNewClient
  // La sincronización automática puede causar conflictos con inserts directos
  // syncClientToSupabase se llamará cuando sea necesario desde el código que crea el cliente

  return newClient;
}

// Purga completa de datos de un cliente (storage y tablas)
async function purgeClientData(client: ClientToken): Promise<void> {
  try {
    const prefix = client.id;
    const buckets = ['gallery', 'audio'];
    for (const bucket of buckets) {
      const folders = [prefix, `${prefix}/uploads`];
      for (const folder of folders) {
        const { data: files, error: listErr } = await supabase.storage.from(bucket).list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });
        if (!listErr && files && files.length) {
          const paths = files.map(f => `${folder}/${f.name}`);
          await supabase.storage.from(bucket).remove(paths).catch(() => { });
        }
      }
    }

    // Eliminar datos relacionados en tablas
    try {
      await supabase.from('rsvps').delete().eq('client_id', client.id);
    } catch { }
    try {
      await supabase.from('messages').delete().eq('client_id', client.id);
    } catch { }
    try {
      await supabase.from('clients').delete().eq('id', client.id);
    } catch { }

    // Remover del almacenamiento local
    CLIENT_TOKENS = CLIENT_TOKENS.filter(c => c.id !== client.id);
    saveClientsToStorage(CLIENT_TOKENS);
  } catch (e) {
    // Silencioso: continuar aunque falle alguna operación
  }
}

// Función para desactivar token de cliente
export async function deactivateClientToken(token: string): Promise<boolean> {
  const client = CLIENT_TOKENS.find(c => c.token === token);
  if (client) {
    client.isActive = false;
    saveClientsToStorage(CLIENT_TOKENS);
    await syncClientToSupabase(client);
    return true;
  }
  return false;
}

// Función para verificar y desactivar tokens expirados automáticamente
export function checkAndDeactivateExpiredTokens(): ClientToken[] {
  const now = new Date();
  const expiredTokens: ClientToken[] = [];

  CLIENT_TOKENS.forEach(client => {
    if (client.isActive && now > client.accessUntil) {
      client.isActive = false;
      expiredTokens.push(client);
      // Disparar purga
      purgeClientData(client).catch(() => { });
    }
  });

  return expiredTokens;
}

// Función para obtener días restantes de acceso
export function getDaysUntilExpiration(client: ClientToken): number {
  const now = new Date();
  const diffTime = client.accessUntil.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Función para verificar si el token está próximo a expirar (menos de 7 días)
export function isTokenNearExpiration(client: ClientToken): boolean {
  return getDaysUntilExpiration(client) <= 7;
}

// Función para solicitar upgrade de plan
export async function requestUpgrade(clientId: string, newPlan: 'premium' | 'deluxe'): Promise<boolean> {
  try {
    // 1. Obtener datos del cliente (plan actual y datos básicos)
    const { data: clientData, error: fetchError } = await supabase
      .from('clients')
      .select('client_name, email, plan_type')
      .eq('id', clientId)
      .single();

    if (fetchError) throw fetchError;

    const originalPlan = clientData?.plan_type || 'basic';

    // 2. Activar plan inmediatamente y guardar plan original para posible reversión
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        plan_type: newPlan, // Activar nuevo plan inmediatamente
        plan_status: 'pending_upgrade', // Estado temporal con cuenta regresiva
        pending_plan: newPlan,
        pending_since: new Date().toISOString(), // Iniciar cuenta regresiva de 24h
        original_plan_type: originalPlan, // Guardar plan original para revertir si expira
        upgrade_confirmed: false // Aún no confirmado el pago
      })
      .eq('id', clientId);

    if (clientError) throw clientError;

    // 3. Crear mensaje para el Master Admin
    const { error: msgError } = await supabase
      .from('admin_messages')
      .insert([{
        type: 'upgrade',
        client_id: clientId,
        client_name: clientData?.client_name || 'Cliente Autocreado',
        email: clientData?.email || 'N/A',
        subject: `Solicitud de Upgrade a Plan ${newPlan.toUpperCase()}`,
        message: `El cliente ha solicitado una mejora de su plan actual al plan ${newPlan.toUpperCase()}. El cliente ya tiene acceso temporal al nuevo plan. Tienes 24 horas para recibir el comprobante de pago y confirmar el upgrade.`,
        requested_plan: newPlan,
        status: 'new',
        created_at: new Date().toISOString()
      }]);

    if (msgError) {
      console.warn('Error creating admin message for upgrade:', msgError);
      // No lanzamos error aquí porque el estado del cliente ya se actualizó
    }

    return true;
  } catch (err) {
    console.error('Error requesting upgrade:', err);
    return false;
  }
}

/**
 * Verifica y revierte upgrades aprobados que han excedido las 24h sin confirmación
 * Esta función debe llamarse cuando se carga la sesión del cliente
 */
export async function checkAndRevertExpiredUpgrades(clientId: string): Promise<boolean> {
  try {
    // Usar select('*') para obtener todas las columnas disponibles
    // Esto evita errores si algunas columnas no existen aún
    const { data: client, error } = await supabase
      .from('clients')
      .select('plan_status, plan_type, pending_plan, pending_since')
      .eq('id', clientId)
      .single();

    if (error || !client) {
      console.debug('[checkAndRevertExpiredUpgrades] No se pudo cargar datos del cliente');
      return false;
    }

    // Procesar reversión para pending_upgrade (cuando cliente solicita pero admin no ha aprobado)
    const planStatus = client.plan_status;
    const pendingSince = client.pending_since;

    // Si está en pending_upgrade y pasaron más de 24h sin aprobar, revertir
    if (planStatus === 'pending_upgrade' && pendingSince) {
      const requestDate = new Date(pendingSince);
      const now = new Date();
      const diffHours = (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60);

      // Si pasaron más de 24 horas sin aprobar, revertir al plan original
      if (diffHours >= 24) {
        // Intentar obtener original_plan_type si existe, sino usar 'basic'
        let originalPlan = 'basic';

        try {
          const { data: upgradeData } = await supabase
            .from('clients')
            .select('original_plan_type')
            .eq('id', clientId)
            .maybeSingle();

          if (upgradeData && upgradeData.original_plan_type) {
            originalPlan = upgradeData.original_plan_type;
          }
        } catch {
          // Si la columna no existe, usar 'basic' por defecto
          originalPlan = 'basic';
        }

        const updateData: any = {
          plan_type: originalPlan,
          plan_status: 'active',
          pending_plan: null,
          pending_since: null
        };

        // Solo incluir campos de upgrade si existen
        try {
          const { data: testData } = await supabase
            .from('clients')
            .select('upgrade_confirmed, original_plan_type')
            .eq('id', clientId)
            .limit(1);

          if (testData !== null) {
            updateData.upgrade_confirmed = false;
            updateData.original_plan_type = null;
          }
        } catch {
          // Columnas no existen, no incluirlas en el update
        }

        const { error: updateError } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', clientId);

        if (updateError) {
          console.error('Error reverting expired upgrade:', updateError);
          return false;
        }

        return true; // Se revirtió exitosamente
      }
    }

    return false;
  } catch (err) {
    console.error('Error checking expired upgrades:', err);
    return false;
  }
}

// Función para extender acceso (solo para casos especiales)
export async function extendClientAccess(token: string, additionalDays: number): Promise<boolean> {
  const client = CLIENT_TOKENS.find(c => c.token === token);
  if (client) {
    client.accessUntil.setDate(client.accessUntil.getDate() + additionalDays);
    saveClientsToStorage(CLIENT_TOKENS);
    await syncClientToSupabase(client);
    return true;
  }
  return false;
}

// Función para autenticar cliente en Supabase Auth
export async function authenticateClientWithToken(token: string): Promise<boolean> {
  try {
    // ✅ PASO 1: Buscar cliente por token EN SUPABASE (fuente de verdad)
    // Esto asegura que siempre tenemos el cliente actualizado
    const { data: clientData, error: fetchError } = await supabase
      .from('clients')
      .select('*') // Traer TODOS los campos para no perder datos al refrescar sesión
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (fetchError || !clientData) {
      console.warn('[authenticateClientWithToken] Token no encontrado o inactivo');
      return false;
    }

    // Mapear a ClientToken completo usando el mapeo centralizado
    const client: ClientToken = mapSupabaseClientToToken(clientData);

    // ✅ USAR EMAIL REAL: Usar el email guardado en la BD, o fallback al formato generado
    const email = clientData.email || `client-${client.subdomain}@invitacionbodas.com`;
    const password = token;

    console.log('[authenticateClientWithToken] Intentando login...', {
      email,
      tokenPrefix: token.substring(0, 10) + '...',
      clientSubdomain: client.subdomain
    });

    // ✅ PASO 2: Intentar login con el usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.warn('[authenticateClientWithToken] Error en signInWithPassword:', authError.message);

      // Si el error es credenciales inválidas, intentar "Auto-Repair" creando el usuario
      // Esto sirve si el usuario de Auth fue borrado pero el Cliente sigue en la BD,
      // o si se quiere forzar la recreación (requiere borrar el usuario en Supabase Console primero si existe con otra pass)
      if (authError.message.includes('Invalid login credentials') || authError.status === 400) {
        console.log('[authenticateClientWithToken] Intentando autorrecuperación (SignUp)...');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'client',
              subdomain: client.subdomain,
              clientId: client.id,
              clientName: client.clientName,
              planType: client.planType // Asegurar que los metadatos estén presentes
            }
          }
        });

        if (signUpData?.user && !signUpError) {
          console.log('[authenticateClientWithToken] Autorrecuperación exitosa. Usuario recreado.');
          // Login exitoso tras creación
          return true;
        }

        if (signUpError) {
          console.error('[authenticateClientWithToken] Falló la autorrecuperación:', signUpError.message);
        }
      }

      // Si el error es "Email not confirmed", permitir login de todas formas (Comportamiento existente)
      if (authError.message.includes('not confirmed') || authError.message.includes('Email not confirmed')) {
        try {
          await supabase.auth.updateUser({
            data: {
              subdomain: client.subdomain,
              client_id: client.id,
              clientName: client.clientName,
              planType: client.planType,
              role: 'client'
            }
          });
        } catch (updateErr) {
          // Continuar incluso si updateUser falla
        }
        return true;
      }

      console.error('[authenticateClientWithToken] Login fallido definitivamente.');
      return false;
    }

    if (authData?.user) {
      // ✅ PASO 3: Actualizar metadatos del usuario para RLS
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            // client_id se usa en las políticas RLS para validar pertenencia
            client_id: client.id,
            // Información adicional útil
            clientName: client.clientName,
            planType: client.planType,
            weddingDate: client.weddingDate.toISOString(),
            // El rol se usa para determinar si es admin
            role: 'client' // Importante: 'client' NO es 'master_admin'
          }
        });

        if (updateError) {
          console.warn('[authenticateClientWithToken] Error al actualizar user metadata:', updateError.message);
          // Continuar de todas formas - el login ya fue exitoso
        }

        // ✅ PASO 4: Refrescar sesión para obtener JWT actualizado con metadatos
        try {
          await supabase.auth.refreshSession();
        } catch (refreshErr) {
          console.warn('[authenticateClientWithToken] Error al refrescar sesión:', refreshErr);
        }
      } catch (err) {
        console.warn('[authenticateClientWithToken] Error inesperado al actualizar user:', err);
        // Continuar de todas formas
      }

      // ✅ PASO 5: Guardar sesión localmente para el Administrador
      sessionStorage.setItem('clientAuth', JSON.stringify(client));
      window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(client) } }));

      return true;
    }

    return false;
  } catch (err) {
    console.error('[authenticateClientWithToken] Error inesperado:', err);
    return false;
  }
}

// Función para obtener estadísticas del negocio
export function getBusinessStats() {
  const now = new Date();
  const activeClients = CLIENT_TOKENS.filter(c => c.isActive && c.accessUntil > now);
  const expiredClients = CLIENT_TOKENS.filter(c => !c.isActive || c.accessUntil <= now);

  const revenue = CLIENT_TOKENS.reduce((total, client) => {
    const plan = PLANS[client.planType];
    const basePrice = plan.duration === 30 ? 100 : plan.duration === 60 ? 200 : 300;
    return total + basePrice;
  }, 0);

  return {
    totalClients: CLIENT_TOKENS.length,
    activeClients: activeClients.length,
    expiredClients: expiredClients.length,
    totalRevenue: revenue,
    clientsByPlan: {
      basic: CLIENT_TOKENS.filter(c => c.planType === 'basic').length,
      premium: CLIENT_TOKENS.filter(c => c.planType === 'premium').length,
      deluxe: CLIENT_TOKENS.filter(c => c.planType === 'deluxe').length
    }
  };
}
