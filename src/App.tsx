import './index.css';
import { useParams } from 'react-router-dom';
import { useClientAuth } from './contexts/ClientAuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { Countdown } from './components/Countdown';
import { useInvitation } from './hooks/useInvitation';
import { FloatingParticles } from './components/SharedParticles';
import { DeluxeEffects } from './components/DeluxeEffects';
import { useState, useEffect } from 'react';
import { AudioProvider } from './contexts/AudioContext';

// Secciones modularizadas
import { HeroSection } from './pages/invitation-sections/HeroSection';
import { VerseSection } from './pages/invitation-sections/VerseSection';
import { GallerySection } from './pages/invitation-sections/GallerySection';
import { LocationSection } from './pages/invitation-sections/LocationSection';
import { RSVPSection } from './pages/invitation-sections/RSVPSection';
import { GuestbookSection } from './pages/invitation-sections/GuestbookSection';
import { BackgroundMusic } from './pages/invitation-sections/BackgroundMusic';
import { VideoSection, InvitationFooter } from './pages/invitation-sections/InvitationSections';
import { PadrinosSection } from './pages/invitation-sections/PadrinosSection';

import type { ClientToken } from './lib/auth-system';

interface AppProps {
  clientData?: ClientToken;
}

export default function App({ clientData: propData }: AppProps) {
  const { subdomain } = useParams<{ subdomain: string }>();
  const { client: authClient } = useClientAuth();
  const { toasts, removeToast } = useToast();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const {
    client,
    loading,
    messages,
    submitRSVP,
    submitMessage,
    isExpired,
    planType
  } = useInvitation(subdomain, propData || authClient || undefined);

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
        <p className="font-elegant tracking-widest text-slate-400">Cargando invitación...</p>
      </div>
    );
  }

  // Configuración de Audio
  const bgAudioSrc = (planType === 'premium' || planType === 'deluxe') ? (client.backgroundAudioUrl || '/audio.mp3') : undefined;


  // Opciones visuales premium
  const hasPremiumVisuals = planType === 'deluxe' && client.advancedAnimations?.enabled;


  return (
    <AudioProvider>
      <div className={`relative min-h-screen selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden ${hasPremiumVisuals ? 'premium-visuals-active' : ''} transition-colors duration-500`}>
        {/* Deluxe Visual Animations */}
        {planType === 'deluxe' && (
          <DeluxeEffects
            config={client.advancedAnimations}
            eventDate={client.weddingDate}
          />
        )}

        {/* Partículas básicas para otros planes si se activan (fallback) */}
        {planType !== 'deluxe' && client.advancedAnimations?.enabled && (
          <FloatingParticles mobile={isMobile} />
        )}

        {/* Design System Overlays */}
        <div className="bg-noise opacity-[0.03] fixed inset-0 pointer-events-none" />

        <HeroSection clientData={client} />

        <main className="relative z-10 pb-20">
          {/* Versículo e Invitación (Todos los planes) */}
          <VerseSection clientData={client} />

          {/* Cuenta Regresiva (Premium+) */}
          {(planType === 'premium' || planType === 'deluxe') && (
            <section id="cuenta-regresiva" className="py-16 relative">
              <div className="max-w-7xl mx-auto px-4">
                <Countdown date={client.weddingDate} time={client.weddingTime} />
              </div>
            </section>
          )}

          <GallerySection clientData={client} />

          <VideoSection clientData={client} />

          {/* Padrinos (Premium+) */}
          {(planType === 'premium' || planType === 'deluxe') && client?.id && (
            <PadrinosSection clientId={client.id} />
          )}

          <LocationSection clientData={client} />

          <RSVPSection onSubmit={submitRSVP} />

          <GuestbookSection messages={messages} onSendMessage={submitMessage} />
        </main>

        <InvitationFooter clientData={client} />

        {/* Música de Fondo */}
        {bgAudioSrc && <BackgroundMusic src={bgAudioSrc} />}

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </AudioProvider>
  );
}
