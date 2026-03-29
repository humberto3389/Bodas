import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { ClientAuthProvider } from './contexts/ClientAuthContext'
import { registerServiceWorker } from './lib/sw-register'
import { PWAInstallBanner } from './components/PWAInstallBanner'
import { PWAUpdateBanner } from './components/PWAUpdateBanner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClientAuthProvider>
      <RouterProvider router={router} />
      <PWAInstallBanner />
      <PWAUpdateBanner />
    </ClientAuthProvider>
  </StrictMode>,
)

// Register service worker (production only)
registerServiceWorker()
