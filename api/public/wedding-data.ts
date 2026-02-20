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

// ❌ ELIMINAR: Cache en memoria global causa problemas con Vercel serverless
// const cachedData: Record<string, CachedData> = {};
// const cacheExpiry: Record<string, number> = {};
// const CACHE_TTL_MS = 15 * 1000; // 15 SEGUNDOS de vida de caché (antes 5 min)

// --- FUNCIÓN PARA OBTENER CLIENTE DE SUPABASE ---
function getSupabaseClient() {
  // ✅ CORRECTO para funciones serverless (API Routes) - usar process.env
  // Intentar primero sin prefijo VITE_ (para funciones serverless)
  // Luego con prefijo VITE_ (fallback para compatibilidad)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  // Logs de debug para verificar variables de entorno
  console.log('[BFF Debug] SUPABASE_URL:', supabaseUrl ? 'Definida' : 'UNDEFINED');
  console.log('[BFF Debug] SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definida' : 'UNDEFINED');
  console.log('[BFF Debug] Variables disponibles:', {
    'SUPABASE_URL': !!process.env.SUPABASE_URL,
    'VITE_SUPABASE_URL': !!process.env.VITE_SUPABASE_URL,
    'SUPABASE_ANON_KEY': !!process.env.SUPABASE_ANON_KEY,
    'VITE_SUPABASE_ANON_KEY': !!process.env.VITE_SUPABASE_ANON_KEY
  });

  // Validación explícita antes de crear el cliente
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Las variables de entorno de Supabase no están configuradas en el servidor. ' +
      `SUPABASE_URL: ${supabaseUrl ? 'OK' : 'FALTA'}, ` +
      `SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'OK' : 'FALTA'}. ` +
      `IMPORTANTE: En Vercel, las funciones serverless necesitan las variables SIN el prefijo VITE_. ` +
      `Configura SUPABASE_URL y SUPABASE_ANON_KEY en Vercel Dashboard → Settings → Environment Variables.`;
    console.error('[BFF Error]', errorMsg);
    throw new Error(errorMsg);
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// --- FUNCIÓN PARA OBTENER DATOS (SIN CACHÉ EN MEMORIA) ---
async function getPublicPageData(subdomain: string, bypassCache: boolean = false): Promise<CachedData> {
  // ✅ SIMPLIFICADO: No usar caché en memoria
  // El caché HTTP de Vercel es suficiente y evita problemas de estado compartido

  console.log(`[BFF] Consultando Supabase para subdomain: ${subdomain}...`);

  try {
    // Obtener cliente de Supabase (con validación de variables de entorno)
    const supabase = getSupabaseClient();

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

    // 3. ESTRUCTURAR RESULTADO
    const result: CachedData = {
      client: clientData,
      messages: messages || [],
      padrinos: padrinos || [],
      galleryImages,
      videos,
      _cachedAt: new Date().toISOString()
    };

    // ✅ NO guardar en caché en memoria
    // El caché HTTP de Vercel maneja todo
    return result;

  } catch (error: any) {
    console.error('[BFF] Error grave consultando Supabase:', error);
    // Si hay error, retornar error (no servir caché vieja)
    throw error;
  }
}

// --- MANEJADOR DE LA API ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log inicial para verificar variables de entorno al inicio del handler
  console.log('[BFF Handler] Iniciando handler. Variables disponibles:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Definida' : 'UNDEFINED',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Definida' : 'UNDEFINED'
  });

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
  if (req.query?.refresh === 'true') {
    // Si es un refresh explícito, no cachear nada para asegurar datos frescos
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  } else {
    // s-maxage=1: Vercel mantiene la caché solo 1 segundo para cambios rápidos
    // stale-while-revalidate=59: Sirve versión vieja mientras actualiza nueva por casi 1 min (optimización)
    res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=59');
  }

  try {
    const bypassCache = req.query?.refresh === 'true';
    const data = await getPublicPageData(subdomain, bypassCache);
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
