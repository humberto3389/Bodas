// ============================================================
// Suspiro Nupcial — Service Worker (Stability-First)
// Version: 1.0.0
// Strategy: 2-cache (static + pages), never cache auth/APIs
// ============================================================

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `suspiro-static-${CACHE_VERSION}`;
const PAGES_CACHE = `suspiro-pages-${CACHE_VERSION}`;
const ALL_CACHES = [STATIC_CACHE, PAGES_CACHE];

// Max entries per cache (simple cap, no LRU)
const MAX_STATIC_ENTRIES = 100;
const MAX_PAGES_ENTRIES = 5;

// Precache on install (app shell + offline fallback)
const PRECACHE_URLS = [
  '/',
  '/offline.html',
];

// ---- NEVER CACHE LIST ----
// These patterns are NEVER stored in any cache
function shouldNeverCache(url) {
  const neverCachePatterns = [
    '/auth/',           // Supabase auth
    '/rest/',           // Supabase REST API (data)
    '/storage/',        // Supabase storage (user uploads)
    '/api/',            // Vercel serverless functions
    '/_vercel/',        // Vercel internals
    '/__vercel',        // Vercel internals
    'supabase.co/auth', // Supabase auth (full domain)
    'supabase.co/rest', // Supabase REST (full domain)
    'supabase.co/storage', // Supabase storage (full domain)
  ];

  return neverCachePatterns.some(pattern => url.includes(pattern));
}

// ---- CACHE CLASSIFICATION ----
function isStaticAsset(url) {
  const staticExtensions = [
    '.js', '.css', '.woff', '.woff2', '.ttf', '.otf',
    '.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.ico',
    '.mp3', '.ogg', '.mp4',
  ];
  const pathname = new URL(url).pathname;

  // Vite hashed assets
  if (pathname.startsWith('/assets/')) return true;

  // Google Fonts
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) return true;

  // Static files by extension
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// ---- INSTALL ----
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(PAGES_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => console.log('[SW] Precache complete'))
      .catch(err => console.warn('[SW] Precache failed (non-fatal):', err))
  );

  // Do NOT call skipWaiting() — let user decide when to update
});

// ---- ACTIVATE ----
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => !ALL_CACHES.includes(name))
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Only claim clients on first-ever activation (no existing controller)
      // This avoids disrupting already-open tabs when updating
      return self.clients.matchAll().then(clients => {
        if (clients.length === 0 || !self.registration.active) {
          return self.clients.claim();
        }
      });
    })
  );

  // Notify all clients that an update was applied
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
    });
  });
});

// ---- FETCH ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Never cache sensitive endpoints
  if (shouldNeverCache(url)) return;

  // Navigation requests: Network-first, cached shell fallback, then offline.html
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the successful HTML response
          if (response.ok) {
            const clone = response.clone();
            caches.open(PAGES_CACHE).then(cache => {
              trimCache(cache, MAX_PAGES_ENTRIES);
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: try cached page, then cached shell (/), then offline.html
          return caches.match(request)
            .then(cached => cached || caches.match('/'))
            .then(cached => cached || caches.match('/offline.html'))
            .then(cached => cached || new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            }));
        })
    );
    return;
  }

  // Static assets: Cache-first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;

        return fetch(request).then(response => {
          // Only cache successful, non-opaque responses
          if (!response.ok || response.type === 'opaque') return response;

          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => {
            trimCache(cache, MAX_STATIC_ENTRIES);
            cache.put(request, clone);
          });
          return response;
        }).catch(() => {
          // Static asset not available offline — return nothing (browser handles error)
          return new Response('', { status: 408 });
        });
      })
    );
    return;
  }

  // Everything else: network only (don't cache unknown requests)
});

// ---- MESSAGE HANDLER (for user-triggered skipWaiting) ----
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] User triggered skipWaiting');
    self.skipWaiting();
  }
});

// ---- UTILITY: Trim cache to max entries ----
function trimCache(cache, maxEntries) {
  cache.keys().then(keys => {
    if (keys.length >= maxEntries) {
      // Remove oldest entries (FIFO)
      const deleteCount = keys.length - maxEntries + 1;
      for (let i = 0; i < deleteCount; i++) {
        cache.delete(keys[i]);
      }
    }
  });
}
