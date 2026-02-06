import { createClient } from '@supabase/supabase-js'

const normalize = (value: unknown): string | undefined => {
  const str = typeof value === 'string' ? value.trim() : undefined
  if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null') return undefined
  return str
}

const supabaseUrl = normalize(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = normalize(import.meta.env.VITE_SUPABASE_ANON_KEY)

/**
 * Crea un cliente de Supabase de forma segura. Si las variables de entorno no están
 * configuradas, expone una implementación mínima que responde con errores controlados
 * para evitar que la app se rompa en producción.
 */
function createSafeSupabase() {
  if (supabaseUrl && supabaseAnonKey) {
    /**
     * ✅ CRÍTICO (multi-pestaña / multi-tenant):
     * Supabase Auth persiste la sesión en localStorage por defecto, lo cual se comparte
     * entre pestañas del mismo origen. Eso hace que si inicias sesión como Cliente A en
     * una pestaña y Cliente B en otra, la última sesión pisa a la anterior y al recargar
     * ambas pestañas terminan "unificadas" (mismo JWT / mismo usuario).
     *
     * Solución: persistir Auth en sessionStorage (aislado por pestaña).
     */
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: window.sessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }

  // ⚠️ CRÍTICO: Variables de entorno no configuradas
  console.error('[Supabase] ⚠️ ERROR CRÍTICO: Variables de entorno no configuradas!');
  console.error('[Supabase] VITE_SUPABASE_URL:', supabaseUrl ? '✅ OK' : '❌ FALTA');
  console.error('[Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ OK' : '❌ FALTA');
  console.error('[Supabase] Verifica que tu archivo .env.local tenga:');
  console.error('[Supabase]   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.error('[Supabase]   VITE_SUPABASE_ANON_KEY=tu-clave-anon');
  console.error('[Supabase] IMPORTANTE: Las variables deben tener el prefijo VITE_ para funcionar en Vite.');

  // Implementación mínima que devuelve errores en lugar de lanzar excepciones de inicialización
  type ErrorResponse = { data: null; error: { message: string } }
  const errorResponse = (message: string = 'Supabase no está configurado.'): ErrorResponse => ({ data: null, error: { message } })

  // Muy pequeño shim de las APIs usadas en el proyecto
  const shim = {
    from: () => {
      // thenable terminal para que "await ..." funcione en el final de la cadena
      const terminalThenable = {
        then: (resolve: (v: unknown) => void) => resolve(errorResponse('Supabase no está configurado. Verifica las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'))
      }

      // Builder que soporta encadenamiento de métodos: .eq(), .order(), .maybeSingle(), etc.
      const createQueryBuilder = () => {
        const builder = {
          eq: () => builder,
          neq: () => builder,
          gt: () => builder,
          gte: () => builder,
          lt: () => builder,
          lte: () => builder,
          like: () => builder,
          ilike: () => builder,
          is: () => builder,
          in: () => builder,
          contains: () => builder,
          order: () => builder,
          limit: () => builder,
          range: () => builder,
          single: () => terminalThenable,
          maybeSingle: () => terminalThenable,
          // Permitir múltiples llamadas encadenadas
        }
        return builder
      }

      return {
        insert: () => terminalThenable,
        update: () => createQueryBuilder(),
        delete: () => createQueryBuilder(),
        upsert: () => terminalThenable,
        select: () => createQueryBuilder()
      }
    },
    storage: {
      from: () => ({
        list: () => ({ then: (resolve: (v: unknown) => void) => resolve(errorResponse()) }),
        upload: () => ({ then: (resolve: (v: unknown) => void) => resolve(errorResponse()) }),
        createSignedUrl: () => ({ then: (resolve: (v: unknown) => void) => resolve(errorResponse()) })
      })
    },
    auth: {
      signInWithPassword: async () => errorResponse('Auth no está configurado'),
      signOut: async () => ({ error: null }), // Retornar éxito silencioso si no está configurado
      getUser: async () => errorResponse('Auth no está configurado'),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      updateUser: async () => errorResponse('Auth no está configurado'),
      refreshSession: async () => ({ data: { session: null }, error: null })
    },
    functions: {
      invoke: async () => errorResponse('Functions no está configurado')
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({}) })
    }),
    removeChannel: () => { }
  }

  return shim as unknown as ReturnType<typeof createClient>
}

export const supabase = createSafeSupabase()
