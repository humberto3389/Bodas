import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/LoadingSpinner'

// Función auxiliar para verificar si un usuario es master admin
// Verifica en app_metadata.role === 'master_admin' o correos autorizados
function isMasterAdmin(user: any): boolean {
  // Lista blanca de correos de administradores (mismos que en MasterAdmin.tsx)
  const adminEmails = ['mhuallpasullca@gmail.com'];

  if (user?.email && adminEmails.includes(user.email)) {
    return true;
  }

  return user?.app_metadata?.role === 'master_admin' || user?.user_metadata?.role === 'master_admin'
}

// Función para verificar si ya hay sesión activa
async function checkExistingSession(): Promise<any> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error checking session:', error)
    return null
  }
}

export default function MasterAdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  // Verificar si ya hay sesión activa al cargar
  useEffect(() => {
    const checkAuth = async () => {


      // Safety timeout: si en 10 segundos no ha terminado, forzamos la salida del estado de carga
      const safetyTimeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 10000);

      try {
        // Crear una promesa con timeout para getSession
        const sessionPromise = checkExistingSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_SESSION')), 5000));

        const session = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (session?.user) {
          const isMaster = isMasterAdmin(session.user);

          if (isMaster) {
            navigate('/admin')
            return
          } else {
            await supabase.auth.signOut();
            // Recargar para limpiar estado
            window.location.reload();
            return;
          }
        }
      } catch (error: any) {
      } finally {
        clearTimeout(safetyTimeout);
        setIsLoading(false);
      }
    }

    checkAuth()

    // Escuchar cambios de autenticación con protección
    let authSubscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            if (isMasterAdmin(session.user)) {
              navigate('/admin')
            }
          }
        }
      )
      authSubscription = data?.subscription;
    } catch (e) {
    }

    return () => {
      authSubscription?.unsubscribe?.();
    }
  }, [navigate])

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setAuthLoading(true)

    try {
      // Login: autenticarse con Supabase Auth

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        setLoginError(`❌ Error al iniciar sesión: ${signInError.message}`)
        setAuthLoading(false)
        return
      }

      if (authData.session?.user) {

        // Verificar que sea master admin
        if (!isMasterAdmin(authData.session.user)) {
          setLoginError(`❌ No tienes permisos de administrador maestro.\n\nTu rol actual: ${authData.session.user.app_metadata?.role ||
            authData.session.user.user_metadata?.role ||
            'sin definir'
            }\n\nContacta al administrador del sistema para obtener acceso.`)
          setAuthLoading(false)
          await supabase.auth.signOut()
          return
        }


        // El rol ya está en raw_app_meta_data desde que se creó el usuario admin
        // Solo necesitamos refrescar la sesión para asegurar que el JWT está actualizado
        await supabase.auth.refreshSession()

        // Guardar información en sessionStorage
        const fullNameValue = authData.session.user.user_metadata?.full_name ||
          email.split('@')[0] ||
          'Administrador'

        sessionStorage.setItem('adminAuthed', 'true')
        sessionStorage.setItem('adminEmail', email)
        sessionStorage.setItem('adminId', authData.session.user.id)
        sessionStorage.setItem('adminFullName', fullNameValue)

        // Redirigir al panel master admin
        navigate('/admin')
      }
    } catch (error: any) {
      setLoginError(`❌ Error inesperado: ${error.message || 'Error desconocido'}`)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 grid place-items-center px-6">
      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner size="lg" text="Verificando autenticación..." />
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Acceso Master Admin
              </h1>
              <p className="text-neutral-600">
                Ingresa tus credenciales para acceder al panel de administración global
              </p>
            </div>

            <form onSubmit={handleMasterLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-email@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/80 text-neutral-700 placeholder-neutral-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/80 text-neutral-700 placeholder-neutral-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-300/30 transition-all duration-300"
                  required
                  minLength={6}
                />
              </div>

              {loginError && (
                <div className={`px-4 py-3 rounded-xl text-sm whitespace-pre-line ${loginError.includes('✅') || loginError.includes('SQL Editor')
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Iniciando sesión...' : 'Ingresar al Panel Master Admin'}
              </button>

              <div className="text-center">
                <p className="text-xs text-neutral-500 mt-4">
                  🔒 Acceso exclusivo para administradores.
                  <br />
                  Para crear una nueva cuenta administrativa, contacta al soporte técnico o usa la consola de Supabase.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}







