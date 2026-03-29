/**
 * Service Worker Registration — Suspiro Nupcial
 * 
 * Registers the SW only in production.
 * Handles update detection and exposes user-controlled update mechanism.
 */

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker and set up update detection.
 * Call this once from main.tsx.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Register] Service workers not supported');
    return;
  }

  // Only register in production (Vite injects this at build time)
  if (!import.meta.env.PROD) {
    console.log('[SW Register] Skipping SW registration in development');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      swRegistration = registration;
      console.log('[SW Register] Registered successfully, scope:', registration.scope);

      // Check for updates every 60 minutes
      setInterval(() => {
        registration.update().catch(() => {
          // Silent fail — next visit will check again
        });
      }, 60 * 60 * 1000);

      // Detect waiting SW (update available)
      if (registration.waiting) {
        notifyUpdateAvailable();
      }

      // Listen for new SW installing
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          // New SW is installed and waiting
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            notifyUpdateAvailable();
          }
        });
      });

      // When new SW takes over, reload the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (error) {
      console.warn('[SW Register] Registration failed (non-fatal):', error);
    }
  });
}

/**
 * Dispatch a custom event so React components can show the update banner.
 */
function notifyUpdateAvailable(): void {
  console.log('[SW Register] Update available — notifying app');
  window.dispatchEvent(new CustomEvent('sw-update-available'));
}

/**
 * Call this when user clicks "Update" in the PWAUpdateBanner.
 * Sends SKIP_WAITING message to the waiting SW.
 */
export function applyUpdate(): void {
  if (!swRegistration?.waiting) {
    console.log('[SW Register] No waiting SW to activate');
    return;
  }

  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Manually check for SW updates.
 */
export function checkForUpdates(): void {
  swRegistration?.update().catch(() => {
    // Silent fail
  });
}
