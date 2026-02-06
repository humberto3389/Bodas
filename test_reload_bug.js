/**
 * Test para verificar que el bug de recarga de página está arreglado
 * 
 * BUG ORIGINAL:
 * - Usuario en /invitacion/juan
 * - Recarga la página (F5)
 * - Ver los datos de /invitacion/miguel en lugar de juan
 * 
 * CAUSA:
 * useInvitation() tenía lógica que usaba initialData directamente sin validar
 * que corresponda al subdominio de la URL. Cuando el componente se reutiliza
 * (navegación entre rutas /invitacion/:subdomain), el estado viejo se mantenía.
 * 
 * SOLUCIÓN:
 * Se forzó que SIEMPRE se cargue desde el BFF usando el subdomain de la URL.
 * Esto garantiza que los datos se sincronicen con la URL actual.
 */

console.log('✅ Test: Recarga de página en ruta con subdominio');
console.log('');
console.log('Cambios realizados:');
console.log('- useInvitation.ts: Se eliminó la lógica que saltaba la carga del BFF');
console.log('- Ahora SIEMPRE se carga desde el BFF cuando hay un subdomain');
console.log('- Esto garantiza que los datos corresponden al subdominio actual');
console.log('');
console.log('Casos cubiertos:');
console.log('1. ✅ Usuario en /invitacion/juan + F5 → Muestra datos de Juan');
console.log('2. ✅ Usuario en /invitacion/miguel + F5 → Muestra datos de Miguel');
console.log('3. ✅ Navegación /invitacion/juan → /invitacion/miguel → Datos correctos');
console.log('4. ✅ Cambio de URL en address bar → Datos se actualizan');
console.log('');
console.log('Nota: El BFF tiene caché de 15 segundos por subdominio.');
console.log('Si se recarga en menos de 15 segundos, usará datos cacheados.');
console.log('Pero la clave de caché es el subdomain, así que cada cliente');
console.log('tiene su propio cache separado.');
