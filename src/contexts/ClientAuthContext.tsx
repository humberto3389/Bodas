import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { type ClientToken, validateClientToken, getClientBySubdomain, mapSupabaseClientToToken } from '../lib/auth-system';
import { supabase } from '../lib/supabase';

interface ClientAuthContextType {
  client: ClientToken | null;
  isAuthenticated: boolean;
  login: (client: ClientToken) => void;
  logout: () => void;
  checkSubdomainAccess: () => ClientToken | null;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

interface ClientAuthProviderProps {
  children: ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [client, setClient] = useState<ClientToken | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para cargar y procesar datos del cliente
  const loadClientData = useCallback(async (savedClient: string) => {
    try {
      const clientData = JSON.parse(savedClient);
      const validatedClient = await validateClientToken(clientData.token);
      if (validatedClient) {
        // Fusionar datos validados con los guardados para preservar ediciones locales
        let merged = { ...validatedClient, ...clientData } as ClientToken;
        // Normalizar fechas si vinieron como string del sessionStorage
        (['createdAt', 'weddingDate', 'accessUntil', 'lastUsed'] as const).forEach((key) => {
          const value = merged[key] as unknown;
          if (typeof value === 'string') {
            if (key === 'weddingDate') {
              const s = String(value);
              const [y, m, d] = s.slice(0, 10).split('-').map(Number);
              if (y && m && d) {
                (merged as any)[key] = new Date(y, m - 1, d);
              } else {
                const dt = new Date(s);
                (merged as any)[key] = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
              }
            } else {
              (merged as any)[key] = new Date(value);
            }
          }
        });

        // Cargar datos actualizados desde Supabase si está disponible
        if (merged.id) {
          try {
            const { data: supabaseData, error } = await supabase
              .from('clients')
              .select('*')
              .eq('id', merged.id)
              .single();

            if (!error && supabaseData) {
              // Priorizar datos de Supabase (Source of Truth) sobre localStorage (Cache)
              // Usar el mapeo centralizado para garantizar coherencia en fechas y horas
              merged = mapSupabaseClientToToken(supabaseData);

              // Actualizar storage con datos de Supabase
              sessionStorage.setItem('clientAuth', JSON.stringify(merged));
            }
          } catch (err) {
            // Silencioso: si falla Supabase, usar datos de localStorage
            console.debug('[ClientAuth] No se pudieron cargar datos de Supabase, usando localStorage');
          }

          setClient(merged);
          setIsAuthenticated(true);
        } else {
          setClient(merged);
          setIsAuthenticated(true);
        }
      } else {
        // Token expirado o inválido
        sessionStorage.removeItem('clientAuth');
      }
    } catch (error) {
      sessionStorage.removeItem('clientAuth');
    }
  }, []);

  const login = useCallback((clientData: ClientToken) => {
    console.log('[ClientAuthContext] login() llamado. Guardando datos y disparando evento...');
    setClient(clientData);
    setIsAuthenticated(true);
    const dataStr = JSON.stringify(clientData);
    sessionStorage.setItem('clientAuth', dataStr);
    window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: dataStr } }));
  }, []);

  const logout = useCallback(() => {
    setClient(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('clientAuth');
  }, []);

  // Verificar si hay un cliente autenticado en sessionStorage y cargar desde Supabase
  useEffect(() => {
    const savedClient = sessionStorage.getItem('clientAuth');
    if (savedClient) {
      loadClientData(savedClient);
    }

    // Escuchar el evento custom que se dispara cuando localStorage cambia en la misma pestaña (desde Admin)
    const handleClientAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ clientAuth: string }>;
      if (customEvent.detail?.clientAuth) {
        try {
          const newClientData = JSON.parse(customEvent.detail.clientAuth);
          const currentClientId = client?.id;
          const newClientId = newClientData?.id;

          // Solo cargar si es el mismo usuario o si no hay usuario actual
          if (!currentClientId || currentClientId === newClientId) {
            loadClientData(customEvent.detail.clientAuth);
          } else {
            console.warn('[ClientAuthContext] Ignorando evento clientAuthUpdated: pertenece a otro usuario', {
              current: currentClientId,
              nuevo: newClientId
            });
          }
        } catch (err) {
          console.error('[ClientAuthContext] Error parseando datos de evento:', err);
        }
      }
    };

    // También escuchar el evento storage para cambios entre pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clientAuth') {
        // CRÍTICO: Verificar que el cambio pertenezca al mismo usuario
        if (e.newValue) {
          try {
            const newClientData = JSON.parse(e.newValue);
            const currentClientId = client?.id;
            const newClientId = newClientData?.id;

            // Solo cargar si es el mismo usuario o si no hay usuario actual
            if (!currentClientId || currentClientId === newClientId) {
              loadClientData(e.newValue);
            } else {
              console.warn('[ClientAuthContext] Ignorando cambio de storage: pertenece a otro usuario', {
                current: currentClientId,
                nuevo: newClientId
              });
            }
          } catch (err) {
            console.error('[ClientAuthContext] Error parseando datos de storage:', err);
          }
        } else {
          // Solo hacer logout si realmente no hay sesión en esta pestaña
          // o si el cambio viene de la misma sesión
          if (!client) {
            logout();
          }
        }
      }
    };

    window.addEventListener('clientAuthUpdated', handleClientAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('clientAuthUpdated', handleClientAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout, loadClientData]);

  const checkSubdomainAccess = useCallback((): ClientToken | null => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (parts.length <= 2) {
      // Estamos en el dominio principal
      return null;
    }

    // Quitar sufijo específico de despliegue si existe
    const subdomain = parts[0].replace('-invitacion', '');
    return getClientBySubdomain(subdomain);
  }, []);

  return (
    <ClientAuthContext.Provider value={{
      client,
      isAuthenticated,
      login,
      logout,
      checkSubdomainAccess
    }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
}
