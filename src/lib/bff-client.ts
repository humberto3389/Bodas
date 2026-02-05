import type { ClientToken } from './auth-system';
import { mapSupabaseClientToToken } from './auth-system';

/**
 * Mapea los datos del cliente desde el formato del BFF al formato ClientToken
 */
export function mapClientDataFromBFF(clientData: any): ClientToken {
  return mapSupabaseClientToToken(clientData);
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
export async function fetchWeddingDataFromBFF(subdomain: string, refresh: boolean = false): Promise<BFFWeddingData> {
  const url = new URL(`${window.location.origin}/api/public/wedding-data`);
  url.searchParams.append('subdomain', subdomain);
  if (refresh) {
    url.searchParams.append('refresh', 'true');
    url.searchParams.append('t', Date.now().toString()); // Cache busting adicional
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error al cargar datos: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
