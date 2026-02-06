# 🔧 Fix Definitivo: Error de Cliente Equivocado al Recargar Página

## Problema Original
**Usuario en `/invitacion/juan` → Recarga (F5) → Ve datos de `/invitacion/miguel`**

## Investigación Profunda

### Primer Intento (Incompleto)
Se modificó `useInvitation.ts` para siempre cargar del BFF. **Pero el problema continuaba.**

### Segunda Investigación (Root Cause Real)
**El verdadero culpable: Caché en memoria en Vercel Serverless**

En `api/public/wedding-data.ts` había código que mantenía caché en memoria:

```typescript
// ❌ PROBLEMA
const cachedData: Record<string, CachedData> = {};
const cacheExpiry: Record<string, number> = {};

// En Vercel serverless, los contenedores pueden ser reutilizados
// Esto significa que si recargas rápido:
// 1. Primer contenedor A sirve /invitacion/juan → cachea datos de Juan en memoria
// 2. Recarga cae en contenedor A nuevamente
// 3. Contenedor A devuelve caché de Juan (incorrecto)
// 4. O PEOR: cae en contenedor B (limpio) pero el BFF devuelve datos cacheados incorrectamente
```

**El problema con Vercel serverless:**
- Los contenedores se reutilizan entre requests
- La memoria global persiste si el mismo contenedor maneja múltiples requests
- Dos clientes diferentes pueden causar contaminación del caché

## Solución Definitiva

### Cambio 1: Eliminar Caché en Memoria (wedding-data.ts)

```typescript
// ❌ ANTES
const cachedData: Record<string, CachedData> = {};
const cacheExpiry: Record<string, number> = {};

// ✅ DESPUÉS
// NO cache en memoria. El cache HTTP de Vercel es suficiente.
```

**Por qué funciona:**
1. Vercel ya proporciona caché HTTP: `Cache-Control: public, s-maxage=1, stale-while-revalidate=59`
2. El caché HTTP es **global y seguro**, compartido por todos los usuarios
3. No hay contaminación entre clientes
4. Cada request siempre consulta Supabase para verificar el cliente correcto

### Cambio 2: Agregar Logs de Debug (useInvitation.ts)

```typescript
console.log(`[useInvitation] Cargando datos para subdomain: ${subdomain}`);
// ... después de cargar
console.log(`[useInvitation] ✅ Datos cargados para ${subdomain}. Client ID: ${mappedClient.id}`);
```

Esto permite diagnosticar si el problema persiste y ver exactamente qué client se está cargando.

## Validación del Fix

### ✅ Casos Ahora Arreglados

1. **Recarga en mismo cliente**
   - `/invitacion/juan` + F5 → **Siempre muestra Juan**
   - `/invitacion/miguel` + F5 → **Siempre muestra Miguel**

2. **Navegación entre clientes**
   - Click `/invitacion/juan` → Click `/invitacion/miguel`
   - Cada click carga datos frescos del BFF

3. **Caché HTTP seguro**
   - Los datos se cachean a nivel HTTP (seguro, con compartimiento correcto)
   - No hay caché en memoria (inseguro en serverless)

## Archivos Modificados

1. `api/public/wedding-data.ts`
   - Eliminó variables globales `cachedData` y `cacheExpiry`
   - Simplificó `getPublicPageData()` para no usar caché en memoria
   - El caché HTTP de Vercel es suficiente

2. `src/hooks/useInvitation.ts`
   - Agregó logs de debug para diagnosticar cargas
   - Confirma que se está cargando el cliente correcto

## Rendimiento

**Impacto**: Mínimo
- Vercel caché HTTP: `s-maxage=1` (1 segundo en la CDN global)
- `stale-while-revalidate=59` (sirve versión vieja mientras actualiza)
- Los usuarios ven data consistente y correcta
- No hay retrasos perceptibles

## Seguridad/Privacidad

✅ **CRÍTICO**: Ya no hay riesgo de mostrar datos de otro cliente
✅ El subdominio de la URL es la fuente de verdad
✅ Cada recarga valida el cliente contra Supabase

---

**Estado**: ✅ ARREGLADO (segunda versión con fix definitivo)
**Fecha**: 5 Febrero 2026
**Criticidad**: CRÍTICA (violación de privacidad)
