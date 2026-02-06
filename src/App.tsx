import './index.css';
import { useParams } from 'react-router-dom';
import { useClientAuth } from './contexts/ClientAuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { useInvitation } from './hooks/useInvitation';
import { useState, useEffect, Suspense, lazy } from 'react';
import { AudioProvider } from './contexts/AudioContext';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Componentes críticos para el render inicial (cargados inmediatamente)
import { HeroSection } from './pages/invitation-sections/HeroSection';
import { VerseSection } from './pages/invitation-sections/VerseSection';

// Componentes lazy-loaded (cargados bajo demanda)
const Countdown = lazy(() => import('./components/Countdown').then(m => ({ default: m.Countdown })));
const FloatingParticles = lazy(() => import('./components/SharedParticles').then(m => ({ default: m.FloatingParticles })));
const DeluxeEffects = lazy(() => import('./components/DeluxeEffects').then(m => ({ default: m.DeluxeEffects })));
const GallerySection = lazy(() => import('./pages/invitation-sections/GallerySection').then(m => ({ default: m.GallerySection })));
const LocationSection = lazy(() => import('./pages/invitation-sections/LocationSection').then(m => ({ default: m.LocationSection })));
const RSVPSection = lazy(() => import('./pages/invitation-sections/RSVPSection').then(m => ({ default: m.RSVPSection })));
const GuestbookSection = lazy(() => import('./pages/invitation-sections/GuestbookSection').then(m => ({ default: m.GuestbookSection })));
const BackgroundMusic = lazy(() => import('./pages/invitation-sections/BackgroundMusic').then(m => ({ default: m.BackgroundMusic })));
const VideoSection = lazy(() => import('./pages/invitation-sections/InvitationSections').then(m => ({ default: m.VideoSection })));
const InvitationFooter = lazy(() => import('./pages/invitation-sections/InvitationSections').then(m => ({ default: m.InvitationFooter })));
const PadrinosSection = lazy(() => import('./pages/invitation-sections/PadrinosSection').then(m => ({ default: m.PadrinosSection })));

import type { ClientToken } from './lib/auth-system';

interface AppProps {
  clientData?: ClientToken;
}

export default function App({ clientData: propData }: AppProps) {
  const { subdomain } = useParams<{ subdomain: string }>();
  // ✅ CRÍTICO: Si hay subdomain en la URL, es página pública y NO debe usar ClientAuthContext
  // El subdomain de la URL es la única fuente de verdad para páginas de invitación
  // Solo usar ClientAuthContext si NO hay subdomain (área de admin en /panel)
  const { client: authClient } = useClientAuth();
  const { toasts, removeToast } = useToast();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Detectar si venimos desde el panel de administración para forzar el refresco de datos
  const searchParams = new URLSearchParams(window.location.search);
  const shouldRefresh = searchParams.get('admin') === 'true' || searchParams.get('refresh') === 'true';

  // ✅ CRÍTICO: Si hay subdomain en la URL, NO usar authClient del contexto
  // Esto previene que se muestre el perfil de otro usuario al recargar la página
  // El subdomain de la URL es la única fuente de verdad para páginas de invitación
  const initialData = subdomain ? undefined : (propData || authClient || undefined);

  const {
    client,
    loading,
    messages,
    submitRSVP,
    submitMessage,
    isExpired,
    planType,
    galleryImages,
    videos,
    padrinos
  } = useInvitation(subdomain, initialData, shouldRefresh);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center border border-slate-100">
          <div className="text-6xl mb-6">⌛</div>
          <h1 className="font-elegant text-3xl text-slate-800 mb-4 tracking-widest uppercase">Invitación Expirada</h1>
          <p className="text-slate-500 mb-8 leading-relaxed font-light">
            Esta invitación ha completado su tiempo de validez. Contacta a los anfitriones si crees que esto es un error.
          </p>
          <div className="h-1 w-20 bg-amber-200 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center border border-slate-100">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="font-elegant text-3xl text-slate-800 mb-4 tracking-widest uppercase">Error al Cargar Invitación</h1>
          <p className="text-slate-500 mb-8 leading-relaxed font-light">
            No se pudieron cargar los datos de la invitación. Por favor, intenta recargar la página o contacta a los anfitriones.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-rose-400 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  // Configuración de Audio
  const bgAudioSrc = (planType === 'premium' || planType === 'deluxe') ? (client.backgroundAudioUrl || '/audio.ogg') : undefined;


  // Opciones visuales premium
  const hasPremiumVisuals = planType === 'deluxe' && client.advancedAnimations?.enabled;


  return (
    <AudioProvider>
      <div className={`relative min-h-screen bg-white selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden ${hasPremiumVisuals ? 'premium-visuals-active' : ''} transition-colors duration-500`}>
        {/* Deluxe Visual Animations - Properly layered behind content */}
        {planType === 'deluxe' && (
          <div className="fixed inset-0 z-[1] pointer-events-none">
            <Suspense fallback={null}>
              <DeluxeEffects
                config={client.advancedAnimations}
                eventDate={client.weddingDate}
              />
            </Suspense>
          </div>
        )}

        {/* Partículas básicas para otros planes si se activan (fallback) - Lazy loaded */}
        {planType !== 'deluxe' && client.advancedAnimations?.enabled && (
          <div className="fixed inset-0 z-[1] pointer-events-none">
            <Suspense fallback={null}>
              <FloatingParticles mobile={isMobile} />
            </Suspense>
          </div>
        )}

        {/* Design System Overlays */}
        <div className="bg-noise opacity-[0.03] fixed inset-0 pointer-events-none z-[2]" />

        <HeroSection clientData={client} />

        <main className="relative z-10 pb-10">
          {/* Versículo e Invitación (Todos los planes) */}
          <VerseSection clientData={client} />

          {/* Cuenta Regresiva (Premium+) - Lazy loaded */}
          {(planType === 'premium' || planType === 'deluxe') && (
            <section id="cuenta-regresiva" className="py-6 relative">
              <div className="max-w-7xl mx-auto px-4">
                <Suspense fallback={<div className="h-32" />}>
                  <Countdown date={client.weddingDate} time={client.weddingTime} clientData={client} />
                </Suspense>
              </div>
            </section>
          )}

          <Suspense fallback={<div className="h-[550px]" />}>
            <GallerySection clientData={client} images={galleryImages} />
          </Suspense>

          <Suspense fallback={null}>
            <VideoSection clientData={client} videos={videos} />
          </Suspense>

          {/* Padrinos (Premium+) - Lazy loaded */}
          {(planType === 'premium' || planType === 'deluxe') && client?.id && (
            <Suspense fallback={null}>
              <PadrinosSection clientId={client.id} padrinos={padrinos} />
            </Suspense>
          )}

          <Suspense fallback={<div className="h-96" />}>
            <LocationSection clientData={client} />
          </Suspense>

          <Suspense fallback={<div className="h-96" />}>
            <RSVPSection onSubmit={submitRSVP} />
          </Suspense>

          <Suspense fallback={<div className="h-96" />}>
            <GuestbookSection messages={messages} onSendMessage={submitMessage} />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <InvitationFooter clientData={client} />
        </Suspense>

        {/* Música de Fondo - Lazy loaded */}
        {bgAudioSrc && (
          <Suspense fallback={null}>
            <BackgroundMusic src={bgAudioSrc} />
          </Suspense>
        )}

        <ToastContainer toasts={toasts} onClose={removeToast} />
        <SpeedInsights />
      </div>
    </AudioProvider>
  );
}
