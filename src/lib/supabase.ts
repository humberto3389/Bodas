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
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  // Aviso en consola para facilitar diagnóstico en producción

  // Implementación mínima que devuelve errores en lugar de lanzar excepciones de inicialización
  type ErrorResponse = { data: null; error: { message: string } }
  const errorResponse = (message: string = 'Supabase no está configurado.'): ErrorResponse => ({ data: null, error: { message } })

  // Muy pequeño shim de las APIs usadas en el proyecto
  const shim = {
    from: () => {
      // thenable terminal para que "await ..." funcione en el final de la cadena
      const terminalThenable = {
        then: (resolve: (v: unknown) => void) => resolve(errorResponse())
      }

      // builder intermedio que soporta .order(...) y termina en thenable
      const selectBuilder = {
        order: () => terminalThenable
      }

      return {
        insert: () => terminalThenable,
        select: () => selectBuilder
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
      getUser: async () => errorResponse('Auth no está configurado'),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
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
