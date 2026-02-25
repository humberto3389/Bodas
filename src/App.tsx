import './index.css';
import { useParams } from 'react-router-dom';
import { useClientAuth } from './contexts/ClientAuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useToast } from './hooks/useToast';
import { useInvitation } from './hooks/useInvitation';
import { useState, useEffect, Suspense, lazy } from 'react';
import { AudioProvider } from './contexts/AudioContext';

// Componentes críticos para el render inicial (cargados inmediatamente)
import { HeroSection } from './pages/invitation-sections/HeroSection';
import { VerseSection } from './pages/invitation-sections/VerseSection';
import { UrgentAlert } from './components/UrgentAlert';

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

// Premium Effects
import { ScrollProgress } from './components/ScrollProgress';
import { SmoothReveal } from './components/SmoothReveal';
import { MobileAppChrome } from './components/MobileAppChrome';

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
      <div className={`relative min-h-screen bg-transparent ${hasPremiumVisuals ? 'premium-visuals-active' : ''}`}>
        {/* 📊 Scroll Progress Bar - Premium */}
        <ScrollProgress />

        {/* 📢 Sistema de Alertas Urgentes */}
        <UrgentAlert client={client} />

        {/* Dynamic App Chrome (Meta/Theme Color) */}
        <MobileAppChrome />

        {/* Deluxe Visual Animations */}
        {planType === 'deluxe' && (
          <>
            <div className="fixed inset-0 z-[0] pointer-events-none">
              <Suspense fallback={null}>
                <DeluxeEffects
                  config={client.advancedAnimations}
                  eventDate={client.weddingDate}
                  layer="background"
                />
              </Suspense>
            </div>
            <div className="fixed inset-0 z-[50] pointer-events-none">
              <Suspense fallback={null}>
                <DeluxeEffects
                  config={client.advancedAnimations}
                  eventDate={client.weddingDate}
                  layer="foreground"
                />
              </Suspense>
            </div>
          </>
        )}

        {/* Partículas básicas */}
        {planType !== 'deluxe' && client.advancedAnimations?.enabled && (
          <div className="fixed inset-0 z-[1] pointer-events-none">
            <Suspense fallback={null}>
              <FloatingParticles mobile={isMobile} />
            </Suspense>
          </div>
        )}

        {/* Design System Overlays */}
        <div className="bg-noise opacity-[0.03] fixed inset-0 pointer-events-none z-[2]" />

        {/* CONTINUOUS CONTENT */}
        <HeroSection clientData={client} />

        <main className="relative z-10 box-border">
          {/* Versículo e Invitación */}
          <section id="verse">
            <SmoothReveal delay={0.2}>
              <VerseSection clientData={client} />
            </SmoothReveal>
          </section>

          {/* Cuenta Regresiva */}
          {(planType === 'premium' || planType === 'deluxe') && (
            <section id="countdown">
              <div className="max-w-7xl mx-auto px-4">
                <Suspense fallback={<div className="h-32" />}>
                  <Countdown date={client.weddingDate} time={client.weddingTime} clientData={client} />
                </Suspense>
              </div>
            </section>
          )}

          {/* Galería */}
          <section id="gallery">
            <Suspense fallback={<div className="h-96" />}>
              <SmoothReveal delay={0.3}>
                <GallerySection clientData={client} images={galleryImages.map(img => img.url)} />
              </SmoothReveal>
            </Suspense>
          </section>

          {/* Video */}
          {videos && videos.length > 0 && (
            <section id="video">
              <Suspense fallback={<div className="h-96" />}>
                <VideoSection clientData={client} videos={videos} />
              </Suspense>
            </section>
          )}

          {/* Padrinos */}
          {(planType === 'premium' || planType === 'deluxe') && client?.id && padrinos && padrinos.length > 0 && (
            <section id="padrinos">
              <Suspense fallback={<div className="h-96" />}>
                <PadrinosSection padrinos={padrinos} />
              </Suspense>
            </section>
          )}

          {/* Ubicación */}
          <section id="location">
            <Suspense fallback={<div className="h-96" />}>
              <SmoothReveal delay={0.4}>
                <LocationSection clientData={client} />
              </SmoothReveal>
            </Suspense>
          </section>

          {/* RSVP */}
          <section id="rsvp">
            <Suspense fallback={<div className="h-96" />}>
              <RSVPSection onSubmit={submitRSVP} />
            </Suspense>
          </section>

          {/* Guestbook */}
          <section id="guestbook">
            <Suspense fallback={<div className="h-96" />}>
              <GuestbookSection messages={messages} onSendMessage={submitMessage} />
            </Suspense>
          </section>

          {/* Footer */}
          <Suspense fallback={null}>
            <InvitationFooter clientData={client} />
          </Suspense>
        </main>

        {/* Música de Fondo */}
        {bgAudioSrc && (
          <Suspense fallback={null}>
            <BackgroundMusic src={bgAudioSrc} />
          </Suspense>
        )}

      </div>
    </AudioProvider>
  );
}
