import type { ClientToken } from './auth-system';
import { validateAndFormatTime } from './timezone-utils';

/**
 * Mapea los datos del cliente desde el formato del BFF al formato ClientToken
 */
export function mapClientDataFromBFF(clientData: any): ClientToken {
  return {
    id: clientData.id,
    clientName: clientData.client_name,
    subdomain: clientData.subdomain,
    token: clientData.token,
    isActive: clientData.is_active,
    createdAt: new Date(clientData.created_at),
    weddingDate: new Date(clientData.wedding_date),
    accessUntil: new Date(clientData.access_until),
    planType: clientData.plan_type,
    maxGuests: clientData.max_guests,
    expiresAt: new Date(clientData.expires_at || clientData.access_until),
    features: clientData.features || [],
    groomName: clientData.groom_name,
    brideName: clientData.bride_name,
    weddingLocation: clientData.wedding_location,
    weddingTime: validateAndFormatTime(clientData.wedding_time),
    receptionTime: validateAndFormatTime(clientData.reception_time),
    bibleVerse: clientData.bible_verse,
    bibleVerseBook: clientData.bible_verse_book,
    invitationText: clientData.invitation_text,
    backgroundAudioUrl: clientData.background_audio_url || undefined,
    heroBackgroundUrl: clientData.hero_background_url || undefined,
    heroBackgroundVideoUrl: clientData.hero_background_video_url || undefined,
    heroDisplayMode: clientData.hero_display_mode || 'image',
    heroVideoAudioEnabled: clientData.hero_video_audio_enabled || false,
    cinemaVideoAudioEnabled: clientData.cinema_video_audio_enabled || false,
    weddingType: clientData.wedding_type || undefined,
    advancedAnimations: clientData.advanced_animations || undefined,
    mapCoordinates: clientData.map_coordinates || { lat: -12.0932, lng: -77.0314 },
    ceremonyLocationName: clientData.ceremony_location_name || undefined,
    receptionLocationName: clientData.reception_location_name || undefined,
    churchName: clientData.church_name || undefined,
    ceremonyAddress: clientData.ceremony_address || undefined,
    ceremonyReference: clientData.ceremony_reference || undefined,
    ceremonyMapUrl: clientData.ceremony_map_url || undefined,
    receptionAddress: clientData.reception_address || undefined,
    receptionMapUrl: clientData.reception_map_url || undefined,
    receptionReference: clientData.reception_reference || undefined,
    isReceptionSameAsCeremony: clientData.is_reception_same_as_ceremony || false,
    wedding_datetime_utc: clientData.wedding_datetime_utc || undefined,
    timezone: clientData.timezone || undefined,
  };
}

/**
 * Interfaz para los datos devueltos por el BFF
 */
export interface BFFWeddingData {
  client: any;
  messages: any[];
  padrinos: any[];
  galleryImages: { name: string; url: string }[];
  videos: { name: string; url: string }[];
  _cachedAt: string;
}

/**
 * Obtiene los datos de la invitación desde el BFF
 */
export async function fetchWeddingDataFromBFF(subdomain: string): Promise<BFFWeddingData> {
  const response = await fetch(`/api/public/wedding-data?subdomain=${encodeURIComponent(subdomain)}`);
  
  if (!response.ok) {
    throw new Error(`Error al cargar datos: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}
