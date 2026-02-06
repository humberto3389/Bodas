# 🐛 Fix: Error Crítico de Recarga de Página - Cliente Equivocado

## Problema Reportado
Cuando un usuario estaba en la página de invitación de un cliente (ej: `/invitacion/juan`) y recargaba la página (F5), se cargaban los datos de otro cliente (ej: `/invitacion/miguel`).

### Ejemplo del Bug
1. Usuario accede: `https://bodas-ez22.vercel.app/invitacion/juan`
2. Ve correctamente los datos de Juan (novios, fecha, horario de Juan)
3. Presiona F5 para recargar
4. **¡BUG!** Ahora aparecen los datos de Miguel en lugar de Juan

## Causa Raíz

El hook `useInvitation.ts` tenía una lógica de optimización que causaba el problema:

```typescript
// ❌ CÓDIGO ORIGINAL (CON BUG)
if (initialData && refreshTrigger === 0 && !refresh && !urlClient) {
    setUrlClient(initialData);  // ← Usa datos viejos sin verificar subdominio
    setLoading(false);
    return;  // ← Retorna SIN cargar del BFF
}
```

### El Problema Específico

Cuando navegas entre diferentes rutas con subdominio:
- `/invitacion/juan` → `/invitacion/miguel`

React **reutiliza el mismo componente `App`** (para optimizar). El estado de `useInvitation` nunca se limpiaba completamente.

Si el usuario hace esto rápidamente:
1. Carga `/invitacion/juan` → BFF trae datos de Juan
2. Navega a `/invitacion/miguel` → Los datos se actualizan
3. Recarga página mientras está en Miguel
4. El hook ve que hay datos en `urlClient` y los reutiliza → Pero esos datos podrían ser de Juan del paso anterior si el cleanup no fue perfecto

## Solución Implementada

Se modificó `src/hooks/useInvitation.ts` para **SIEMPRE cargar desde el BFF**:

```typescript
// ✅ CÓDIGO ARREGLADO
useEffect(() => {
    const loadClient = async () => {
        if (!subdomain) return;

        setLoading(true);
        try {
            // SIEMPRE cargar desde el BFF con el subdomain actual
            const bffData = await fetchWeddingDataFromBFF(subdomain, refresh || refreshTrigger > 0);
            const mappedClient = mapClientDataFromBFF(bffData.client);
            setUrlClient(mappedClient);
            setMessages(bffData.messages || []);
            // ... resto de datos
        } finally {
            setLoading(false);
        }
    };

    loadClient();
}, [subdomain, refresh, refreshTrigger]); // ← subdomain en dependencias asegura recargar al cambiar
```

### Por Qué Funciona

1. **`subdomain` en las dependencias**: Cada vez que la URL cambia (`/juan` → `/miguel`), el useEffect se ejecuta
2. **Sin skip de carga**: Se elimina la condición que saltaba la carga del BFF
3. **Fuente de verdad única**: El BFF SIEMPRE decide qué cliente mostrar basado en el subdomain
4. **Caché seguro**: El BFF cachea por subdomain, así que Juan y Miguel tienen cachés separadas

## Impacto

### ✅ Casos Ahora Arreglados

| Caso | Antes | Después |
|------|-------|---------|
| `/invitacion/juan` + F5 | Podía mostrar Miguel | ✅ Muestra Juan |
| Juan → Miguel (click) | Podía quedar mezclado | ✅ Muestra Miguel |
| Cambiar URL en address bar | Datos inconsistentes | ✅ Datos correctos |
| Recargar rápido | Mostrar cliente equivocado | ✅ Cliente correcto |

### Rendimiento

**Mínimo impacto** porque:
- El BFF tiene caché de 15 segundos por subdominio
- Las recargas rápidas sirven desde caché
- No hay cambio en la lógica de Realtime o mensajes

## Archivos Modificados

- `src/hooks/useInvitation.ts` - Hook de invitación (líneas 1-40)

## Validación

✅ Build compile sin errores  
✅ No hay regresiones en otros hooks  
✅ La lógica de Realtime sigue intacta  
✅ El caching del BFF sigue funcionando  

## Notas

- **Seguridad mejorada**: Ahora es imposible ver datos de otro cliente si cambias la URL
- **UX mejorada**: Las recarga de página funciona como se espera
- **Fiabilidad**: El subdominio de la URL es la fuente de verdad

---

**Fecha de fix**: 5 de Febrero 2026  
**Bug crítico**: Sí (Violación de privacidad entre clientes)
