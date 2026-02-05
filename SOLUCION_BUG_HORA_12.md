# Solución para Bug: Hora 12 siempre muestra AM

## El Problema
Cuando el usuario selecciona 12:30 PM en cualquiera de los TimePickers (ceremonia o recepción):
- ✓ Se guarda correctamente en la BD como "12:30"
- ✗ Pero los invitados ven "12:30 a. m." en lugar de "12:30 p. m."

## La Causa Raíz
El problema está en cómo se interpreta un valor "12:xx" **sin indicador AM/PM explícito**:
- En un formato 12h, "12" siempre significa el mediodía (12:xx PM)
- Pero la función `validateAndFormatTime` trataba "12:xx" como ambiguo

## La Solución Implementada

### 1. **validateAndFormatTime()** - Interpretación correcta de "12:xx"
```typescript
// ANTES: "12:30" sin contexto -> podría ser 00:30 o 12:30
// DESPUÉS: "12:30" sin contexto -> SIEMPRE 12:30 (mediodía)

if (hour === 12 && !hasPM && !hasAM) {
    // Un "12:xx" sin indicador se asume como 12:xx PM
    // No convertir a 00 ni a nada
}
```

### 2. **formatTimeForDisplay()** - Mostrar correctamente el AM/PM
```typescript
// Determinación clara del AM/PM basada SOLO en el valor 24h
const ampm = (h >= 12 && h <= 23) ? 'p. m.' : 'a. m.';

// Para h=12: (12 >= 12) = true -> 'p. m.' ✓
// Para h=0: (0 >= 12) = false -> 'a. m.' ✓
```

### 3. **convert24hTo12h()** - Conversión de 24h a 12h
Convierte explícitamente cada rango:
- `00:xx` -> `12:xx AM` (medianoche)
- `01-11:xx` -> `1-11:xx AM` (mañana)
- `12:xx` -> `12:xx PM` (mediodía)
- `13-23:xx` -> `1-11:xx PM` (tarde/noche)

### 4. **convert12hTo24h()** - Conversión de 12h a 24h
Maneja correctamente la hora especial 12:
- `12:xx AM` -> `00:xx` (medianoche)
- `12:xx PM` -> `12:xx` (mediodía)
- `1-11:xx AM` -> `01-11:xx`
- `1-11:xx PM` -> `13-23:xx`

## Flujo Correcto Después del Fix

```
SELECCIÓN EN ADMIN:
Usuario selecciona: 12:30 PM en TimePicker
  ↓
convert12hTo24h(12, 30, 'PM')
  ↓
Retorna: "12:30"
  ↓
Guardado en BD: wedding_time = "12:30"

VISUALIZACIÓN EN INVITACIÓN:
Carga desde BD: "12:30"
  ↓
formatTimeForDisplay("12:30")
  ↓
Interpreta: h=12, ampm='p. m.'
  ↓
Muestra al invitado: "12:30 p. m." ✓
```

## Cambios en timezone-utils.ts
- **validateAndFormatTime()**: Clarificado que "12:xx" sin AM/PM = mediodía
- **formatTimeForDisplay()**: Removido llamada a validateAndFormatTime, directo a regex
- **convert24hTo12h()**: Lógica explícita para cada rango horario
- **convert12hTo24h()**: Lógica explícita para hora 12

## Resultado Final
✅ Hora 12:30 PM ahora se muestra correctamente como "12:30 p. m."
✅ Hora 12:00 PM ahora se muestra correctamente como "12:00 p. m."
✅ Todas las otras horas siguen funcionando correctamente
