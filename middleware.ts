/**
 * Middleware para Vercel (Edge Runtime)
 * 
 * PROPÓSITO:
 * Asegurar que los archivos críticos de la PWA sean accesibles públicamente
 * sin autenticación, evitando errores 401/403 que bloquean la instalación.
 */
export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Lista de rutas públicas que NUNCA deben requerir autenticación
  const publicPaths = [
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/favicon.ico',
    '/sw.js',
    '/offline.html',
    '/robots.txt',
    '/sitemap.xml'
  ];

  // 1. Permitir archivos críticos de PWA
  if (publicPaths.some(path => pathname === path)) {
    return; // En Vercel Middleware, no retornar nada (o undefined) permite que la petición continúe
  }

  // 2. Permitir assets (JS, CSS, Imágenes, Fuentes)
  if (pathname.startsWith('/assets/')) {
    return;
  }

  // 3. Continuar con la ejecución normal para el resto de rutas
  // (Si hay lógica de auth adicional en el proyecto, se aplicará después)
  return;
}

/**
 * Configuración del matcher para optimizar el rendimiento.
 * Solo intercepta las rutas que nos interesan.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
