import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load pages
const MasterAdmin = lazy(() => import('./pages/MasterAdmin'));
const MasterAdminLogin = lazy(() => import('./pages/MasterAdminLogin'));
const Admin = lazy(() => import('./pages/Admin'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ClientLoginPage = lazy(() => import('./pages/ClientLoginPage'));
const App = lazy(() => import('./App'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ClientLoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MasterAdminLogin />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MasterAdmin />
      </Suspense>
    ),
  },
  {
    path: '/client-admin',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Admin />
      </Suspense>
    ),
  },
  {
    path: '/panel',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    ),
  },
  {
    path: '/invitacion/:subdomain',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    ),
  },
]);
