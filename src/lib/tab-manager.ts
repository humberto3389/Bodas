/**
 * Sistema de gestión de pestañas para evitar conflictos de sesión
 * entre múltiples pestañas del mismo origen.
 * 
 * El problema: sessionStorage se comparte entre todas las pestañas del mismo origen.
 * Cuando un usuario inicia sesión en una pestaña, sobrescribe la sesión de otras pestañas.
 * 
 * Solución: Usar un ID único por pestaña y almacenar sesiones con ese ID.
 */

// Generar un ID único para esta pestaña
function generateTabId(): string {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Obtener o crear el ID de esta pestaña
let tabId: string | null = null;

export function getTabId(): string {
  if (!tabId) {
    // Intentar obtener de sessionStorage (persiste durante la sesión de la pestaña)
    const stored = sessionStorage.getItem('_tabId');
    if (stored) {
      tabId = stored;
    } else {
      // Generar nuevo ID y guardarlo
      tabId = generateTabId();
      sessionStorage.setItem('_tabId', tabId);
    }
  }
  return tabId;
}

/**
 * Almacena la sesión del cliente con el ID de la pestaña
 */
export function storeClientSession(clientData: any, tabId: string): void {
  const sessionData = {
    client: clientData,
    tabId: tabId,
    timestamp: Date.now()
  };
  sessionStorage.setItem('clientAuth', JSON.stringify(clientData));
  // También guardar en localStorage con el tabId para rastreo entre pestañas
  localStorage.setItem(`clientAuth_${tabId}`, JSON.stringify(sessionData));
  // Guardar el tabId actual en sessionStorage para referencia rápida
  sessionStorage.setItem('_currentTabId', tabId);
}

/**
 * Obtiene la sesión del cliente verificando que corresponda a esta pestaña
 */
export function getClientSession(): { client: any; tabId: string } | null {
  const currentTabId = getTabId();
  
  // Primero intentar obtener de sessionStorage (comportamiento normal)
  const sessionData = sessionStorage.getItem('clientAuth');
  if (sessionData) {
    try {
      const client = JSON.parse(sessionData);
      // Verificar que la sesión corresponde a esta pestaña
      const storedTabId = sessionStorage.getItem('_currentTabId');
      if (storedTabId === currentTabId) {
        return { client, tabId: currentTabId };
      }
    } catch (e) {
      console.error('[TabManager] Error parseando sesión:', e);
    }
  }
  
  // Si no hay sesión en sessionStorage, verificar en localStorage con el tabId
  const localStorageKey = `clientAuth_${currentTabId}`;
  const stored = localStorage.getItem(localStorageKey);
  if (stored) {
    try {
      const sessionData = JSON.parse(stored);
      if (sessionData.tabId === currentTabId) {
        // Restaurar en sessionStorage
        sessionStorage.setItem('clientAuth', JSON.stringify(sessionData.client));
        sessionStorage.setItem('_currentTabId', currentTabId);
        return sessionData;
      }
    } catch (e) {
      console.error('[TabManager] Error parseando sesión de localStorage:', e);
    }
  }
  
  return null;
}

/**
 * Limpia la sesión del cliente para esta pestaña
 */
export function clearClientSession(): void {
  const currentTabId = getTabId();
  sessionStorage.removeItem('clientAuth');
  sessionStorage.removeItem('_currentTabId');
  localStorage.removeItem(`clientAuth_${currentTabId}`);
}

/**
 * Verifica si hay un cambio de sesión en otra pestaña
 * Retorna true si la sesión actual no corresponde a esta pestaña
 */
export function checkSessionConflict(): boolean {
  const currentTabId = getTabId();
  const storedTabId = sessionStorage.getItem('_currentTabId');
  
  // Si hay una sesión pero el tabId no coincide, hay un conflicto
  const sessionData = sessionStorage.getItem('clientAuth');
  if (sessionData && storedTabId && storedTabId !== currentTabId) {
    console.warn('[TabManager] Conflicto de sesión detectado:', {
      currentTabId,
      storedTabId
    });
    return true;
  }
  
  return false;
}

/**
 * Limpia todas las sesiones de otras pestañas (solo para esta pestaña)
 * Esto se llama cuando se detecta un conflicto
 */
export function clearOtherTabsSessions(): void {
  const currentTabId = getTabId();
  
  // Limpiar todas las entradas de localStorage que no sean de esta pestaña
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('clientAuth_') && !key.endsWith(`_${currentTabId}`)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
