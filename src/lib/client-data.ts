// Sistema de base de datos multi-cliente
export interface ClientData {
  id: string;
  clientName: string;
  subdomain: string;
  weddingDate: Date;
  groomName: string;
  brideName: string;
  weddingLocation: string;
  weddingTime: string;
  bibleVerse: string;
  bibleVerseBook?: string;
  invitationText: string;
  weddingType?: string;
  religiousSymbol?: string;
  backgroundAudioUrl?: string;
  heroBackgroundUrl?: string;
  heroBackgroundVideoUrl?: string;
  heroDisplayMode?: 'image' | 'video';
  heroVideoAudioEnabled?: boolean;
  isActive: boolean;
  createdAt: Date;
  accessUntil: Date;
  expiresAt: Date;
  planType?: 'basic' | 'premium' | 'deluxe';
  email?: string;
  features?: string[];
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
  wedding_datetime_utc?: string;
  timezone?: string;
}

// Función para obtener datos del cliente actual desde el contexto de autenticación
// Esta función debe ser llamada desde componentes que tengan acceso al contexto
export function getCurrentClientData(): ClientData | null {
  // Intentar obtener del sessionStorage (usado por ClientAuthContext)
  try {
    const savedClient = sessionStorage.getItem('clientAuth');
    if (savedClient) {
      const clientToken = JSON.parse(savedClient);

      // Convertir ClientToken a ClientData
      return {
        id: clientToken.id,
        clientName: clientToken.clientName,
        subdomain: clientToken.subdomain,
        weddingDate: new Date(clientToken.weddingDate),
        groomName: clientToken.groomName || 'Novio',
        brideName: clientToken.brideName || 'Novia',
        weddingLocation: clientToken.weddingLocation || 'Iglesia San José',
        weddingTime: clientToken.weddingTime || '6:00 PM',
        receptionTime: clientToken.receptionTime || undefined,
        bibleVerse: clientToken.bibleVerse || 'El amor es paciente, es bondadoso… el amor nunca deja de ser.',
        invitationText: clientToken.invitationText || 'Están cordialmente invitados a celebrar con nosotros este día tan especial.',
        backgroundAudioUrl: clientToken.backgroundAudioUrl || undefined,
        heroBackgroundUrl: clientToken.heroBackgroundUrl || '/boda.avif',
        heroBackgroundVideoUrl: clientToken.heroBackgroundVideoUrl || undefined,
        heroDisplayMode: clientToken.heroDisplayMode || 'image',
        heroVideoAudioEnabled: clientToken.heroVideoAudioEnabled || false,
        weddingType: clientToken.weddingType || undefined,
        religiousSymbol: clientToken.religiousSymbol || undefined,
        isActive: clientToken.isActive,
        createdAt: new Date(clientToken.createdAt),
        accessUntil: new Date(clientToken.accessUntil),
        expiresAt: new Date(clientToken.expiresAt || clientToken.accessUntil),
        planType: clientToken.planType || 'basic',
        features: clientToken.features || [],
        wedding_datetime_utc: clientToken.wedding_datetime_utc,
        timezone: clientToken.timezone
      };
    }
  } catch (error) {
  }

  return null;
}

// Función para personalizar datos del sitio según el cliente
export function customizeSiteData(clientData: ClientData) {
  return {
    // Datos para el Hero
    hero: {
      groomName: clientData.groomName,
      brideName: clientData.brideName,
      weddingDate: clientData.weddingDate,
      weddingTime: clientData.weddingTime,
      bibleVerse: clientData.bibleVerse,
      invitationText: clientData.invitationText
    },

    // Datos para la galería (se filtrarán por cliente)
    gallery: {
      bucketName: `gallery-${clientData.subdomain}`,
      clientId: clientData.id
    },

    // Datos para RSVP (se filtrarán por cliente)
    rsvp: {
      clientId: clientData.id,
      maxGuests: 100 // Según el plan
    },

    // Datos para mensajes (se filtrarán por cliente)
    messages: {
      clientId: clientData.id
    }
  };
}

import type { SupabaseClient } from '@supabase/supabase-js'

// Función para crear bucket de galería específico para cada cliente
export async function createClientGalleryBucket(supabase: SupabaseClient, clientId: string) {
  const bucketName = `gallery-${clientId}`;

  try {
    // Crear bucket si no existe
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (error && error.message !== 'Bucket already exists') {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Función para obtener imágenes de la galería del cliente
export async function getClientGalleryImages(supabase: SupabaseClient, clientId: string) {
  const bucketName = `gallery-${clientId}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// Función para subir imagen a la galería del cliente
export async function uploadClientGalleryImage(supabase: SupabaseClient, clientId: string, file: File) {
  const bucketName = `gallery-${clientId}`;
  const fileName = `${Date.now()}-${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { upsert: true, contentType: file.type });

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

// Función para eliminar imagen de la galería del cliente
export async function deleteClientGalleryImage(supabase: SupabaseClient, clientId: string, fileName: string) {
  const bucketName = `gallery-${clientId}`;

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Función para obtener RSVPs del cliente
export async function getClientRSVPs(supabase: SupabaseClient, clientId: string) {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// Función para obtener mensajes del cliente
export async function getClientMessages(supabase: SupabaseClient, clientId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// Función para crear RSVP del cliente
export async function createClientRSVP(
  supabase: SupabaseClient,
  clientId: string,
  rsvpData: { name: string; email: string; phone?: string; guests: number }
) {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .insert([{
        ...rsvpData,
        client_id: clientId
      }]);

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

// Función para crear mensaje del cliente
export async function createClientMessage(
  supabase: SupabaseClient,
  clientId: string,
  messageData: { name: string; message: string }
) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        ...messageData,
        client_id: clientId
      }]);

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}
