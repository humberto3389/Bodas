// Configuración del sistema de alquiler
export const SYSTEM_CONFIG = {
  // Dominio principal donde está desplegado el sistema
  MAIN_DOMAIN: import.meta.env.VITE_MAIN_DOMAIN || window.location.hostname,

  // Configuración de planes
  PLANS: {
    basic: {
      name: 'Básico',
      duration: 30, // días
      maxGuests: 50,
      price: 100,
      features: ['Sitio web personalizado', 'Galería de fotos (30)', '1 Video (2 min)', 'RSVP (50)', 'Mensajes (50)', 'Padrinos']
    },
    premium: {
      name: 'Premium',
      duration: 60, // días
      maxGuests: 200,
      price: 200,
      features: ['Sitio web personalizado', 'Galería de fotos (80)', '3 Videos (5 min)', 'RSVP (200)', 'Mensajes (200)', 'Countdown', 'Música de fondo', 'Padrinos']
    },
    deluxe: {
      name: 'Deluxe',
      duration: 90, // días
      maxGuests: 999999, // Ilimitado visualmente
      price: 300,
      features: ['Invitados ILIMITADOS', 'Fotos ilimitadas', 'Videos ilimitados (10 min c/u)', 'RSVP Ilimitado', 'Mensajes Ilimitados', 'Animaciones avanzadas', 'Video de fondo', 'Padrinos']
    }
  },

  // Configuración de autenticación
  AUTH: {
    MASTER_ADMIN_PASSWORD: import.meta.env.VITE_MASTER_ADMIN_PASS || 'admin123',
    ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASS || 'admin456',
    // Código de invitación secreto para crear nuevos master admins
    // Solo quien conozca este código puede registrarse como master admin
    // IMPORTANTE: Cambia este código por uno seguro y guárdalo en .env como VITE_MASTER_ADMIN_INVITE_CODE
    MASTER_ADMIN_INVITE_CODE: import.meta.env.VITE_MASTER_ADMIN_INVITE_CODE || 'CHANGE_THIS_SECRET_CODE_12345'
  },

  // Configuración de la base de datos
  DATABASE: {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
};

// Función para generar URL completa del cliente
export function getClientUrl(subdomain: string): string {
  if (!subdomain) return '#';

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isVercel = window.location.hostname.includes('vercel.app');

  // Forzamos el uso de la ruta de subdirectorio para Vercel y Local
  // Esto evita el problema de los subdominios no registrados en Vercel
  if (isLocal || isVercel) {
    // Usamos origin para asegurarnos de que el protocolo (http/https) y el dominio sean correctos
    return `${window.location.origin}/invitacion/${subdomain}`;
  }

  // Si hay un dominio personalizado configurado, intentamos usar subdominios
  const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'vercel.app';
  return `https://${subdomain}.${mainDomain}`;
}

// Función para verificar si estamos en el dominio principal
export function isMainDomain(): boolean {
  const hostname = window.location.hostname;
  const isVercelSubdomain = hostname.endsWith('.vercel.app') && !hostname.includes('-invitacion');

  return hostname === SYSTEM_CONFIG.MAIN_DOMAIN ||
    hostname === `www.${SYSTEM_CONFIG.MAIN_DOMAIN}` ||
    isVercelSubdomain ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1';
}

// Función para obtener el subdominio actual (desde el hostname)
export function getCurrentSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Si estamos en local o es un dominio de Vercel estándar, no hay subdominio de cliente en el hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.vercel.app')) {
    return null;
  }

  // Para dominios personalizados: cliente.bodas.com -> cliente
  const parts = hostname.split('.');
  if (parts.length <= 2) {
    return null; // Es el dominio raíz
  }

  return parts[0];
}
