// Utilidades para manejo de tiempo civil y UTC (Default: America/Lima, UTC-5)
// El sistema garantiza que lo configurado en el admin sea lo que se vea en la invitación.

export const PERU_TIMEZONE = 'America/Lima';

/**
 * Convierte cualquier entrada de hora a formato estricto 24h (HH:mm).
 * Maneja AM/PM y formatos de 24h directos.
 * 
 * REGLA ESPECIAL CRÍTICA:
 * - Un "12:xx" SIN indicador AM/PM se asume como 12:xx PM (mediodía)
 * - Un "12:xx AM" SIEMPRE se convierte a "00:xx" (medianoche)
 * - Un "12:xx PM" o "12:xx" SIEMPRE se convierte a "12:xx" (mediodía)
 * 
 * Esta función NUNCA debe convertir "12:30 PM" a "00:30".
 */
export function validateAndFormatTime(timeInput: string | undefined | null): string {
    if (!timeInput) return '12:00';

    const clean = (timeInput || '').trim().toUpperCase();
    const pmRegex = /P\.?M\.?/;
    const amRegex = /A\.?M\.?/;
    const hasPM = pmRegex.test(clean);
    const hasAM = amRegex.test(clean);

    const timeMatch = clean.match(/(\d{1,2}):(\d{1,2})/);
    if (!timeMatch) return '12:00';

    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    // ===== LÓGICA EXPLÍCITA =====
    if (hasPM) {
        // Explícitamente PM: 1 PM -> 13, 12 PM -> 12, etc.
        if (hour !== 12) {
            hour = hour + 12;  // 1-11 PM -> 13-23
        }
        // 12 PM se mantiene como 12
    } else if (hasAM) {
        // Explícitamente AM: 12 AM -> 00, 1 AM -> 01, etc.
        if (hour === 12) {
            hour = 0;  // 12 AM -> 00 (medianoche)
        }
        // 1-11 AM se mantiene igual
    } else {
        // SIN indicador AM/PM:
        // Un "12:xx" sin contexto se asume como 12:xx PM (MEDIODÍA)
        // porque es lo que un usuario seleccionaría en un timepicker 12h
        if (hour === 12) {
            // "12:xx" -> se mantiene como 12 (MEDIODÍA, NO convertir a 0)
            // No hacer nada
        }
        // Otras horas (1-11) se asumen como AM
        // Horas 13-23 ya están en formato 24h
    }

    const finalHour = Math.max(0, Math.min(23, hour));
    const finalMinute = Math.max(0, Math.min(59, minute));

    return `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;
}

/**
 * Formatea una hora 24h (HH:mm) a un formato legible para el invitado (h:mm AM/PM).
 * Convierte correctamente:
 * - 00:00 -> 12:00 a. m. (medianoche)
 * - 12:00 -> 12:00 p. m. (mediodía)
 * - 13:00 -> 1:00 p. m.
 * 
 * NOTA: Asume que la entrada está en formato 24h estricto (HH:mm)
 */
export function formatTimeForDisplay(time24h: string | undefined | null): string {
    if (!time24h) return '';

    // Limpiar y normalizar - pero SIN hacer inferencias sobre AM/PM
    let timeStr = (time24h || '').trim();

    // Extraer solo números (por si viene con AM/PM)
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return '';

    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);

    // Validar rango 24h
    if (h < 0 || h > 23 || m < 0 || m > 59) return '';

    // Determinar AM/PM basado ÚNICAMENTE en valor 24h
    const ampm = (h >= 12 && h <= 23) ? 'p. m.' : 'a. m.';

    // Convertir a 12h
    let h12: number;
    if (h === 0) {
        h12 = 12;  // 00:xx -> 12:xx (midnight)
    } else if (h <= 11) {
        h12 = h;   // 01:xx-11:xx -> 1:xx-11:xx (morning)
    } else if (h === 12) {
        h12 = 12;  // 12:xx -> 12:xx (noon)
    } else {
        h12 = h - 12;  // 13:xx-23:xx -> 1:xx-11:xx (afternoon/evening)
    }

    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Convierte componentes 12h a string 24h (HH:mm).
 * 12:xx AM -> 00:xx (midnight hour)
 * 12:xx PM -> 12:xx (noon hour)
 * 1-11 AM -> 01-11 (morning)
 * 1-11 PM -> 13-23 (afternoon/evening)
 * 
 * NOTA: Esta función siempre retorna la hora en formato 24h puro sin AM/PM.
 */
export function convert12hTo24h(hour: number, minute: number, ampm: 'AM' | 'PM'): string {
    let h = hour;

    // La hora 12 es especial en formato 12h
    if (h === 12) {
        if (ampm === 'AM') {
            // 12:xx AM -> 00:xx (medianoche)
            h = 0;
        } else {
            // 12:xx PM -> 12:xx (mediodía)
            h = 12;
        }
    } else {
        // Horas 1-11
        if (ampm === 'PM') {
            // 1-11 PM -> 13-23
            h = hour + 12;
        } else {
            // 1-11 AM -> 01-11
            h = hour;
        }
    }

    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Convierte string 24h a componentes 12h.
 * Maneja datos sucios (con AM/PM en el string) y limpia el formato 24h.
 * Para la hora 12 (mediodía):
 *   - 12:00 en 24h SIEMPRE es PM (noon)
 *   - 00:00 en 24h SIEMPRE es AM (midnight)
 */
export function convert24hTo12h(time24h: string | undefined | null): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
    if (!time24h) return { hour: 12, minute: 0, ampm: 'PM' };

    // Primero normalizamos a formato estricto 24h (HH:mm) para manejar entradas mezcladas (12h/24h)
    const normalized = validateAndFormatTime(time24h);
    const [hStr, mStr] = normalized.split(':');

    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    // Determinar AM/PM basado ÚNICAMENTE en el valor 24h
    // 00:00-11:59 -> AM
    // 12:00-23:59 -> PM
    const ampm = (h >= 12 && h <= 23) ? 'PM' : 'AM';

    // Convertir a formato 12h
    let hour12: number;
    if (h === 0) {
        hour12 = 12;  // 00:xx -> 12:xx (midnight)
    } else if (h <= 11) {
        hour12 = h;   // 01:xx-11:xx -> 1:xx-11:xx (morning)
    } else if (h === 12) {
        hour12 = 12;  // 12:xx -> 12:xx (noon)
    } else {
        hour12 = h - 12;  // 13:xx-23:xx -> 1:xx-11:xx (afternoon/evening)
    }

    return { hour: hour12, minute: m, ampm };
}

/**
 * Combina una fecha civil (YYYY-MM-DD) y una hora civil (HH:mm) en un ISO String UTC.
 * Asume que la entrada es en hora de Lima (UTC-5).
 * 
 * Ejemplo: Si en Lima es "2026-02-10" a las "18:00" (6:00 PM),
 * en UTC será "2026-02-10T23:00:00.000Z" (11:00 PM UTC).
 */
export function localToUTC(fechaLocal: string, horaLocal: string): string | null {
    if (!fechaLocal || !horaLocal) return null;

    const dateParts = fechaLocal.split('-').map(Number);
    const time24h = validateAndFormatTime(horaLocal);
    const [h, m] = time24h.split(':').map(Number);

    if (dateParts.length !== 3) return null;

    // Crear la fecha interpretando los valores como hora LOCAL de Lima
    // Usamos un string ISO que el navegador interpretará en la zona horaria local,
    // luego obtenemos el timestamp UTC correcto
    const year = dateParts[0];
    const month = dateParts[1] - 1; // Los meses en JS son 0-indexed
    const day = dateParts[2];

    // Crear fecha en UTC con los valores dados
    const dateUTC = new Date(Date.UTC(year, month, day, h, m, 0, 0));

    // Ajustar por el offset de Lima (UTC-5 = -300 minutos)
    // Si en Lima son las 18:00, en UTC son las 23:00 (18 + 5)
    const LIMA_OFFSET_MINUTES = -5 * 60; // UTC-5 = -300 minutos
    const adjustedTimestamp = dateUTC.getTime() - (LIMA_OFFSET_MINUTES * 60 * 1000);

    return new Date(adjustedTimestamp).toISOString();
}

/**
 * Extrae la hora en formato 24h a partir de un ISO String UTC, ajustado a Lima.
 */
export function UTCToLocal24h(utcTime: string | undefined | null): string {
    if (!utcTime) return '12:00';
    try {
        const date = new Date(utcTime);
        if (isNaN(date.getTime())) return '12:00';

        return new Intl.DateTimeFormat('en-GB', {
            timeZone: PERU_TIMEZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        return '12:00';
    }
}

/**
 * Utilidad crucial para el Countdown y componentes visuales: 
 * Parsea una fecha de forma segura para evitar NaN en navegadores móviles (Android/WhatsApp/iOS).
 * Sanitiza formatos con espacios ("YYYY-MM-DD HH:mm:ss") convirtiéndolos a ISO ("YYYY-MM-DDTHH:mm:ss").
 */
export function safeNewDate(dateInput: any): Date {
    if (!dateInput) return new Date();

    // Si ya es un objeto Date
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? new Date() : dateInput;
    }

    try {
        const dateStr = String(dateInput).trim();

        // 0. Si el string contiene "NaN", retornar fecha actual (o una muy lejana si es para countdown)
        if (dateStr.toLowerCase().includes('nan')) {
            return new Date();
        }

        // 1. Intentar limpiar formato común de DB: "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
        // Reemplazar el espacio por T si detectamos patrón de fecha ISO-like
        let sanitized = dateStr;
        if (/^\d{4}-\d{2}-\d{2}\s/.test(dateStr)) {
            sanitized = dateStr.replace(' ', 'T');
        }

        const d = new Date(sanitized);

        // 2. Si falló el parsing nativo (Invalid Date)
        if (isNaN(d.getTime())) {
            // Intento desesperado: Extraer solo la fecha YYYY-MM-DD
            const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const [_, y, m, day] = match;
                const fallback = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
                return isNaN(fallback.getTime()) ? new Date() : fallback;
            }
            return new Date(); // Fallback final
        }

        return d;
    } catch (e) {
        return new Date();
    }
}

export function formatTimeDisplay(t: string | undefined | null) { return formatTimeForDisplay(t); }
export function UTCToLocal(utc: string | undefined | null) { return formatTimeForDisplay(UTCToLocal24h(utc)); }

/**
 * Helper para compatibilidad con Countdown antiguo.
 * Convierte fecha y hora local a timestamp UTC.
 */
export function getEventTimestampUTC(date: string, time: string): number {
    const iso = localToUTC(date, time);
    if (!iso) return 0;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? 0 : d.getTime();
}
