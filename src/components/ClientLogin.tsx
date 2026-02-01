import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ClientToken } from '../lib/auth-system';

interface ClientLoginProps {
  onLogin: (client: ClientToken) => void;
}

export default function ClientLogin({ onLogin }: ClientLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'token' | 'email'>('token');

  // Detectar si estamos en un subdominio y autocompletar el usuario
  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (parts.length > 2) {
      // Quitar sufijo "-invitacion" cuando el hostname proviene de Vercel
      const subdomain = parts[0].replace('-invitacion', '');
      setUsername(subdomain);
      // Auto-completar email si es de una cuenta provisionada
      setEmail(`client-${subdomain}@invitacionbodas.com`);
    }
  }, []);

  const handleLoginWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Buscar el cliente en Supabase por subdomain y token
      const { data: clientData, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('subdomain', username.toLowerCase())
        .eq('token', password)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) {
        console.error('[ClientLogin] Error fetching client:', fetchError);
        setError('Error al verificar credenciales. Intenta nuevamente.');
        setIsLoading(false);
        return;
      }

      if (!clientData) {
        console.warn('[ClientLogin] Cliente no encontrado con esas credenciales');
        setError('Credenciales incorrectas. Verifica tu usuario y token.');
        setIsLoading(false);
        return;
      }

      console.log('[ClientLogin] Cliente encontrado en Supabase:', clientData.subdomain);

      // Verificar que el cliente no haya expirado
      const now = new Date();
      const accessUntil = new Date(clientData.access_until);
      if (now > accessUntil) {
        console.warn('[ClientLogin] Acceso expirado');
        setError('Tu acceso ha expirado. Contacta al administrador.');
        setIsLoading(false);
        return;
      }

      // Autenticar con Supabase Auth usando el email y token
      const clientEmail = clientData.email || `client-${clientData.subdomain}@invitacionbodas.com`;
      console.log('[ClientLogin] Intentando Auth con:', clientEmail);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: clientEmail,
        password: password
      });

      if (authError) {
        console.error('[ClientLogin] Auth error:', authError.message);
        setError('Error de autenticación: ' + authError.message);
        setIsLoading(false);
        return;
      }

      console.log('[ClientLogin] Auth exitoso');

      // Crear objeto ClientToken compatible
      const client: ClientToken = {
        id: clientData.id,
        clientName: clientData.client_name,
        subdomain: clientData.subdomain,
        token: clientData.token,
        isActive: clientData.is_active,
        createdAt: new Date(clientData.created_at),
        weddingDate: new Date(clientData.wedding_date),
        accessUntil: new Date(clientData.access_until),
        planType: clientData.plan_type,
        maxGuests: clientData.max_guests,
        expiresAt: new Date(clientData.expires_at || clientData.access_until),
        features: clientData.features || [],
        groomName: clientData.groom_name,
        brideName: clientData.bride_name,
        weddingLocation: clientData.wedding_location,
        weddingTime: clientData.wedding_time,
        bibleVerse: clientData.bible_verse,
        invitationText: clientData.invitation_text,
        backgroundAudioUrl: clientData.background_audio_url,
        heroBackgroundUrl: clientData.hero_background_url,
        heroBackgroundVideoUrl: clientData.hero_background_video_url,
        heroDisplayMode: clientData.hero_display_mode || 'image',
        heroVideoAudioEnabled: clientData.hero_video_audio_enabled || false,
        cinemaVideoAudioEnabled: clientData.cinema_video_audio_enabled || false,
        planStatus: clientData.plan_status,
        pendingPlan: clientData.pending_plan,
        pendingSince: clientData.pending_since ? new Date(clientData.pending_since) : undefined,
      };

      console.log('[ClientLogin] Llamando a onLogin...');
      onLogin(client);
    } catch (err) {
      console.error('[ClientLogin] Error inesperado:', err);
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Primero validar si Supabase Auth está disponible
      const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError?.message?.includes('Auth') || sessionError?.message?.includes('apikey')) {
        setError('El método de Email no está disponible. Por favor usa el método Token.');
        return;
      }

      // Intentar login con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        // Manejo mejorado de errores
        if (authError.message?.includes('No API key') || authError.message?.includes('apikey')) {
          setError('El método de Email no está disponible. Por favor usa el método Token.');
        } else if (authError.message?.includes('Invalid login') || authError.message?.includes('credentials')) {
          setError('Email o contraseña incorrectos');
        } else if (authError.status === 409) {
          setError('Conflicto de cuenta. Por favor intenta con el método Token.');
        } else {
          setError(`Error de autenticación: ${authError.message}`);
        }
        return;
      }

      if (!data.session) {
        setError('No se pudo crear la sesión');
        return;
      }

      // Extraer datos del usuario
      const user = data.session.user;
      const subdomain = user.user_metadata?.subdomain || email.split('@')[0].replace('client-', '');
      const clientId = user.user_metadata?.clientId;

      // Crear un token temporal para compatibilidad
      const clientToken: ClientToken = {
        id: clientId || user.id,
        clientName: user.user_metadata?.clientName || subdomain,
        subdomain,
        weddingDate: new Date(),
        groomName: '',
        brideName: '',
        weddingLocation: '',
        weddingTime: '',
        bibleVerse: '',
        invitationText: '',
        token: password,
        isActive: true,
        createdAt: new Date(),
        accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        planType: user.user_metadata?.plan || 'basic',
        maxGuests: 100,
        features: []
      };

      onLogin(clientToken);
    } catch (err: any) {
      // Manejo de excepciones
      const errMsg = err?.message || 'Error desconocido';
      if (errMsg.includes('API key') || errMsg.includes('apikey') || errMsg.includes('Auth')) {
        setError('El método de Email no está disponible. Por favor usa el método Token.');
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Acceso Cliente
          </h1>
          <p className="text-neutral-600">
            Ingresa tus credenciales para acceder a tu sitio de boda
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          {/* Selector de método de login */}
          <div className="flex gap-2 mb-6 bg-neutral-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMethod('token')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-300 ${loginMethod === 'token'
                ? 'bg-rose-500 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Token
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-300 ${loginMethod === 'email'
                ? 'bg-rose-500 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Email
            </button>
          </div>

          {/* Formulario con Token */}
          {loginMethod === 'token' && (
            <form onSubmit={handleLoginWithToken} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                  Usuario (Subdominio)
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="maria-juan"
                  className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/80 text-neutral-700 placeholder-neutral-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña (Token)
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu token de acceso"
                  className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/80 text-neutral-700 placeholder-neutral-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
                  required
                />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <p className="text-rose-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Iniciando sesión...' : 'Acceder'}
              </button>
            </form>
          )}

          {/* Formulario con Email */}
          {loginMethod === 'email' && (
            <form onSubmit={handleLoginWithEmail} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="client-maria-juan@invitacionbodas.com"
                  className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/80 text-neutral-700 placeholder-neutral-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label htmlFor="emailPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="emailPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/80 text-neutral-700 placeholder-neutral-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
                  required
                />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <p className="text-rose-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Iniciando sesión...' : 'Acceder'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-rose-600 hover:text-amber-600 font-medium transition-colors duration-300"
            >
              ¿Cómo acceder a mi sitio?
            </button>

            {showHelp && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-left">
                <h4 className="font-semibold text-rose-900 mb-2">Instrucciones de acceso:</h4>
                <div className="space-y-3 text-sm text-rose-800">
                  <div>
                    <p className="font-medium">Método 1: Token</p>
                    <ol className="list-decimal list-inside">
                      <li>Usuario: Tu subdominio (ej: maria-juan)</li>
                      <li>Contraseña: El token que te proporcionó el administrador</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium">Método 2: Email (después de provisionar)</p>
                    <ol className="list-decimal list-inside">
                      <li>Email: client-[subdomain]@invitacionbodas.com</li>
                      <li>Contraseña: El token (igual que en token)</li>
                    </ol>
                  </div>
                </div>
                <p className="text-xs text-rose-700 mt-2">
                  URL: https://[tu-subdominio].vercel.app
                </p>
              </div>
            )}

            <p className="text-sm text-neutral-500">
              ¿No tienes acceso? Contacta al administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
