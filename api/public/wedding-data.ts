import { createClient } from '@supabase/supabase-js';

// Tipos simplificados para el handler de Vercel
interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
}

// --- CONFIGURACIÓN DE CACHÉ ---
interface CachedData {
  client: any;
  messages: any[];
  padrinos: any[];
  galleryImages: { name: string; url: string }[];
  videos: { name: string; url: string }[];
  _cachedAt: string;
}

let cachedData: Record<string, CachedData> = {};
let cacheExpiry: Record<string, number> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 MINUTOS de vida de caché

// --- CLIENTE DE SUPABASE (SEGÚN VARIABLES DE ENTORNO) ---
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// --- FUNCIÓN PARA OBTENER DATOS (CON CACHÉ) ---
async function getPublicPageData(subdomain: string): Promise<CachedData> {
  const now = Date.now();
  const cacheKey = subdomain;

  // 1. VERIFICAR SI LA CACHÉ ES VÁLIDA
  if (cachedData[cacheKey] && cacheExpiry[cacheKey] && now < cacheExpiry[cacheKey]) {
    console.log(`[BFF] Sirviendo datos desde caché para ${subdomain}.`);
    return cachedData[cacheKey];
  }

  console.log(`[BFF] Caché expirada para ${subdomain}, consultando Supabase...`);

  try {
    // 2. CONSULTAS PARALELIZADAS Y OPTIMIZADAS
    // Consulta 1: Datos del cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .maybeSingle();

    if (clientError || !clientData) {
      throw new Error(`Cliente no encontrado: ${clientError?.message || 'No existe'}`);
    }

    const clientId = clientData.id;

    // Consulta 2: Mensajes (¡CON LÍMITE ESTRICTO!)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, name, message, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(30); // LÍMITE CRÍTICO PARA CONTROLAR EL TAMAÑO

    if (messagesError) {
      console.error('[BFF] Error cargando mensajes:', messagesError);
    }

    // Consulta 3: Padrinos activos
    const { data: padrinos, error: padrinosError } = await supabase
      .from('padrinos')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (padrinosError) {
      console.error('[BFF] Error cargando padrinos:', padrinosError);
    }

    // Consulta 4: Imágenes de galería (storage)
    let galleryImages: { name: string; url: string }[] = [];
    try {
      const { data: galleryData, error: galleryError } = await supabase.storage
        .from('gallery')
        .list(`${clientId}/hero`, { limit: 50, sortBy: { column: 'created_at', order: 'asc' } });

      if (!galleryError && galleryData) {
        const paths = galleryData
          .filter(f => !f.name.startsWith('.'))
          .filter(f => !f.name.toLowerCase().includes('padrino'))
          .map(f => `${clientId}/hero/${f.name}`);

        galleryImages = paths.map((path) => {
          const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
          return { name: path, url: urlData.publicUrl };
        });
      }
    } catch (galleryErr) {
      console.error('[BFF] Error cargando galería:', galleryErr);
    }

    // Consulta 5: Videos (storage)
    let videos: { name: string; url: string }[] = [];
    try {
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .list(`${clientId}/video`, { limit: 10, sortBy: { column: 'created_at', order: 'asc' } });

      if (!videoError && videoData) {
        const videoItems = videoData
          .filter(f => !f.name.startsWith('.') && ['mp4', 'webm', 'mov'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
          .map(f => {
            const { data: urlData } = supabase.storage.from('videos').getPublicUrl(`${clientId}/video/${f.name}`);
            return { name: f.name, url: urlData.publicUrl };
          });
        videos = videoItems;
      }
    } catch (videoErr) {
      console.error('[BFF] Error cargando videos:', videoErr);
    }

    // 3. ESTRUCTURAR Y GUARDAR EN CACHÉ
    const result: CachedData = {
      client: clientData,
      messages: messages || [],
      padrinos: padrinos || [],
      galleryImages,
      videos,
      _cachedAt: new Date().toISOString()
    };

    cachedData[cacheKey] = result;
    cacheExpiry[cacheKey] = now + CACHE_TTL_MS;

    return result;

  } catch (error: any) {
    console.error('[BFF] Error grave consultando Supabase:', error);
    // Si hay caché expirada, servirla como fallback
    if (cachedData[cacheKey]) {
      console.log('[BFF] Sirviendo caché expirada como fallback.');
      return cachedData[cacheKey];
    }
    throw new Error(`No se pudieron obtener los datos: ${error.message}`);
  }
}

// --- MANEJADOR DE LA API ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir GET
  if (req.method && req.method !== 'GET') {
    res.status(405);
    res.json({ error: 'Método no permitido' });
    return;
  }

  // Obtener subdomain de query params
  const subdomain = req.query?.subdomain as string | undefined;

  if (!subdomain) {
    res.status(400);
    res.json({ error: 'Subdomain es requerido' });
    return;
  }

  // Configurar cabeceras de caché HTTP para el cliente y la CDN de Vercel
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');

  try {
    const data = await getPublicPageData(subdomain);
    res.status(200);
    res.json(data);
  } catch (error: any) {
    console.error('[BFF] Error en handler:', error);
    res.status(503);
    res.json({
      error: 'Servicio temporalmente no disponible',
      detail: error.message
    });
  }
}
